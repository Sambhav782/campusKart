// Reusable modal shell plus listing and login forms.
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="form-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
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
        <button className="modal-close" onClick={onClose}>×</button>
        <img src={product.image} alt={product.title} />
        <div className="modal-content">
          <span className="product-category">{product.category}</span>
          <h2>{product.title}</h2>
          <div className="modal-price">₹{product.price.toLocaleString("en-IN")} <del>₹{product.oldPrice.toLocaleString("en-IN")}</del></div>
          <p>This item is listed by a verified campus student. Connect with the seller to ask questions and arrange a convenient campus handoff.</p>
          <div className="seller-detail">
            <span className="avatar">{product.initials}</span>
            <div><b>{product.seller}</b><small>Verified student · {product.location}</small></div>
            <span className="verified">✓ Verified</span>
          </div>
          <button className="primary-btn full" onClick={onMessage}>Message seller <span>→</span></button>
        </div>
      </div>
    </div>
  );
}

export function SellModal({ onClose, onPublish }) {
  return (
    <Modal title="List an item" onClose={onClose}>
      <p className="modal-intro">Create a quick demo listing. Backend submission will be connected next.</p>
      <div className="form-grid">
        <label>Item name<input placeholder="e.g. Engineering Mathematics book" /></label>
        <label>Category<select><option>Books</option><option>Electronics</option><option>Furniture</option><option>Hostel Essentials</option><option>Accessories</option></select></label>
        <label>Price (₹)<input type="number" placeholder="500" /></label>
        <label>Condition<select><option>Like New</option><option>Excellent</option><option>Good</option></select></label>
        <label className="full-field">Description<textarea placeholder="Tell buyers a little about the item..." /></label>
      </div>
      <button className="primary-btn full" onClick={onPublish}>Publish listing <span>→</span></button>
    </Modal>
  );
}

export function LoginModal({ onClose, onLogin, onGoogle }) {
  return (
    <Modal title="Welcome back" onClose={onClose}>
      <p className="modal-intro">Sign in with your college account to continue.</p>
      <label className="form-label">College email<input type="email" placeholder="you@gniot.net.in" /></label>
      <label className="form-label">Password<input type="password" placeholder="••••••••" /></label>
      <button className="primary-btn full" onClick={onLogin}>Continue <span>→</span></button>
      <div className="or"><span>or</span></div>
      <button className="google-btn" onClick={onGoogle}>Continue with Google</button>
    </Modal>
  );
}
