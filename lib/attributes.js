// Atributos de categoria da Shopify (Material do calçado, Gênero alvo, Tipo de fechamento...)
// ficam em metacampos do produto (namespace "shopify" por padrão).

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const humanize = (h) => h.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());

// Lista única de {namespace, key} a pedir à Storefront API (chaves ausentes voltam como null)
export function metafieldIdentifiers(attrs) {
  const seen = new Set();
  const out = [];
  for (const a of attrs) {
    for (const key of a.keys) {
      const namespace = a.namespace || "shopify";
      const id = `${namespace}.${key}`;
      if (!seen.has(id)) { seen.add(id); out.push({ namespace, key }); }
    }
  }
  return out;
}

const fieldVal = (n, k) => n?.fields?.find((f) => f.key === k)?.value;
const nodeLabel = (n) => fieldVal(n, "label") || fieldVal(n, "name") || fieldVal(n, "value") || (n?.handle ? humanize(n.handle) : null);

function richText(node) {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  return (node.children || []).map(richText).join(node.type === "root" ? "\n" : " ").trim();
}

// Converte qualquer tipo de metacampo em uma lista de textos para exibir
export function extractValues(mf) {
  if (!mf) return [];
  const nodes = mf.references?.nodes?.filter(Boolean) ?? (mf.reference ? [mf.reference] : []);
  const labels = nodes.map(nodeLabel).filter(Boolean);
  if (labels.length) return labels;

  const v = mf.value;
  if (v == null || v === "") return [];
  const t = mf.type || "";
  try {
    if (t === "rich_text_field") return [richText(JSON.parse(v))].filter(Boolean);
    if (t.startsWith("list.")) {
      return JSON.parse(v)
        .map((x) => (x && typeof x === "object" ? (x.value != null ? `${x.value} ${x.unit || ""}`.trim() : "") : String(x)))
        .filter((x) => x && !x.startsWith("gid://"));
    }
    if (t === "boolean") return [v === "true" ? "Sim" : "Não"];
    if (["dimension", "weight", "volume", "rating"].includes(t)) {
      const o = JSON.parse(v);
      return [`${o.value} ${o.unit || ""}`.trim()];
    }
    if (t === "json") return [];
  } catch {}
  return v.startsWith("gid://") ? [] : [v];
}

/**
 * attrs: lista de site.config.js · identifiers: o que foi pedido · metafields: resposta (mesma ordem)
 * Retorna [{ label, values, headline, block }] só com o que o produto realmente tem preenchido.
 */
export function resolveAttributes(attrs, identifiers, metafields = []) {
  const index = new Map(identifiers.map((id, i) => [`${id.namespace}.${id.key}`, metafields[i]]));
  const out = [];
  for (const a of attrs) {
    for (const key of a.keys) {
      const values = extractValues(index.get(`${a.namespace || "shopify"}.${key}`));
      if (values.length) {
        out.push({ label: a.label, values, headline: !!a.headline, block: !!a.block });
        break;
      }
    }
  }
  return out;
}

// Não repetir como "detalhe" o que já é uma opção selecionável (Cor, Tamanho...)
export function withoutOptions(attributes, optionNames) {
  const names = new Set(optionNames.map(norm));
  return attributes.filter((a) => !names.has(norm(a.label)));
}
