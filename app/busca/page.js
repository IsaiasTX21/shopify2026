import Listing from "@/components/Listing";
import { parseFilters } from "@/lib/filters";
import { getCollections, getSearch } from "@/lib/shopify";

export const metadata = { title: "Busca" };

export default async function Search({ searchParams }) {
  const sp = await searchParams;
  const term = (sp.q ?? "").trim();
  const { raw, parsed } = parseFilters(sp);

  const [result, categories] = await Promise.all([
    term ? getSearch({ query: term, filters: parsed }) : { products: [], filters: [] },
    getCollections(20).catch(() => []),
  ]);

  return (
    <div className="wrap page">
      <Listing
        title={term ? `Resultados para “${term}”` : "Buscar produtos"}
        products={result.products}
        sort="vendidos"
        showSort={false}
        categories={categories}
        filters={result.filters}
        selectedFilters={raw}
        params={{ q: term }}
      />
    </div>
  );
}
