import React from "react";
// Listing section: filtering, sorting and product cards.
import { useMemo } from "react";
import ProductCard from "./ProductCard";

export default function Marketplace({ products, activeCategory, search, favorites, onFavorite, onOpen, onFilter, onSort, onClear }) {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) =>
      (activeCategory === "All" || product.category === activeCategory) &&
      (!query || [product.title, product.category, product.seller, product.location].some((value) => value.toLowerCase().includes(query)))
    );
  }, [products, activeCategory, search]);

  return (
    <section className="marketplace-section" id="marketplace">
      <div className="section-head">
        <div>
          <span className="section-kicker">Fresh on campus</span>
          <h2>Popular listings</h2>
          <p>{filtered.length} items matching your search</p>
        </div>
        <div className="sort-row">
          <button className="filter-btn" onClick={onFilter}>☷ Filters</button>
          <select onChange={onSort} defaultValue="Recommended">
            <option>Recommended</option>
            <option>Newest first</option>
            <option>Price: low to high</option>
          </select>
        </div>
      </div>

      {filtered.length ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(product.id)}
              onFavorite={onFavorite}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>⌕</span>
          <h3>No listings found</h3>
          <p>Try a different search or category.</p>
          <button onClick={onClear}>Clear search</button>
        </div>
      )}
    </section>
  );
}
