import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Shared site header.
 * NavLink applies the active class based on the current URL.
 */
export default function Navbar({
  onSell,
  onLogin,
  onProfile,
  onNotify,
  onHome,
  onExplore,
  onHowItWorks,
  darkMode,
  onToggleDarkMode,
  user,
  notificationCount = 0,
  onNotifications,
  search,
  setSearch,
  onSearch,
}) {
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  function handleSearch(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <header className="navbar">
      <div className="nav-inner">
        <button className="brand" onClick={onHome}>
          <span className="brand-mark">K</span>
          <span>Campus<span>Kart</span></span>
        </button>

        {/* Route links support browser history and direct navigation. */}
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end onClick={onHome}>Home</NavLink>
          <NavLink to="/explore" onClick={onExplore}>Explore</NavLink>
        </nav>

        {/* Search always opens the Explore results page. */}
        <form className="nav-search" role="search" onSubmit={handleSearch}>
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search listings..."
            aria-label="Search listings"
          />
          {search && (
            <button
              type="button"
              className="nav-search-clear"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
          <button type="submit" className="nav-search-submit" aria-label="Show search results">
            Search
          </button>
        </form>

        <div className="nav-actions">
          <button
            className="theme-btn"
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀" : "☾"}
          </button>

          <button className="notification-btn" onClick={onNotifications} title="Notifications" aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ""}`}>
            🔔{notificationCount > 0 && <span className="notification-count">{notificationCount > 9 ? "9+" : notificationCount}</span>}
          </button>
          <button className="sell-btn sell-icon-btn" onClick={onSell} title="Sell an item" aria-label="Sell an item">＋</button>

          <button
            className="profile-btn"
            onClick={user ? onProfile : onLogin}
            title={user ? `${user.name}'s profile` : "Sign in"}
            aria-label={user ? "Open profile and cart" : "Sign in"}
          >
            <span className="avatar profile-avatar">{initial}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
