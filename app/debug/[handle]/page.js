import { notFound } from "next/navigation";
import { extractValues, metafieldIdentifiers } from "@/lib/attributes";
import { getProduct } from "@/lib/shopify";
import { site } from "@/site.config";

// Só em desenvolvimento: mostra o que a Shopify devolve para cada atributo do produto.
export default async function Debug({ params }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const ids = metafieldIdentifiers(site.attributes);
  const options = [...new Set(product.variants.nodes.flatMap((v) => v.selectedOptions.map((o) => o.name)))];

  return (
    <div className="wrap page">
      <h1>Diagnóstico: {product.title}</h1>
      <p className="muted">Opções de variante: <strong>{options.join(", ") || "nenhuma"}</strong></p>
      <table className="debug">
        <thead><tr><th>Metacampo</th><th>Status</th><th>Valores lidos</th></tr></thead>
        <tbody>
          {ids.map((id, i) => {
            const mf = product.metafields[i];
            const vals = extractValues(mf);
            const status = !mf ? "não encontrado / sem acesso na Storefront" : vals.length ? "ok" : "existe, mas sem valores legíveis (ver README)";
            return (
              <tr key={`${id.namespace}.${id.key}`} className={mf ? "found" : ""}>
                <td>{id.namespace}.{id.key}</td>
                <td>{status}</td>
                <td>{vals.join(" · ") || (mf ? `${mf.type}: ${String(mf.value).slice(0, 80)}` : "")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
