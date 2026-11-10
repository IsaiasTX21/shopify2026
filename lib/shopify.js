import { site } from "@/site.config";
import { HIDDEN_COLLECTIONS } from "./categories";
import { t } from "./i18n";
import { metafieldIdentifiers } from "./attributes";
import { colorCss, colorOf, resolveImages } from "./variants";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2026-07";

async function shopifyFetch({ query, variables = {}, revalidate = 60 }) {
  if (!domain || !token) {
    throw new Error("Defina SHOPIFY_STORE_DOMAIN e SHOPIFY_STOREFRONT_ACCESS_TOKEN no .env.local");
  }
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    ...(revalidate === 0 ? { cache: "no-store" } : { next: { revalidate } }),
  });
  if (!res.ok) throw new Error(`Shopify respondeu ${res.status}. Confira domínio e token.`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const IMG = "url altText width height";
const PRODUCT_CARD = `
  id handle title availableForSale
  featuredImage { ${IMG} }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  collections(first:5){ nodes { title handle } }
`;

/* ---------- Ordenação ---------- */
const PRODUCT_SORTS = {
  "best-selling": { key: "BEST_SELLING", reverse: false },
  newest: { key: "CREATED_AT", reverse: true },
  "price-asc": { key: "PRICE", reverse: false },
  "price-desc": { key: "PRICE", reverse: true },
  relevance: { key: "RELEVANCE", reverse: false },
};
const COLLECTION_SORTS = {
  "best-selling": { key: "BEST_SELLING", reverse: false },
  newest: { key: "CREATED", reverse: true },
  "price-asc": { key: "PRICE", reverse: false },
  "price-desc": { key: "PRICE", reverse: true },
};

/* ---------- Catálogo ---------- */
export async function getProducts({ first = 24, query = "", sort = "best-selling" } = {}) {
  const s = PRODUCT_SORTS[sort] ?? PRODUCT_SORTS["best-selling"];
  const data = await shopifyFetch({
    query: `query($first:Int!,$query:String,$sortKey:ProductSortKeys,$reverse:Boolean){
      products(first:$first, query:$query, sortKey:$sortKey, reverse:$reverse){
        nodes { ${PRODUCT_CARD} }
      }
    }`,
    variables: { first, query, sortKey: s.key, reverse: s.reverse },
  });
  return data.products.nodes;
}

export async function getCollections(first = 12) {
  const data = await shopifyFetch({
    query: `query($first:Int!){
      collections(first:$first, sortKey:TITLE){
        nodes { id handle title image { ${IMG} }
          products(first:1){ nodes { featuredImage { ${IMG} } } } }
      }
    }`,
    variables: { first },
    revalidate: 300,
  });
  return data.collections.nodes.filter(
    (c) => !HIDDEN_COLLECTIONS.includes(c.handle) && c.products.nodes.length > 0
  );
}

export async function getCollection(handle, sort, filters = []) {
  const s = COLLECTION_SORTS[sort];
  const data = await shopifyFetch({
    query: `query($handle:String!,$sortKey:ProductCollectionSortKeys,$reverse:Boolean,$filters:[ProductFilter!]){
      collection(handle:$handle){
        title description image { ${IMG} }
        products(first:48, sortKey:$sortKey, reverse:$reverse, filters:$filters){
          filters { id label type values { id label count input } }
          nodes { ${PRODUCT_CARD} }
        }
      }
    }`,
    variables: { handle, sortKey: s?.key ?? "COLLECTION_DEFAULT", reverse: s?.reverse ?? false, filters },
  });
  return data.collection;
}

export async function getSearch({ query, filters = [], first = 48 }) {
  const data = await shopifyFetch({
    query: `query($q:String!,$first:Int!,$filters:[ProductFilter!]){
      search(query:$q, first:$first, types:[PRODUCT], productFilters:$filters){
        productFilters { id label type values { id label count input } }
        nodes { ... on Product { ${PRODUCT_CARD} } }
      }
    }`,
    variables: { q: query, first, filters },
  });
  return {
    products: data.search.nodes.filter((n) => n && n.id),
    filters: data.search.productFilters ?? [],
  };
}

export async function getProduct(handle) {
  const identifiers = metafieldIdentifiers(site.attributes);
  const data = await shopifyFetch({
    query: `query($handle:String!,$ids:[HasMetafieldsIdentifier!]!){
      product(handle:$handle){
        ${PRODUCT_CARD}
        descriptionHtml
        images(first:20){ nodes { ${IMG} } }
        variants(first:100){ nodes {
          id title availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { ${IMG} }
        } }
        metafields(identifiers:$ids){
          namespace key type value
          reference { ... on Metaobject { handle type fields { key value } } }
          references(first:25){ nodes { ... on Metaobject { handle type fields { key value } } } }
        }
      }
    }`,
    variables: { handle, ids: identifiers },
  });
  return data.product;
}

export async function getPage(handle) {
  const data = await shopifyFetch({
    query: `query($handle:String!){ page(handle:$handle){ title body } }`,
    variables: { handle },
    revalidate: 300,
  });
  return data.page;
}

/* ---------- Carrinho (sem cache) ---------- */
const CART_FIELDS = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first:100){ nodes {
    id quantity
    cost { totalAmount { amount currencyCode } }
    merchandise { ... on ProductVariant {
      id title
      selectedOptions { name value }
      image { ${IMG} }
      product { id handle title featuredImage { ${IMG} } }
    } }
  } }
