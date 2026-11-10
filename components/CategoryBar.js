import Link from "next/link";
import { t } from "@/lib/i18n";

// Barra de categorias = coleções da Shopify
export default function CategoryBar({ categories, active }) {
  if (!categories?.length) return null;
  return (
    <nav className="catbar" aria-label={t("categories.aria")}>
      <Link href="/shop" className={!active ? "is-active" : ""} aria-current={!active ? "page" : undefined}>{t("categories.all")}</Link>
      {categories.map((c) => (
        <Link
          key={c.handle}
          href={c.href || `/collections/${c.handle}`}
          className={`cap ${c.isSale ? "is-sale" : ""} ${active === c.handle ? "is-active" : ""}`}
          aria-current={active === c.handle ? "page" : undefined}
        >
          {c.title}
        </Link>
      ))}
    </nav>
  );
}
