import React, { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { categories } from "../data/products";

/** Homepage shows a small preview; Explore shows all listings and filters. */

export default function Marketplace({
  products, activeCategory = "All", search = "", cartProducts = [], onToggleCart, onOpen,
  onClear, limit, showFilters = true, onViewAll, pageTitle = "Explore listings",
  pageDescription, onCategoryChange
}) {
  const [condition, setCondition] = useState("All conditions");
  const [sortMode, setSortMode] = useState("Recommended");
  const [maxPrice, setMaxPrice] = useState("");

  // Filtering and sorting operate on a copy, leaving source listings untouched.
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) =>
      (activeCategory === "All" || product.category === activeCategory) &&
      (condition === "All conditions" || product.condition === condition) &&
      (maxPrice === "" || Number(product.price || 0) <= Number(maxPrice)) &&
      (!query || [product.title, product.category, product.seller, product.location, product.description, product.condition]
        .some((value) => String(value || "").toLowerCase().includes(query)))
    );
    if (sortMode === "Price: low to high") result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortMode === "Price: high to low") result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortMode === "Newest first") result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return result;
  }, [products, activeCategory, search, condition, maxPrice, sortMode]);

  // The homepage intentionally displays only a handful of popular listings.
  const visibleProducts = limit ? filtered.slice(0, limit) : filtered;
  const isPopular = !showFilters && Boolean(limit);

  return (
    <section className={isPopular ? "marketplace-section popular-section" : "marketplace-section explore-section"} id={isPopular ? "marketplace" : "explore-listings"}>
      <div className="section-head">
        <div>
          <span className="section-kicker">{isPopular ? "Fresh on campus" : "Find your next favourite"}</span>
          <h2>{isPopular ? "Popular listings" : pageTitle}</h2>
          <p>{isPopular ? "A few finds worth checking out" : (pageDescription || `${filtered.length} listings available`)}</p>
        </div>
        {isPopular ? (
          <button className="text-btn" onClick={onViewAll}>View all listings <span>→</span></button>
        ) : showFilters ? (
          <label className="explore-sort">Sort by
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
              <option>Recommended</option><option>Newest first</option><option>Price: low to high</option><option>Price: high to low</option>
            </select>
          </label>
        ) : null}
      </div>

      {showFilters && !isPopular && (
        <div className="explore-toolbar">
          <label>Category
            <select value={activeCategory} onChange={(event) => onCategoryChange?.(event.target.value)}>
              <option value="All">All categories</option>
              {categories.map(([name]) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label>Condition
            <select value={condition} onChange={(event) => setCondition(event.target.value)}>
              <option>All conditions</option><option>New</option><option>Like New</option><option>Excellent</option><option>Good</option><option>Fair</option><option>Used</option>
            </select>
          </label>
          <label>Max price (₹)
            <input type="number" min="0" placeholder="Any price" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} />
          </label>
          <button className="explore-reset" onClick={() => { setCondition("All conditions"); setMaxPrice(""); setSortMode("Recommended"); onClear?.(); onCategoryChange?.("All"); }}>Reset filters</button>
        </div>
      )}

      {visibleProducts.length ? (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              isInCart={cartProducts.some((item) => String(item.id || item._id) === String(product.id || product._id))}
              onToggleCart={onToggleCart}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>⌕</span><h3>No listings found</h3>
          <p>Try changing your search or filters.</p>
          <button onClick={() => { setCondition("All conditions"); setMaxPrice(""); onClear?.(); onCategoryChange?.("All"); }}>Clear filters</button>
        </div>
      )}
    </section>
  );
}
