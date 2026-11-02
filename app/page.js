import Image from "next/image";
import Link from "next/link";
import IconCard from "@/components/IconCard";
import ProductCard from "@/components/ProductCard";
import Tile from "@/components/Tile";
import { getCollections, getProducts } from "@/lib/shopify";
import { site } from "@/site.config";

// Cada coleção da Shopify é uma categoria da loja
const tileFor = (c) => ({
  href: `/categorias/${c.handle}`,
  title: c.title,
  image: c.image || c.products.nodes[0]?.featuredImage || null,
});

export default async function Home() {
  const [products, collections] = await Promise.all([
    getProducts({ first: 16 }),
    getCollections(20).catch(() => []),
  ]);

  const heroCol = collections.find((c) => c.handle === site.hero.collection) || collections[0];
  const hero = heroCol ? tileFor(heroCol) : null;
  const heroImage = hero?.image || products[0]?.featuredImage || null;
  const heroHref = hero?.href || "/loja";
  const heroTitle = site.hero.title || hero?.title || site.name;

  // Muitas categorias: blocos grandes + verticais. Poucas: todas viram blocos verticais.
  const rich = collections.length >= 6;
  const rest = collections.filter((c) => c !== heroCol);
  const big = rich ? rest.slice(0, 2).map(tileFor) : [];
  const tall = (rich ? rest.slice(2, 5) : collections.slice(0, 3)).map(tileFor);

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

      <section className="hero">
        {heroImage && <Image src={heroImage.url} alt={heroImage.altText || ""} fill priority sizes="100vw" />}
        <div className="hero-copy">
          <h1 className="cap">{heroTitle}</h1>
          <p>{site.hero.subtitle}</p>
          <Link href={heroHref} className="pill pill-lg">{site.hero.cta}</Link>
        </div>
      </section>

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
            <Link href="/loja" className="underline">Ver todos</Link>
          </div>
          <div className="grid">
            {more.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <section className="wrap section">
          <p className="empty-note">
            Nenhum produto publicado ainda. Cadastre produtos no painel da Shopify e publique-os no canal Headless.
          </p>
        </section>
      )}

      {collections.length > 0 && (
        <section className="wrap section">
          <h2 className="h-sm">Todas as categorias</h2>
          <ul className="cat-links">
            {collections.map((c) => (
              <li key={c.id}><Link href={`/categorias/${c.handle}`} className="cap">{c.title}</Link></li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
