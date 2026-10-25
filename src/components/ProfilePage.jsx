import React from "react";
import { NavLink } from "react-router-dom";
import { assetUrl } from "../lib/api";

/** A compact listing row used in both the cart and profile preview. */
function CartItem({ product, onRemove, onOpen, onBuy }) {
  const image = product.images?.[0] || product.image;
  return (
    <article className="cart-item cart-item-clickable" role="button" tabIndex={0} onClick={() => onOpen(product)} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onOpen(product); } }}>
      <button className="cart-item-image" onClick={(event) => { event.stopPropagation(); onOpen(product); }} aria-label={`View ${product.title}`}>
        <img src={assetUrl(image) || "https://placehold.co/160x120?text=CampusKart"} alt={product.title} />
      </button>
      <div className="cart-item-info">
        <button className="cart-item-title" onClick={(event) => { event.stopPropagation(); onOpen(product); }}>{product.title}</button>
        <span className="cart-item-category">{product.category} · {product.condition || "Good"}</span>
        <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
      </div>
      <div className="cart-item-actions"><button className="cart-buy-btn" onClick={(event) => event.stopPropagation()} disabled={product.status === "sold" || Number(product.quantity ?? 1) <= 0 || (product.ownerId && String(product.ownerId) === String(JSON.parse(localStorage.getItem("campuskart_user") || "{}").id))} onClick={() => onBuy(product, 1)}>Buy</button><button className="remove-cart-btn" onClick={(event) => { event.stopPropagation(); onRemove(product.id || product._id); }}>Remove</button></div>
    </article>
  );
}

