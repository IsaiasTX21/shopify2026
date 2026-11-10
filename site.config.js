// Edite aqui textos e visual. Produtos, preços, estoque e imagens vêm do painel da Shopify.
export const site = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "My Store",

  // Idioma da interface: "en" (inglês) ou "pt" (português). Veja lib/i18n.js
  lang: "en",

  // O número no ícone do carrinho conta "products" (itens diferentes) ou "units" (soma das quantidades)
  cartBadge: "products",

  // Tema claro/escuro. A escolha do visitante (botão no topo) sempre vale. Sem escolha:
  // default = "system" (segue o aparelho) | "light" | "dark" | "auto-time" (escuro das darkFrom às darkUntil, no horário do visitante)
  theme: { default: "system", darkFrom: 18, darkUntil: 6 },

  // Faixa fina abaixo do menu
  announcement: { text: "Find the perfect product.", linkLabel: "See what's new", href: "/shop?sort=newest" },

  // Faixa colorida de promoção (desligue com enabled: false)
  banner: {
    enabled: true,
    color: "#e0245e",
    left: "New in",
    center: "Selected products on sale",
    right: "See offers",
    href: "/sale",
  },

  // Capa da home: carrossel com 1 slide por coleção da Shopify que tenha imagem (interval = ms entre slides).
  // Em collection, informe o "handle" da coleção que deve abrir primeiro (opcional).
  hero: { collection: "", subtitle: "Discover the collection", cta: "Shop now", interval: 5000 },

  sections: {
    featuredTitle: "Featured",
    moreTitle: "More products",
    categoriesTitle: "Shop by category",
  },

  // Contato (a Shopify não tem API de formulário de contato)
  contact: { email: "", whatsapp: "" }, // whatsapp só com números e DDI, ex.: "15551234567"

  // Rodapé. Se existir o menu "footer" na Shopify (Online Store > Navigation), ele manda.
  // Senão usamos estas colunas, mas só aparecem links cujas Páginas existam na Shopify (handle em "page").
  footer: {
    menuHandle: "footer",
    menuFallbackTitle: "Information",
    columns: [
      { title: "Help", links: [
        { label: "FAQ", page: "faq" },
        { label: "Shipping", page: "shipping" },
        { label: "Returns", page: "returns" },
        { label: "Payments", page: "payments" },
        { label: "Contact us", page: "contact" },
      ] },
      { title: "About", links: [{ label: "About us", page: "about" }] },
    ],
    social: { instagram: "", facebook: "", youtube: "" },
  },

  // Atributos da categoria da Shopify mostrados na página do produto.
  // - keys: chaves do metacampo (namespace "shopify" por padrão). Várias chaves = tenta uma por uma.
  // - headline: aparece ao lado da categoria · block: ganha seção própria (texto longo)
  // - Para um metacampo seu: { label: "Composition", namespace: "custom", keys: ["composition"] }
  // Cor e tamanho são OPÇÕES de variante (seletor); só aparecem aqui se o produto não as usar como opção.
  attributes: [
    { label: "Target gender", keys: ["target-gender"], headline: true },
    { label: "Age group", keys: ["age-group"] },
    { label: "Activity", keys: ["activity"] },
    { label: "Color", keys: ["color-pattern", "color"] },
    { label: "Shoe size", keys: ["shoe-size", "footwear-size"] },
    { label: "Footwear material", keys: ["footwear-material"] },
    { label: "Lining material", keys: ["lining-material"] },
    { label: "Sole material", keys: ["sole-material"] },
    { label: "Closure type", keys: ["closure-type"] },
    { label: "Toe style", keys: ["toe-style"] },
    { label: "Heel height type", keys: ["heel-height-type", "heel-height"] },
    { label: "Footwear support type", keys: ["footwear-support-type", "shoe-support-type", "support-type"] },
    { label: "Footwear fit", keys: ["footwear-fit", "shoe-fit", "fit"] },
    { label: "Footwear features", keys: ["footwear-features", "shoe-features"] },
    { label: "Care instructions", keys: ["care-instructions"], block: true },
  ],
};
