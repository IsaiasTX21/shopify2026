import Image from "next/image";
import Link from "next/link";

export default function IconCard({ product }) {
  return (
    <Link href={`/products/${product.handle}`} className="icon-card">
      {product.featuredImage && (
        <Image
          src={product.featuredImage.url}
          alt={product.featuredImage.altText || product.title}
          fill
          sizes="(max-width: 700px) 50vw, 25vw"
        />
      )}
      <h3>{product.title}</h3>
    </Link>
  );
}
