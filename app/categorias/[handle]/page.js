import { notFound } from "next/navigation";
import Listing from "@/components/Listing";
import { parseFilters } from "@/lib/filters";
import { getCollection, getCollections } from "@/lib/shopify";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const c = await getCollection(handle);
  return { title: c?.title || "Categoria" };
}

export default async function CategoryPage({ params, searchParams }) {
  const { handle } = await params;
  const sp = await searchParams;
  const sort = ["vendidos", "novos", "menor", "maior"].includes(sp.ordem) ? sp.ordem : "";
  const { raw, parsed } = parseFilters(sp);

  const [c, categories] = await Promise.all([
    getCollection(handle, sort, parsed),
    getCollections(20).catch(() => []),
  ]);
  if (!c) notFound();

  return (
    <div className="wrap page">
      <Listing
        title={c.title}
        capTitle
        description={c.description}
        products={c.products.nodes}
        sort={sort || "vendidos"}
        categories={categories}
        activeCategory={handle}
        filters={c.products.filters}
        selectedFilters={raw}
        params={{ ordem: sort }}
      />
    </div>
  );
}
