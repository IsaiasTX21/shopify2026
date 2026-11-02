// Converte URLs dos menus da Shopify (/collections/x, /pages/y...) em rotas deste site.
export function localHref(url) {
  const shop = process.env.SHOPIFY_STORE_DOMAIN || "";
  if (!url) return { href: "/", external: false };
  let u;
  try { u = new URL(url, `https://${shop}`); } catch { return { href: url, external: true }; }

  const isShop = u.hostname === shop || u.hostname.endsWith(".myshopify.com") || u.hostname === "shopify.com";
  if (!isShop) return { href: u.toString(), external: true };

  const p = u.pathname.replace(/\/+$/, "") || "/";
  let m;
  if (p === "/") return { href: "/", external: false };
  if (p === "/collections" || p === "/collections/all") return { href: "/loja", external: false };
  if ((m = p.match(/^\/collections\/([^/]+)/))) return { href: `/categorias/${m[1]}`, external: false };
  if ((m = p.match(/^\/products\/([^/]+)/))) return { href: `/produtos/${m[1]}`, external: false };
  if ((m = p.match(/^\/pages\/([^/]+)/))) return { href: `/pagina/${m[1]}`, external: false };
  if ((m = p.match(/^\/policies\/([^/]+)/))) return { href: `/politicas/${m[1]}`, external: false };
  if (p === "/search") return { href: "/busca", external: false };
  if (p === "/cart") return { href: "/carrinho", external: false };
  if (p.startsWith("/account")) return { href: "/conta", external: false };
  return { href: u.toString(), external: true };
}
