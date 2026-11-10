// Utilidades para opções/variantes (Cor, Tamanho...) e para ligar cada variante à sua imagem.

export const isColorOption = (name) => /^(cor|cores|color|colour)$/i.test(name.trim());
export const colorOf = (variant) => variant.selectedOptions.find((o) => isColorOption(o.name)) || null;
const key = (u) => u.split("?")[0];

const SIZE_GROUPS = [["XXS"], ["XS"], ["PP"], ["P", "S"], ["M"], ["G", "L"], ["GG", "XL"], ["XGG", "XXL"], ["EG", "XXXL"]];
const rank = (v) => SIZE_GROUPS.findIndex((g) => g.includes(v.trim().toUpperCase()));

function sortValues(name, values) {
  if (isColorOption(name)) return values;
  if (values.every((v) => v.trim() !== "" && !isNaN(Number(v)))) {
    return [...values].sort((a, b) => Number(a) - Number(b));
  }
  if (values.every((v) => rank(v) >= 0)) return [...values].sort((a, b) => rank(a) - rank(b));
  return values;
}

export function getOptions(variants) {
  const map = new Map();
  for (const v of variants) {
    for (const o of v.selectedOptions) {
      if (!map.has(o.name)) map.set(o.name, []);
      const arr = map.get(o.name);
      if (!arr.includes(o.value)) arr.push(o.value);
    }
  }
  return [...map].map(([name, values]) => ({ name, values: sortValues(name, values) }));
}

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const COLORS = {
  branco: "#ffffff", branca: "#ffffff", white: "#ffffff", "off white": "#f1ede4",
  preto: "#111111", preta: "#111111", black: "#111111",
  vermelho: "#e11d2e", vermelha: "#e11d2e", red: "#e11d2e",
  azul: "#1d4ed8", blue: "#1d4ed8", "azul marinho": "#1e2a5a", marinho: "#1e2a5a", "azul royal": "#2346c8",
  "azul claro": "#7cc4ff", celeste: "#7cc4ff",
  verde: "#16a34a", green: "#16a34a", "verde militar": "#4b5d3a",
  amarelo: "#facc15", yellow: "#facc15", laranja: "#f97316", orange: "#f97316",
  rosa: "#ec4899", pink: "#ec4899", roxo: "#7c3aed", purple: "#7c3aed", lilas: "#c4b5fd",
  cinza: "#9ca3af", gray: "#9ca3af", grey: "#9ca3af", "cinza mescla": "#b8bcc4",
  marrom: "#7b4a2a", brown: "#7b4a2a", bege: "#d9c3a0", vinho: "#7a1f2b", bordo: "#7a1f2b",
  dourado: "#d4af37", prata: "#c0c0c0",
};
export const colorCss = (name) => COLORS[norm(name)] ?? null;

/* ---------- Imagem de cada variante ---------- */

// "branca"/"branco" -> "branc"
const stem = (w) => (w.length > 3 ? w.replace(/(a|o|e|as|os|es)$/, "") : w);

function nameWords(img) {
  let file = "";
  try { file = decodeURIComponent(img.url.split("?")[0].split("/").pop() || ""); } catch {}
  return new Set(
    norm(`${img.altText || ""} ${file}`).split(/[^a-z0-9]+/).filter(Boolean).map(stem)
  );
}

// Descobre, pelo texto alternativo ou nome do arquivo, a qual cor a imagem pertence
function colorByName(img, colors) {
  const words = nameWords(img);
  const hits = colors
    .map((c) => ({ c, t: norm(c).split(/[^a-z0-9]+/).filter(Boolean).map(stem) }))
    .filter((x) => x.t.length && x.t.every((t) => words.has(t)));
  if (!hits.length) return null;
  const max = Math.max(...hits.map((h) => h.t.length));
  const top = hits.filter((h) => h.t.length === max);
  return top.length === 1 ? top[0].c : null;
}

/**
 * Mapa variantId -> imagem REAL da variante (ou null se não der para saber).
 * A Storefront API devolve a foto principal do produto quando a variante não tem
 * foto própria. Se duas cores diferentes "apontam" para a mesma imagem, o vínculo
 * não é confiável e usamos o texto alternativo / nome do arquivo como alternativa.
 */
export function resolveImages(variants, images) {
  const colors = [...new Set(variants.map((v) => colorOf(v)?.value).filter(Boolean))];
  const out = new Map();
  for (const v of variants) {
    const c = colorOf(v);
    let img = null;
    if (v.image) {
      const k = key(v.image.url);
      const collides =
        c &&
        variants.some((o) => o.image && key(o.image.url) === k && colorOf(o) && colorOf(o).value !== c.value);
      if (!collides) img = images.find((i) => key(i.url) === k) || v.image;
    }
    if (!img && c) img = images.find((i) => colorByName(i, colors) === c.value) || null;
    out.set(v.id, img);
  }
  return out;
}

// Dada uma imagem da galeria, qual cor ela representa? (null se não souber)
export function colorOfImage(img, variants, resolved) {
  const k = key(img.url);
  for (const v of variants) {
    const r = resolved.get(v.id);
    const c = colorOf(v);
    if (r && c && key(r.url) === k) return c.value;
  }
  const colors = [...new Set(variants.map((v) => colorOf(v)?.value).filter(Boolean))];
  return colorByName(img, colors);
}
