import Listing from "@/components/Listing";
import { parseFilters } from "@/lib/filters";
import { t } from "@/lib/i18n";
import { getSearch } from "@/lib/shopify";
import { getCategories } from "@/lib/sale";

export const metadata = { title: t("search.title") };

export default async function Search({ searchParams }) {
  const sp = await searchParams;
  const term = (sp.q ?? "").trim();
  const { raw, parsed } = parseFilters(sp);

  const [result, categories] = await Promise.all([
    term ? getSearch({ query: term, filters: parsed }) : { products: [], filters: [] },
    getCategories(),
  ]);

  return (
    <div className="wrap page">
      <Listing
        title={term ? t("search.results", { q: term }) : t("search.title")}
        products={result.products}
        sort="best-selling"
        showSort={false}
        categories={categories}
        filters={result.filters}
        selectedFilters={raw}
        params={{ q: term }}
      />
    </div>
  );
}
