import { getMenu, getPages, getPolicies } from "./shopify";
import { localHref } from "./links";
import { site } from "@/site.config";

const hasContact = Boolean(site.contact?.email || site.contact?.whatsapp);

/**
 * 1) Se existir o menu "footer" (Loja virtual > Navegação), ele define as colunas.
 * 2) Senão, usa as colunas de site.config.js, mostrando só links de páginas que EXISTEM na Shopify.
 * As políticas (privacidade, termos, devoluções, envio) vêm de Configurações > Políticas.
 */
export async function getFooter() {
  const [menu, pages, policies] = await Promise.all([
    getMenu(site.footer.menuHandle).catch(() => null),
    getPages().catch(() => []),
    getPolicies().catch(() => []),
  ]);
  const pageSet = new Set(pages.map((p) => p.handle));
  if (hasContact) pageSet.add("contato");

  let columns = [];
  if (menu?.items?.length) {
    const loose = [];
    for (const item of menu.items) {
      if (item.items?.length) {
        columns.push({
          title: item.title,
          links: item.items.map((c) => ({ label: c.title, ...localHref(c.url) })),
        });
      } else {
        loose.push({ label: item.title, ...localHref(item.url) });
      }
    }
    if (loose.length) columns.unshift({ title: site.footer.menuFallbackTitle, links: loose });
  } else {
    columns = site.footer.columns
      .map((col) => ({
        title: col.title,
        links: col.links
          .filter((l) => pageSet.has(l.page))
          .map((l) => ({ label: l.label, href: `/pagina/${l.page}`, external: false })),
      }))
      .filter((c) => c.links.length);
  }

  const used = new Set(columns.flatMap((c) => c.links.map((l) => l.href)));
  const policyLinks = policies
    .map((p) => ({ label: p.title, href: `/politicas/${p.handle}` }))
    .filter((l) => !used.has(l.href));

  return { columns, policies: policyLinks, hasHelp: pageSet.has("duvidas") };
}
