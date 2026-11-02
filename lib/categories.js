// A categoria de um produto é o título da coleção da Shopify a que ele pertence.
// Coleções automáticas da Shopify ("Home page", "All") não contam como categoria.
export const HIDDEN_COLLECTIONS = ["frontpage", "all"];

export function categoryOf(product, preferredHandle) {
  const list = (product?.collections?.nodes ?? []).filter((c) => !HIDDEN_COLLECTIONS.includes(c.handle));
  return (preferredHandle && list.find((c) => c.handle === preferredHandle)) || list[0] || null;
}
