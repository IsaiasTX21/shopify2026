import { notFound } from "next/navigation";
import Listing from "@/components/Listing";
import { parseFilters } from "@/lib/filters";
import { t } from "@/lib/i18n";
import { getCollection } from "@/lib/shopify";
import { getCategories } from "@/lib/sale";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const c = await getCollection(handle);
  return { title: c?.title || t("collection.fallback") };
}

export default async function CollectionPage({ params, searchParams }) {
  const { handle } = await params;
  const sp = await searchParams;
  const sort = ["best-selling", "newest", "price-asc", "price-desc"].includes(sp.sort) ? sp.sort : "";
  const { raw, parsed } = parseFilters(sp);

  const [c, categories] = await Promise.all([
    getCollection(handle, sort, parsed),
    getCategories(),
  ]);
  if (!c) notFound();

  return (
    <div className="wrap page">
      <Listing
        title={c.title}
        capTitle
        description={c.description}
        products={c.products.nodes}
        sort={sort || "best-selling"}
        categories={categories}
        activeCategory={handle}
        filters={c.products.filters}
        selectedFilters={raw}
        params={{ sort }}
      />
    </div>
  );
}
