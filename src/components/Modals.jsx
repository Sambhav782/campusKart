import React, { useEffect, useState } from "react";
import { assetUrl } from "../lib/api";

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="form-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <span className="section-kicker">CampusKart</span>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ProductModal({ product, onClose, onMessage, onAddToCart, isInCart = false }) {
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => setActiveImage(0), [product.id]);
  const displayedImage = images[activeImage];
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="product-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="product-gallery">
          <img src={assetUrl(displayedImage) || "https://placehold.co/800x600?text=CampusKart"} alt={product.title} />
          {images.length > 1 && <div className="gallery-thumbnails">{images.map((image, index) => <button key={image + index} type="button" className={index === activeImage ? "gallery-thumb active" : "gallery-thumb"} onClick={() => setActiveImage(index)}><img src={assetUrl(image)} alt={`${product.title} photo ${index + 1}`} /></button>)}</div>}
        </div>
        <div className="modal-content">
          <span className="product-category">{product.category}</span>
          <h2>{product.title}</h2>
          <div className="modal-price">₹{Number(product.price).toLocaleString("en-IN")} {Number(product.oldPrice) > 0 && <del>₹{Number(product.oldPrice).toLocaleString("en-IN")}</del>}</div>
          <p>{product.description || "Connect with the seller to ask questions and arrange a convenient campus handoff."}</p>
          <div className="seller-detail"><span className="avatar">{product.initials || "CK"}</span><div><b>{product.seller}</b><small>{product.location}</small></div></div>
          <div className="product-actions"><button className="primary-btn" onClick={onMessage}>Contact seller</button><button className="secondary-btn" onClick={onAddToCart} disabled={isInCart}>{isInCart ? "✓ Added to cart" : "＋ Add to cart"}</button></div>
        </div>
      </div>
    </div>
  );
}

export function SellModal({ onClose, onPublish }) {
  const [form, setForm] = useState({ title: "", category: "Books", price: "", oldPrice: "", condition: "Good", location: "", description: "" });
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const choosePhotos = (event) => {
    const selected = Array.from(event.target.files || []);
    setError("");
    if (selected.length > 5) { setError("You can upload up to 5 photos."); event.target.value = ""; return; }
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type));
    if (invalid) { setError("Use JPG, PNG, WebP, GIF, or AVIF images."); event.target.value = ""; return; }
    const tooLarge = selected.find((file) => file.size > 5 * 1024 * 1024);
    if (tooLarge) { setError("Each photo must be 5 MB or smaller."); event.target.value = ""; return; }
    setPhotos(selected);
  };
  const submit = async (event) => {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      photos.forEach((photo) => payload.append("images", photo));
      await onPublish(payload);
    } catch (err) { setError(err.message || "Could not publish listing."); }
    finally { setSaving(false); }
  };
  return (
    <Modal title="List an item" onClose={onClose}>
      <p className="modal-intro">Add photos so other students can see exactly what you're selling.</p>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>Item name<input name="title" value={form.title} onChange={change} placeholder="e.g. Engineering Mathematics book" minLength="3" required /></label>
          <label>Category<select name="category" value={form.category} onChange={change}><option>Books</option><option>Electronics</option><option>Furniture</option><option>Hostel Essentials</option><option>Accessories</option><option>Clothing</option></select></label>
          <label>Price (₹)<input name="price" value={form.price} onChange={change} type="number" min="0" step="1" placeholder="500" required /></label>
          <label>Original price (₹)<input name="oldPrice" value={form.oldPrice} onChange={change} type="number" min="0" step="1" placeholder="Optional" /></label>
          <label>Condition<select name="condition" value={form.condition} onChange={change}><option>Like New</option><option>Excellent</option><option>Good</option><option>Fair</option></select></label>
          <label>Campus location<input name="location" value={form.location} onChange={change} placeholder="e.g. Hostel Block A" /></label>
          <div className="full-field photo-upload-field">
            <span className="upload-label">Item photos <small>Up to 5 photos · 5 MB each</small></span>
            <label className="photo-dropzone">
              <span className="photo-upload-icon">＋</span><strong>Choose photos</strong>
              <small>JPG, PNG, WebP, GIF or AVIF</small>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={choosePhotos} />
            </label>
            {previews.length > 0 && <div className="photo-preview-grid">{previews.map((src, index) => <div className="photo-preview" key={src}><img src={src} alt={`Selected item photo ${index + 1}`} /><button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}>×</button></div>)}</div>}
          </div>
          <label className="full-field">Description<textarea name="description" value={form.description} onChange={change} placeholder="Tell buyers a little about the item..." rows="3" /></label>
        </div>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="primary-btn full" type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish listing"} <span>→</span></button>
      </form>
    </Modal>
  );
}

export function LoginModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setError(""); setSaving(true);
    try { await onLogin({ ...form, mode }); }
    catch (err) { setError(err.message || "Authentication failed."); }
    finally { setSaving(false); }
  };
  return (
    <Modal title={mode === "login" ? "Welcome back" : "Create your account"} onClose={onClose}>
      <p className="modal-intro">{mode === "login" ? "Sign in to publish listings and manage your account." : "Create an account to start selling on campus."}</p>
      <form onSubmit={submit}>
        {mode === "register" && <label className="form-label">Full name<input name="name" value={form.name} onChange={change} autoComplete="name" minLength="2" required /></label>}
        <label className="form-label">Email address<input name="email" value={form.email} onChange={change} type="email" autoComplete="email" required /></label>
        <label className="form-label">Password<input name="password" value={form.password} onChange={change} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength="8" required /></label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="primary-btn full" type="submit" disabled={saving}>{saving ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
      </form>
      <p className="modal-intro">{mode === "login" ? "New to CampusKart?" : "Already have an account?"} <button type="button" className="text-btn" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
    </Modal>
  );
}
