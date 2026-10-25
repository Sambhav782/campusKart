import React from "react";
import { assetUrl } from "../lib/api";

export default function ProductCard({ product, onAddToCart, onOpen }) {
  const discount = product.oldPrice > 0 ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const image = product.images?.[0] || product.image;

  return (
    <article className="product-card">
      <button
        className="heart"
        type="button"
        title="Add to cart"
        aria-label={`Add ${product.title} to cart`}
        disabled={product.status === "sold" || Number(product.quantity ?? 1) <= 0}
        onClick={() => onAddToCart(product)}
      >♡</button>
      <button className="product-image" onClick={() => onOpen(product)}>
        <img src={assetUrl(image) || "https://placehold.co/600x400?text=CampusKart"} alt={product.title} />
        <span className="condition">{product.condition}</span>
        {product.status === "sold" || Number(product.quantity ?? 1) <= 0 ? <span className="stock-badge sold-badge">Sold out</span> : <span className="stock-badge">{Number(product.quantity ?? 1)} available</span>}
      </button>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <button className="product-title" onClick={() => onOpen(product)}>{product.title}</button>
        <div className="price-row">
          <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
          {Number(product.oldPrice) > 0 && <del>₹{Number(product.oldPrice).toLocaleString("en-IN")}</del>}
          {discount > 0 && <span>{discount}% off</span>}
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
