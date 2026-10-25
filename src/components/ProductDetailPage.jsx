import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest, assetUrl } from "../lib/api";

export default function ProductDetailPage({ products, user, cartProducts, onBuy, onAddToCart, notify }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loadedProduct, setLoadedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const product = products.find((item) => String(item.id || item._id) === productId) || loadedProduct;

  useEffect(() => {
    setQuantity(1);
    if (!products.some((item) => String(item.id || item._id) === productId)) {
      apiRequest(`/products/${encodeURIComponent(productId)}`).then(setLoadedProduct).catch(() => setLoadedProduct(null));
    }
  }, [productId, products]);

  if (!product) return <section className="product-detail-page"><div className="detail-empty"><h1>Listing not found</h1><p>This item may have been removed or sold out.</p><button className="primary-btn" onClick={() => navigate("/explore")}>Browse listings</button></div></section>;

  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const available = Math.max(0, Number(product.quantity ?? 1));
  const soldOut = product.status === "sold" || available === 0;
  const ownListing = user && String(product.ownerId) === String(user.id);
  const inCart = cartProducts.some((item) => String(item.id || item._id) === String(product.id || product._id));

  return <section className="product-detail-page">
    <button className="detail-back" onClick={() => navigate(-1)}>← Back to listings</button>
    <div className="product-detail-layout">
      <div className="detail-gallery">
        <img src={assetUrl(images[0]) || "https://placehold.co/900x800?text=CampusKart"} alt={product.title} />
        {images.length > 1 && <div className="detail-thumbnails">{images.map((src, i) => <img key={src + i} src={assetUrl(src)} alt={`${product.title} view ${i + 1}`} />)}</div>}
      </div>
      <div className="detail-information">
        <span className="section-kicker">{product.category}</span>
        <h1>{product.title}</h1>
        <div className="detail-price">₹{Number(product.price).toLocaleString("en-IN")} {Number(product.oldPrice) > 0 && <del>₹{Number(product.oldPrice).toLocaleString("en-IN")}</del>}</div>
        <span className={soldOut ? "detail-stock is-sold" : "detail-stock"}>{soldOut ? "Sold out" : `${available} available`}</span>
        <p className="detail-description">{product.description || "A campus listing. Contact the seller to ask questions and arrange a convenient handoff."}</p>
        <div className="detail-condition"><span>Condition</span><strong>{product.condition || "Good"}</strong></div>
        <div className="detail-seller"><span className="avatar">{product.initials || "CK"}</span><div><strong>{product.seller || "CampusKart seller"}</strong><small>{product.location || "Campus"}</small></div></div>
        {!soldOut && <label className="detail-quantity">Quantity <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>{Array.from({ length: available }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select><span>· ₹{(Number(product.price) * quantity).toLocaleString("en-IN")} total</span></label>}
        <div className="detail-actions">
          <button className="primary-btn" disabled={soldOut || ownListing} onClick={() => onBuy(product, quantity)}>{soldOut ? "Sold out" : ownListing ? "Your listing" : "Buy now"}</button>
          <button className="secondary-btn" disabled={soldOut || inCart || ownListing} onClick={() => onAddToCart(product)}>{inCart ? "✓ In cart" : "Add to cart"}</button>
        </div>
        <button className="chat-seller-btn" onClick={() => notify("Chat with seller is a work in progress.")}>Chat with seller <span>↗</span></button>
        <p className="detail-note">No online payment is collected. Purchase details are recorded in your account.</p>
      </div>
    </div>
  </section>;
}
