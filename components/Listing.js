import CategoryBar from "./CategoryBar";
import FilterPanel from "./FilterPanel";
import ProductCard from "./ProductCard";
import SortSelect from "./SortSelect";

export default function Listing({
  title, description, products, sort, showSort = true,
  categories = [], activeCategory = null, capTitle = false,
  filters = [], selectedFilters = [], params = {},
}) {
  const hasFilters = filters.some((f) => f.type !== "PRICE_RANGE" && f.values.length);

  return (
    <section>
      <CategoryBar categories={categories} active={activeCategory} />
      <div className="listing-head">
        <div>
          <h1 className={capTitle ? "cap" : ""}>{title}</h1>
          {description && <p className="muted lead">{description}</p>}
          <p className="muted">{products.length} {products.length === 1 ? "produto" : "produtos"}</p>
        </div>
        {showSort && <SortSelect current={sort} keep={selectedFilters} />}
      </div>

      <div className={`listing-body ${hasFilters ? "with-filters" : ""}`}>
        {hasFilters && <FilterPanel filters={filters} selected={selectedFilters} params={params} />}
        <div>
          {products.length === 0 ? (
            <p className="empty-note">
              {selectedFilters.length ? "Nenhum produto com esses filtros." : "Nenhum produto encontrado."}
            </p>
          ) : (
            <div className="grid">
              {products.map((p) => <ProductCard key={p.id} product={p} categoryHandle={activeCategory} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
