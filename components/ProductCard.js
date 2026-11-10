import Image from "next/image";
import Link from "next/link";
import { categoryOf } from "@/lib/categories";
import { money } from "@/lib/format";
import { t } from "@/lib/i18n";

export default function ProductCard({ product, categoryHandle }) {
  const price = product.priceRange.minVariantPrice;
  const compare = product.compareAtPriceRange.minVariantPrice;
  const onSale = Number(compare.amount) > Number(price.amount);
  const pct = onSale ? Math.round((1 - Number(price.amount) / Number(compare.amount)) * 100) : 0;
  const category = categoryOf(product, categoryHandle);

  return (
    <Link href={`/products/${product.handle}`} className="card">
      <div className="card-img">
        {product.featuredImage && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
          />
        )}
      </div>
      {!product.availableForSale && <p className="flag">{t("product.soldOut")}</p>}
      {product.availableForSale && onSale && <p className="flag flag-sale">{t("product.onSale")} · -{pct}%</p>}
      <h3>{product.title}</h3>
      {category && <p className="card-cat cap">{category.title}</p>}
      <p className="price">
        {money(price)}
        {onSale && <s>{money(compare)}</s>}
      </p>
    </Link>
  );
}
