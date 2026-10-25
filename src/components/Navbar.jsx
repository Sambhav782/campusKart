import React from "react";
// Top navigation and main actions.
export default function Navbar({ onSell, onLogin, onProfile, onNotify, onHome, onHowItWorks, darkMode, onToggleDarkMode, user, cartCount = 0 }) {
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <header className="navbar">
      <div className="nav-inner">
        <button className="brand" onClick={onHome}>
          <span className="brand-mark">K</span>
          <span>Campus<span>Kart</span></span>
        </button>

        <nav className="nav-links">
          <button className="active" onClick={onHome}>Marketplace</button>
          <button onClick={onHowItWorks}>How it works</button>
          <button onClick={() => onNotify("Community features are coming next.")}>Community</button>
        </nav>

        <div className="nav-actions">
          <button className="theme-btn" onClick={onToggleDarkMode} aria-label="Toggle dark mode">{darkMode ? "☀" : "☾"}</button>
          <button className="sell-btn" onClick={onSell}>＋ Sell an item</button>
          <button className="profile-btn" onClick={user ? onProfile : onLogin} title={user ? `${user.name}'s profile` : "Sign in"} aria-label={user ? "Open profile and cart" : "Sign in"}>
            <span className="avatar profile-avatar">{initial}</span>
            {cartCount > 0 && <span className="cart-count" aria-label={`${cartCount} items in cart`}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
