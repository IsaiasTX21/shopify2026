// Edite aqui os textos e o visual da loja. Produtos, coleções, imagens e preços vêm do painel da Shopify.
export const site = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "Minha Loja",

  // O número no ícone do carrinho conta "produtos" (itens diferentes) ou "unidades" (soma das quantidades)
  cartBadge: "produtos",

  // Faixa fina abaixo do menu
  announcement: { text: "Encontre o produto ideal.", linkLabel: "Ver novidades", href: "/loja?ordem=novos" },

  // Faixa colorida de promoção (desligue com enabled: false)
  banner: {
    enabled: true,
    color: "#e0245e",
    left: "Novidades",
    center: "Ofertas em produtos selecionados",
    right: "Ver ofertas",
    href: "/loja?ordem=novos",
  },

  // Hero da home. Deixe collection vazio para usar a primeira coleção da loja,
  // ou informe o "handle" de uma coleção (ex.: "lancamentos").
  hero: { collection: "", title: "", subtitle: "Descubra a coleção", cta: "Comprar" },

  sections: {
    featuredTitle: "Destaques",
    moreTitle: "Mais produtos",
    categoriesTitle: "Explore por categoria",
  },

  // Contato (a Shopify não tem API para enviar formulário; mostramos e-mail/WhatsApp na página "contato")
  contact: { email: "", whatsapp: "" }, // whatsapp só com números e DDI, ex.: "5521999999999"

  // Rodapé. Se existir o menu "footer" na Shopify (Loja virtual > Navegação), ele manda.
  // Senão usamos estas colunas, mas só aparecem links cujas Páginas existam na Shopify (handle em "page").
  footer: {
    menuHandle: "footer",
    menuFallbackTitle: "Informações",
    columns: [
      { title: "Ajuda", links: [
        { label: "Dúvidas gerais", page: "duvidas" },
        { label: "Entregas", page: "entregas" },
        { label: "Devoluções", page: "devolucoes" },
        { label: "Pagamentos", page: "pagamentos" },
        { label: "Fale conosco", page: "contato" },
      ] },
      { title: "Sobre", links: [{ label: "Quem somos", page: "sobre" }] },
    ],
    social: { instagram: "", facebook: "", youtube: "" },
  },

  // Atributos da categoria da Shopify mostrados na página do produto.
  // - keys: chaves do metacampo (namespace "shopify" por padrão). Várias chaves = tenta uma por uma.
  // - headline: aparece ao lado da categoria · block: ganha seção própria (texto longo)
  // - Para um metacampo seu: { label: "Composição", namespace: "custom", keys: ["composicao"] }
  // Cor e Tamanho do calçado são OPÇÕES de variante (seletor); só aparecem aqui se o produto não as usar como opção.
  attributes: [
    { label: "Gênero alvo", keys: ["target-gender"], headline: true },
    { label: "Grupo de idade", keys: ["age-group"] },
    { label: "Atividade", keys: ["activity"] },
    { label: "Cor", keys: ["color-pattern", "color"] },
    { label: "Tamanho do calçado", keys: ["shoe-size", "footwear-size"] },
    { label: "Material do calçado", keys: ["footwear-material"] },
    { label: "Forro material", keys: ["lining-material"] },
    { label: "Solado material", keys: ["sole-material"] },
    { label: "Tipo de fechamento", keys: ["closure-type"] },
    { label: "Estilo de biqueira", keys: ["toe-style"] },
    { label: "Tipo de altura do salto", keys: ["heel-height-type", "heel-height"] },
    { label: "Tipo de suporte de calçado", keys: ["footwear-support-type", "shoe-support-type", "support-type"] },
    { label: "Ajuste de calçado", keys: ["footwear-fit", "shoe-fit", "fit"] },
    { label: "Características de calçados", keys: ["footwear-features", "shoe-features"] },
    { label: "Instruções de cuidados", keys: ["care-instructions"], block: true },
  ],
};
