import React from "react";
// Reusable card for one marketplace listing.
export default function ProductCard({ product, favorite, onFavorite, onOpen }) {
  const discount = Math.round((1 - product.price / product.oldPrice) * 100);

  return (
    <article className="product-card">
      <button className="heart" onClick={() => onFavorite(product.id)}>{favorite ? "♥" : "♡"}</button>

      <button className="product-image" onClick={() => onOpen(product)}>
        <img src={product.image} alt={product.title} />
        <span className="condition">{product.condition}</span>
      </button>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <button className="product-title" onClick={() => onOpen(product)}>{product.title}</button>

        <div className="price-row">
          <strong>₹{product.price.toLocaleString("en-IN")}</strong>
          <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>
          <span>{discount}% off</span>
        </div>

        <div className="seller-row">
          <span className="avatar">{product.initials}</span>
          <span><b>{product.seller}</b><small> · {product.location}</small></span>
          <button onClick={() => onOpen(product)}>View →</button>
        </div>
      </div>
    </article>
  );
}
