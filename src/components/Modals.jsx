import React, { useState } from "react";

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

export function ProductModal({ product, onClose, onMessage }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="product-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <img src={product.image || "https://placehold.co/800x600?text=CampusKart"} alt={product.title} />
        <div className="modal-content">
          <span className="product-category">{product.category}</span>
          <h2>{product.title}</h2>
          <div className="modal-price">₹{Number(product.price).toLocaleString("en-IN")} {Number(product.oldPrice) > 0 && <del>₹{Number(product.oldPrice).toLocaleString("en-IN")}</del>}</div>
          <p>{product.description || "Connect with the seller to ask questions and arrange a convenient campus handoff."}</p>
          <div className="seller-detail">
            <span className="avatar">{product.initials || "CK"}</span>
            <div><b>{product.seller}</b><small>{product.location}</small></div>
          </div>
          <button className="primary-btn full" onClick={onMessage}>Message seller <span>→</span></button>
        </div>
      </div>
    </div>
  );
}

export function SellModal({ onClose, onPublish }) {
  const [form, setForm] = useState({ title: "", category: "Books", price: "", oldPrice: "", condition: "Good", location: "", image: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setError(""); setSaving(true);
    try { await onPublish({ ...form, price: Number(form.price), oldPrice: Number(form.oldPrice || 0) }); }
    catch (err) { setError(err.message || "Could not publish listing."); }
    finally { setSaving(false); }
  };
  return (
    <Modal title="List an item" onClose={onClose}>
      <p className="modal-intro">Add an item for other students to discover.</p>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>Item name<input name="title" value={form.title} onChange={change} placeholder="e.g. Engineering Mathematics book" minLength="3" required /></label>
          <label>Category<select name="category" value={form.category} onChange={change}><option>Books</option><option>Electronics</option><option>Furniture</option><option>Hostel Essentials</option><option>Accessories</option><option>Clothing</option></select></label>
          <label>Price (₹)<input name="price" value={form.price} onChange={change} type="number" min="0" step="1" placeholder="500" required /></label>
          <label>Original price (₹)<input name="oldPrice" value={form.oldPrice} onChange={change} type="number" min="0" step="1" placeholder="Optional" /></label>
          <label>Condition<select name="condition" value={form.condition} onChange={change}><option>Like New</option><option>Excellent</option><option>Good</option><option>Fair</option></select></label>
          <label>Campus location<input name="location" value={form.location} onChange={change} placeholder="e.g. Hostel Block A" /></label>
          <label className="full-field">Image URL (optional)<input name="image" value={form.image} onChange={change} type="url" placeholder="https://..." /></label>
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
