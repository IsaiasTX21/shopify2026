import Image from "next/image";
import Link from "next/link";
import { categoryOf } from "@/lib/categories";
import { money } from "@/lib/format";

export default function ProductCard({ product, categoryHandle }) {
  const price = product.priceRange.minVariantPrice;
  const compare = product.compareAtPriceRange.minVariantPrice;
  const onSale = Number(compare.amount) > Number(price.amount);
  const category = categoryOf(product, categoryHandle);

  return (
    <Link href={`/produtos/${product.handle}`} className="card">
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
      {!product.availableForSale && <p className="flag">Esgotado</p>}
      {product.availableForSale && onSale && <p className="flag flag-sale">Promoção</p>}
      <h3>{product.title}</h3>
      {category && <p className="card-cat cap">{category.title}</p>}
      <p className="price">
        {money(price)}
        {onSale && <s>{money(compare)}</s>}
      </p>
    </Link>
  );
}
