import React from "react";
// Top navigation and main actions.
export default function Navbar({ onSell, onLogin, onNotify, onHome, onHowItWorks }) {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <button className="brand" onClick={onHome}>
          <span className="brand-mark">K</span>
          <span>Campus<span>Kart</span></span>
        </button>

        <nav className="nav-links">
          <button className="active">Marketplace</button>
          <button onClick={onHowItWorks}>How it works</button>
          <button onClick={() => onNotify("Community features are coming next.")}>Community</button>
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" onClick={() => onNotify("You're all caught up.")}>
            ♢<span className="notification-dot" />
          </button>
          <button className="sell-btn" onClick={onSell}>＋ Sell an item</button>
          <button className="profile-btn" onClick={onLogin}>
            <span className="avatar small">S</span>
            <span className="profile-name">Sambhav</span>
            <span className="chevron">⌄</span>
          </button>
        </div>
      </div>
    </header>
  );
}
