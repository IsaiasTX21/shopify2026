import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import IconCard from "@/components/IconCard";
import ProductCard from "@/components/ProductCard";
import Tile from "@/components/Tile";
import { getCollections, getProducts } from "@/lib/shopify";
import { t } from "@/lib/i18n";
import { site } from "@/site.config";

// Cada coleção da Shopify é uma categoria da loja
const tileFor = (c) => ({
  href: `/collections/${c.handle}`,
  title: c.title,
  image: c.image || c.products.nodes[0]?.featuredImage || null,
});

export default async function Home() {
  const [products, collections] = await Promise.all([
    getProducts({ first: 16 }),
    getCollections(20).catch(() => []),
  ]);

  const heroCol = collections.find((c) => c.handle === site.hero.collection) || collections[0];

  const ordered = heroCol ? [heroCol, ...collections.filter((c) => c !== heroCol)] : collections;
  let slides = ordered.map(tileFor).filter((t) => t.image).slice(0, 8);
  if (!slides.length) slides = [{ href: "/shop", title: site.name, image: products[0]?.featuredImage || null }];

  const rich = collections.length >= 6;
  const rest = collections.filter((c) => c !== heroCol);
  const big = rich ? rest.slice(0, 2).map(tileFor) : [];

  const tall = (rich ? rest.slice(2, 5) : collections.length >= 2 ? collections.slice(0, 3) : []).map(tileFor);

  const featured = products.slice(0, 4);
  const more = products.slice(4, 16);
  const b = site.banner;

  return (
    <>
      {b.enabled && (
        <Link href={b.href} className="banner" style={{ background: b.color }}>
          <span>{b.left}</span>
          <strong>{b.center}</strong>
          <span className="banner-right">{b.right}</span>
        </Link>
      )}

      <h1 className="sr-only">{site.name}</h1>
      <HeroCarousel slides={slides} subtitle={site.hero.subtitle} cta={site.hero.cta} interval={site.hero.interval} />

      {big.length > 0 && (
        <section className="tiles-2" aria-label="Categorias em destaque">
          {big.map((t) => <Tile key={t.href} {...t} subtitle={site.name} />)}
        </section>
      )}

      {tall.length > 0 && (
        <section className="wrap section">
          <h2>{site.sections.categoriesTitle}</h2>
          <div className="tiles-3" style={{ marginTop: 0 }}>
            {tall.map((t) => <Tile key={t.href} {...t} size="tall" />)}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="wrap section">
          <h2>{site.sections.featuredTitle}</h2>
          <div className="icons">
            {featured.map((p) => <IconCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="wrap section">
          <div className="section-head">
            <h2>{site.sections.moreTitle}</h2>
            <Link href="/shop" className="underline">{t("home.viewAll")}</Link>
          </div>
          <div className="grid">
            {more.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <section className="wrap section">
          <p className="empty-note">
            {t("home.empty")}
          </p>
        </section>
      )}

      {collections.length > 0 && (
        <section className="wrap section">
          <h2 className="h-sm">{t("home.allCategories")}</h2>
          <ul className="cat-links">
            {collections.map((c) => (
              <li key={c.id}><Link href={`/collections/${c.handle}`} className="cap">{c.title}</Link></li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
