import Listing from "@/components/Listing";
import { t } from "@/lib/i18n";
import { getCategories, getSaleProducts, priceOf } from "@/lib/sale";

export const metadata = { title: t("sale.title") };

export default async function SalePage({ searchParams }) {
  const { sort } = await searchParams;
  const [list, categories] = await Promise.all([getSaleProducts().catch(() => []), getCategories()]);

  // Padrão: maior desconto primeiro. O seletor reordena por preço.
  let products = list;
  if (sort === "price-asc") products = [...list].sort((a, b) => priceOf(a) - priceOf(b));
  if (sort === "price-desc") products = [...list].sort((a, b) => priceOf(b) - priceOf(a));

  return (
    <div className="wrap page">
      <Listing
        title={t("sale.title")}
        description={t("sale.description")}
        products={products}
        sort={["price-asc", "price-desc"].includes(sort) ? sort : "best-selling"}
        categories={categories}
        activeCategory="sale"
      />
    </div>
  );
}
