import React from "react";
// Category buttons used to filter marketplace listings.
import { categories } from "../data/products";

export default function Categories({ activeCategory, onCategory, onViewAll }) {
  return (
    <section className="category-section">
      <div className="section-head compact">
        <div><span className="section-kicker">Explore</span><h2>Shop by category</h2></div>
        <button className="text-btn" onClick={onViewAll}>View all <span>→</span></button>
      </div>

      <div className="category-grid">
        {categories.map(([name, icon, count]) => (
          <button
            className={activeCategory === name ? "category-card selected" : "category-card"}
            key={name}
            onClick={() => onCategory(name)}
          >
            <span className={"category-icon " + name.toLowerCase().replaceAll(" ", "-")}>{icon}</span>
            <div><strong>{name}</strong><small>{count}</small></div>
            <span className="category-arrow">↗</span>
          </button>
        ))}
      </div>
    </section>
  );
}
