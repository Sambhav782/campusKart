import React from "react";
import { assetUrl } from "../lib/api";

function CartItem({ product, onRemove, onOpen }) {
  const image = product.images?.[0] || product.image;
  return (
    <article className="cart-item">
      <button className="cart-item-image" onClick={() => onOpen(product)} aria-label={`View ${product.title}`}>
        <img src={assetUrl(image) || "https://placehold.co/160x120?text=CampusKart"} alt={product.title} />
      </button>
      <div className="cart-item-info">
        <button className="cart-item-title" onClick={() => onOpen(product)}>{product.title}</button>
        <span className="cart-item-category">{product.category} · {product.condition || "Good"}</span>
        <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
      </div>
      <button className="remove-cart-btn" onClick={() => onRemove(product.id || product._id)}>Remove</button>
    </article>
  );
}

export default function ProfilePage({ user, cartProducts, activeSection, onNavigate, onRemoveFromCart, onOpenProduct, onLogout, onBrowse }) {
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const total = cartProducts.reduce((sum, product) => sum + Number(product.price || 0), 0);
  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <div className="account-sidebar-heading">Your account</div>
        <div className="account-sidebar-user">
          <span className="avatar account-avatar">{initial}</span>
          <span><strong>{user?.name || "CampusKart user"}</strong><small>{user?.email || ""}</small></span>
        </div>
        <nav className="account-side-nav" aria-label="Account navigation">
          <button className={activeSection === "profile" ? "selected" : ""} onClick={() => onNavigate("profile")}> <span>♙</span> Profile overview</button>
          <button className={activeSection === "cart" ? "selected" : ""} onClick={() => onNavigate("cart")}> <span>🛒</span> My cart <b>{cartProducts.length}</b></button>
        </nav>
        <div className="account-sidebar-bottom">
          <button className="signout-btn" onClick={onLogout}><span>↪</span> Sign out</button>
        </div>
      </aside>

      <section className="account-content">
        <div className="account-page-heading">
          <div><span className="section-kicker">CampusKart account</span><h1>{activeSection === "cart" ? "My cart" : "Profile overview"}</h1><p>{activeSection === "cart" ? "Review the items you've saved for later." : "Manage your account and the items you want to buy."}</p></div>
          {activeSection === "cart" && <span className="cart-total-count">{cartProducts.length} {cartProducts.length === 1 ? "item" : "items"}</span>}
        </div>

        {activeSection === "profile" ? (
          <>
            <section className="account-panel">
              <div className="panel-heading"><div><h2>Your information</h2><p>Your CampusKart account details.</p></div><span className="account-status">Signed in</span></div>
              <div className="user-info-grid">
                <div className="user-info-field"><span>Full name</span><strong>{user?.name || "—"}</strong></div>
                <div className="user-info-field"><span>Email address</span><strong>{user?.email || "—"}</strong></div>
                <div className="user-info-field"><span>Account</span><strong>CampusKart member</strong></div>
              </div>
            </section>
            <section className="account-panel">
              <div className="panel-heading"><div><h2>Your cart</h2><p>Items you've added to your cart.</p></div><button className="text-btn" onClick={() => onNavigate("cart")}>View cart →</button></div>
              {cartProducts.length ? (
                <>
                  <div className="cart-list">{cartProducts.slice(0, 3).map((product) => <CartItem key={product.id || product._id} product={product} onRemove={onRemoveFromCart} onOpen={onOpenProduct} />)}</div>
                  {cartProducts.length > 3 && <button className="secondary-btn cart-view-all" onClick={() => onNavigate("cart")}>View all {cartProducts.length} items</button>}
                </>
              ) : (
                <div className="cart-empty compact-empty"><span>🛒</span><h3>Your cart is empty</h3><p>Browse the marketplace and add items you like.</p><button className="primary-btn" onClick={onBrowse}>Browse marketplace</button></div>
              )}
            </section>
          </>
        ) : (
          <section className="account-panel">
            <div className="panel-heading"><div><h2>Saved items</h2><p>Items you've added to your cart.</p></div></div>
            {cartProducts.length ? (
              <>
                <div className="cart-list">{cartProducts.map((product) => <CartItem key={product.id || product._id} product={product} onRemove={onRemoveFromCart} onOpen={onOpenProduct} />)}</div>
                <div className="cart-summary"><span>Estimated total</span><strong>₹{total.toLocaleString("en-IN")}</strong><small>This is an estimate only. No payment is taken in CampusKart.</small></div>
                <button className="primary-btn" onClick={onBrowse}>Continue browsing</button>
              </>
            ) : (
              <div className="cart-empty"><span>🛒</span><h3>Your cart is empty</h3><p>When you add an item, it will appear here.</p><button className="primary-btn" onClick={onBrowse}>Browse marketplace</button></div>
            )}
          </section>
        )}
      </section>
    </div>
  );
}
