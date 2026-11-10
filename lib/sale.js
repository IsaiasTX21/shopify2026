import { t } from "./i18n";
import { getCollections, getProducts } from "./shopify";

// Produto em promoção = preço de comparação (Shopify) maior que o preço
export const priceOf = (p) => Number(p.priceRange.minVariantPrice.amount);
export const compareOf = (p) => Number(p.compareAtPriceRange.minVariantPrice.amount);
export const isOnSale = (p) => compareOf(p) > priceOf(p);
export const discountPct = (p) => (isOnSale(p) ? Math.round((1 - priceOf(p) / compareOf(p)) * 100) : 0);

// Entre os 100 mais vendidos, os que têm desconto (maior desconto primeiro)
export async function getSaleProducts() {
  const pool = await getProducts({ first: 100, sort: "best-selling" });
  return pool.filter(isOnSale).sort((a, b) => discountPct(b) - discountPct(a));
}

// Coleções da Shopify + a categoria virtual "Sale" (só aparece se houver produtos em promoção)
export async function getCategories() {
  const [cols, sale] = await Promise.all([
    getCollections(20).catch(() => []),
    getSaleProducts().catch(() => []),
  ]);
  return sale.length
    ? [...cols, { id: "sale", handle: "sale", title: t("nav.sale"), href: "/sale", isSale: true }]
    : cols;
}
