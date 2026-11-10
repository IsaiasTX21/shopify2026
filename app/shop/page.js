import Listing from "@/components/Listing";
import { t } from "@/lib/i18n";
import { getProducts } from "@/lib/shopify";
import { getCategories } from "@/lib/sale";

export const metadata = { title: t("shop.title") };

export default async function Shop({ searchParams }) {
  const { sort: s } = await searchParams;
  const sort = ["best-selling", "newest", "price-asc", "price-desc"].includes(s) ? s : "best-selling";
  const [products, categories] = await Promise.all([
    getProducts({ first: 48, sort }),
    getCategories(),
  ]);
  return (
    <div className="wrap page">
      <Listing title={t("shop.title")} products={products} sort={sort} categories={categories} />
    </div>
  );
}