`;

const WARN = {
  MERCHANDISE_NOT_ENOUGH_STOCK: t("cart.stockAdjusted"),
  MERCHANDISE_OUT_OF_STOCK: t("cart.outOfStock"),
};

// A Shopify devolve, para variantes sem foto própria, a foto principal do produto
// (a camiseta branca, por exemplo). Aqui resolvemos a imagem REAL de cada variante
// para o carrinho não exibir a cor errada.
async function attachImages(cart) {
  if (!cart) return cart;
  const lines = cart.lines.nodes;
  const ids = [...new Set(lines.map((l) => l.merchandise?.product?.id).filter(Boolean))];
  let byProduct = new Map();
  if (ids.length) {
    try {
      const data = await shopifyFetch({
        query: `query($ids:[ID!]!){ nodes(ids:$ids){ ... on Product {
          id
          images(first:20){ nodes { ${IMG} } }
          variants(first:100){ nodes { id image { url } selectedOptions { name value } } }
        } } }`,
        variables: { ids },
        revalidate: 60,
      });
      byProduct = new Map(
        data.nodes.filter(Boolean).map((p) => [p.id, resolveImages(p.variants.nodes, p.images.nodes)])
      );
    } catch {}
  }
  for (const l of lines) {
    const v = l.merchandise;
    const map = byProduct.get(v.product?.id);
    const c = colorOf(v);
    l.resolvedImage = map ? map.get(v.id) ?? null : v.image ?? null;
    l.colorDot = c ? colorCss(c.value) : null;
  }
  return cart;
}

const pack = async (p) => ({
  cart: await attachImages(p?.cart ?? null),
  errors: [
    ...(p?.userErrors ?? []).map((e) => e.message),
    ...(p?.warnings ?? []).filter((w) => WARN[w.code]).map((w) => WARN[w.code]),
  ],
});

export async function getCart(cartId) {
  if (!cartId) return null;
  const data = await shopifyFetch({
    query: `query($id:ID!){ cart(id:$id){ ${CART_FIELDS} } }`,
    variables: { id: cartId },
    revalidate: 0,
  });
  return attachImages(data.cart);
}

export async function createCart(variantId, quantity = 1) {
  const data = await shopifyFetch({
    query: `mutation($lines:[CartLineInput!]){
      cartCreate(input:{lines:$lines}){ cart { ${CART_FIELDS} } userErrors { message } warnings { code message } }
    }`,
    variables: { lines: [{ merchandiseId: variantId, quantity }] },
    revalidate: 0,
  });
  return pack(data.cartCreate);
}

export async function addLines(cartId, variantId, quantity = 1) {
  const data = await shopifyFetch({
    query: `mutation($cartId:ID!,$lines:[CartLineInput!]!){
      cartLinesAdd(cartId:$cartId, lines:$lines){ cart { ${CART_FIELDS} } userErrors { message } warnings { code message } }
    }`,
    variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    revalidate: 0,
  });
  return pack(data.cartLinesAdd);
}

export async function updateLine(cartId, lineId, quantity) {
  const data = await shopifyFetch({
    query: `mutation($cartId:ID!,$lines:[CartLineUpdateInput!]!){
      cartLinesUpdate(cartId:$cartId, lines:$lines){ cart { ${CART_FIELDS} } userErrors { message } warnings { code message } }
    }`,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    revalidate: 0,
  });
  return pack(data.cartLinesUpdate);
}

export async function removeLine(cartId, lineId) {
  const data = await shopifyFetch({
    query: `mutation($cartId:ID!,$lineIds:[ID!]!){
      cartLinesRemove(cartId:$cartId, lineIds:$lineIds){ cart { ${CART_FIELDS} } userErrors { message } warnings { code message } }
    }`,
    variables: { cartId, lineIds: [lineId] },
    revalidate: 0,
  });
  return pack(data.cartLinesRemove);
}

/* ---------- Conteúdo da loja: menus, páginas e políticas ---------- */
export async function getMenu(handle) {
  const data = await shopifyFetch({
    query: `query($h:String!){ menu(handle:$h){ items { title url items { title url items { title url } } } } }`,
    variables: { h: handle },
    revalidate: 300,
  });
  return data.menu;
}

export async function getPages() {
  const data = await shopifyFetch({
    query: `query{ pages(first:100){ nodes { handle title } } }`,
    revalidate: 300,
  });
  return data.pages.nodes;
}

// Políticas configuradas em Configurações > Políticas
const POLICY_FIELDS = {
  "privacy-policy": "privacyPolicy",
  "refund-policy": "refundPolicy",
  "shipping-policy": "shippingPolicy",
  "terms-of-service": "termsOfService",
};

export async function getPolicies() {
  const data = await shopifyFetch({
    query: `query{ shop { ${Object.values(POLICY_FIELDS).map((f) => `${f} { handle title }`).join(" ")} } }`,
    revalidate: 300,
  });
  return Object.values(POLICY_FIELDS).map((f) => data.shop[f]).filter(Boolean);
}

export async function getPolicy(handle) {
  const field = POLICY_FIELDS[handle];
  if (!field) return null;
  const data = await shopifyFetch({
    query: `query{ shop { ${field} { title body handle } } }`,
    revalidate: 300,
  });
  return data.shop[field];
}
