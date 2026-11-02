import Link from "next/link";

// Barra de categorias = coleções da Shopify
export default function CategoryBar({ categories, active }) {
  if (!categories?.length) return null;
  return (
    <nav className="catbar" aria-label="Categorias">
      <Link href="/loja" className={!active ? "is-active" : ""} aria-current={!active ? "page" : undefined}>Todos</Link>
      {categories.map((c) => (
        <Link
          key={c.handle}
          href={`/categorias/${c.handle}`}
          className={`cap ${active === c.handle ? "is-active" : ""}`}
          aria-current={active === c.handle ? "page" : undefined}
        >
          {c.title}
        </Link>
      ))}
    </nav>
  );
}
