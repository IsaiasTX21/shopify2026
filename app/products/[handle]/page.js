import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/ProductDetails";
import ProductView from "@/components/ProductView";
import { metafieldIdentifiers, resolveAttributes, withoutOptions } from "@/lib/attributes";
import { categoryOf } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { getProduct } from "@/lib/shopify";
import { site } from "@/site.config";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  return { title: product?.title || t("page.fallback") };
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const full = await getProduct(handle);
  if (!full) notFound();

  const { metafields, ...product } = full; // metacampos brutos não vão para o navegador
  const category = categoryOf(product);

  // Atributos preenchidos no painel (material, fechamento, gênero...). Opções de variante não se repetem aqui.
  const optionNames = (product.variants.nodes[0]?.selectedOptions ?? []).map((o) => o.name);
  const attributes = withoutOptions(
    resolveAttributes(site.attributes, metafieldIdentifiers(site.attributes), metafields),
    optionNames
  );
  const subtitle = attributes.filter((a) => a.headline).flatMap((a) => a.values).join(", ");

  return (
    <article className="wrap page">
      <nav className="crumbs" aria-label={t("crumbs.aria")}>
        <Link href="/">{t("crumbs.home")}</Link>
        {category && (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/collections/${category.handle}`} className="cap">{category.title}</Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.title}</span>
      </nav>
      <ProductView product={product} category={category} subtitle={subtitle}>
        <ProductDetails descriptionHtml={product.descriptionHtml} attributes={attributes} />
      </ProductView>
    </article>
  );
}