/** Account sidebar and content shared by the /profile and /cart routes. */
export default function ProfilePage({ user, cartProducts, myProducts = [], orders = [], notifications = [], activeSection, onNavigate, onRemoveFromCart, onOpenProduct, onBuyProduct, onBuyAll, onOpenNotifications, onLogout, onBrowse }) {
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
          <NavLink className={({ isActive }) => isActive ? "selected" : ""} to="/profile"><span>♙</span> Profile overview</NavLink>
          <NavLink className={({ isActive }) => isActive ? "selected" : ""} to="/cart"><span>🛒</span> My cart <b>{cartProducts.length}</b></NavLink>
          <NavLink className={({ isActive }) => isActive ? "selected" : ""} to="/your-listings"><span>📦</span> Your listings <b>{myProducts.length}</b></NavLink>
          <NavLink className={({ isActive }) => isActive ? "selected" : ""} to="/orders"><span>🧾</span> Orders <b>{orders.length}</b></NavLink>
          <NavLink className={({ isActive }) => isActive ? "selected" : ""} to="/notifications" onClick={onOpenNotifications}><span>🔔</span> Notifications <b>{notifications.filter((item) => !item.read).length}</b></NavLink>
        </nav>
        <div className="account-sidebar-bottom">
          <button className="signout-btn" onClick={onLogout}><span>↪</span> Sign out</button>
        </div>
      </aside>

      <section className="account-content">
        <div className="account-page-heading">
          <div><span className="section-kicker">CampusKart account</span><h1>{{cart:"My cart", listings:"Your listings", orders:"Orders", notifications:"Notifications"}[activeSection] || "Profile overview"}</h1><p>{{cart:"Review the items you've saved for later.", listings:"Manage the items you're selling on campus.", orders:"Items you have purchased.", notifications:"Updates about activity on your listings."}[activeSection] || "Manage your account and marketplace activity."}</p></div>
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
                  <div className="cart-list">{cartProducts.slice(0, 3).map((product) => <CartItem key={product.id || product._id} product={product} onRemove={onRemoveFromCart} onOpen={onOpenProduct} onBuy={onBuyProduct} />)}</div>
                  {cartProducts.length > 3 && <button className="secondary-btn cart-view-all" onClick={() => onNavigate("cart")}>View all {cartProducts.length} items</button>}
                </>
              ) : (
                <div className="cart-empty compact-empty"><span>🛒</span><h3>Your cart is empty</h3><p>Browse the marketplace and add items you like.</p><button className="primary-btn" onClick={onBrowse}>Browse marketplace</button></div>
              )}
            </section>
          </>
        ) : activeSection === "listings" ? (
          <section className="account-panel">
            <div className="panel-heading"><div><h2>Your listings</h2><p>Items you have published for sale.</p></div><span className="cart-total-count">{myProducts.length} items</span></div>
            {myProducts.length ? <div className="cart-list">{myProducts.map((product) => (
              <article className="cart-item" key={product.id || product._id}>
                <button className="cart-item-image" onClick={() => onOpenProduct(product)}><img src={assetUrl(product.images?.[0] || product.image) || "https://placehold.co/160x120?text=CampusKart"} alt={product.title} /></button>
                <div className="cart-item-info"><strong>{product.title}</strong><span className="cart-item-category">{product.category} · {product.status === "sold" ? "Sold" : "Available"}</span><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong></div>
                <span className="account-status">{product.status === "sold" ? "Sold" : "For sale"}</span>
              </article>
            ))}</div> : <div className="cart-empty"><span>📦</span><h3>No listings yet</h3><p>Items you publish will appear here.</p><button className="primary-btn" onClick={onBrowse}>Browse marketplace</button></div>}
          </section>
        ) : activeSection === "orders" ? (
          <section className="account-panel">
            <div className="panel-heading"><div><h2>Your orders</h2><p>Purchases recorded on CampusKart. No payment is processed.</p></div></div>
            {orders.length ? <div className="cart-list">{orders.map((order) => <article className="cart-item order-item-clickable" key={order.id} role={order.product ? "button" : undefined} tabIndex={order.product ? 0 : undefined} onClick={() => order.product && onOpenProduct(order.product)} onKeyDown={(event) => { if (order.product && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onOpenProduct(order.product); } }}>{order.product?.image && <img className="cart-item-image" src={assetUrl(order.product.image)} alt={order.product.title || "Purchased item"} />}<div className="cart-item-info"><strong>{order.product?.title || "Listing no longer available"}</strong><span className="cart-item-category">{new Date(order.createdAt).toLocaleString()} · {order.status} · Qty {order.quantity || 1}</span>{order.product && <strong>₹{(Number(order.product.price) * Number(order.quantity || 1)).toLocaleString("en-IN")}</strong>}</div></article>)}</div> : <div className="cart-empty"><span>🧾</span><h3>No orders yet</h3><p>Items you buy will appear here.</p><button className="primary-btn" onClick={onBrowse}>Browse marketplace</button></div>}
          </section>
        ) : activeSection === "notifications" ? (
          <section className="account-panel">
            <div className="panel-heading"><div><h2>Notifications</h2><p>Activity on your listings.</p></div></div>
            {notifications.length ? <div className="cart-list">{[...notifications].reverse().map((notification) => <article className="cart-item" key={notification.id}><div className="cart-item-info"><strong>{notification.message}</strong><span className="cart-item-category">{new Date(notification.createdAt).toLocaleString()}</span></div></article>)}</div> : <div className="cart-empty"><span>🔔</span><h3>You're all caught up</h3><p>When someone buys your item, you'll see it here.</p></div>}
          </section>
        ) : (
          <section className="account-panel">
            <div className="panel-heading"><div><h2>Saved items</h2><p>Items you've added to your cart.</p></div></div>
            {cartProducts.length ? (
              <>
                <div className="cart-list">{cartProducts.map((product) => <CartItem key={product.id || product._id} product={product} onRemove={onRemoveFromCart} onOpen={onOpenProduct} />)}</div>
                <div className="cart-summary"><span>Estimated total</span><strong>₹{total.toLocaleString("en-IN")}</strong><small>This is an estimate only. No payment is taken in CampusKart.</small></div>
                <button className="primary-btn" onClick={onBuyAll}>Buy all</button>
                <button className="secondary-btn" onClick={onBrowse}>Continue browsing</button>
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
