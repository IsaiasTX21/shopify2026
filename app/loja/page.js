import Listing from "@/components/Listing";
import { getCollections, getProducts } from "@/lib/shopify";

export const metadata = { title: "Todos os produtos" };

export default async function Shop({ searchParams }) {
  const { ordem } = await searchParams;
  const sort = ["vendidos", "novos", "menor", "maior"].includes(ordem) ? ordem : "vendidos";
  const [products, categories] = await Promise.all([
    getProducts({ first: 48, sort }),
    getCollections(20).catch(() => []),
  ]);
  return (
    <div className="wrap page">
      <Listing title="Todos os produtos" products={products} sort={sort} categories={categories} />
    </div>
  );
}
