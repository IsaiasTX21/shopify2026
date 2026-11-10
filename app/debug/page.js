import { notFound } from "next/navigation";
import { accountsEnabled, discover } from "@/lib/customer";
import { getOrigin } from "@/lib/session";
import { getCollections, getMenu, getPages, getPolicies, getProducts } from "@/lib/shopify";
import { site } from "@/site.config";

// Só em desenvolvimento: confirma o que está realmente integrado com a Shopify.
export default async function Integrations() {
  if (process.env.NODE_ENV === "production") notFound();

  const checks = [
    ["Produtos (Storefront API)", async () => `${(await getProducts({ first: 20 })).length} produto(s) lido(s)`],
    ["Coleções = categorias", async () => (await getCollections(20)).map((c) => c.title).join(", ") || "nenhuma coleção publicada"],
    ["Páginas (Loja virtual > Páginas)", async () => (await getPages()).map((p) => p.handle).join(", ") || "nenhuma página criada"],
    [`Menu "${site.footer.menuHandle}" (Loja virtual > Navegação)`, async () => {
      const m = await getMenu(site.footer.menuHandle);
      return m ? `${m.items.length} item(ns): ${m.items.map((i) => i.title).join(", ")}` : "não existe; o rodapé usa as colunas do site.config.js";
    }],
    ["Políticas (Configurações > Políticas)", async () => (await getPolicies()).map((p) => p.title).join(", ") || "nenhuma política preenchida"],
    ["Endereços que o site envia no login (cadastre EXATAMENTE estes na Shopify)", async () => {
      const o = await getOrigin();
      return `Callback URI: ${o}/api/auth/callback  |  JavaScript origin: ${o}  |  Logout URI: ${o}`;
    }],
    ["Login de clientes (Customer Account API)", async () => {
      if (!accountsEnabled) return "DESATIVADO: defina SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID (o ícone usa a conta hospedada pela Shopify)";
      const d = await discover();
      return `ok · login: ${d.authorize ? "sim" : "não"} · API de pedidos: ${d.graphql ? "sim" : "não"}`;
    }],
  ];

  const rows = [];
  for (const [label, fn] of checks) {
    try { rows.push({ label, ok: true, text: await fn() }); }
    catch (e) { rows.push({ label, ok: false, text: e.message.slice(0, 300) }); }
  }

  return (
    <div className="wrap page">
      <h1>Integração com a Shopify</h1>
      <table className="debug">
        <thead><tr><th>Recurso</th><th></th><th>Resultado</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}><td>{r.label}</td><td>{r.ok ? "✅" : "❌"}</td><td>{r.text}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
