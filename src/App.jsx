import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { products as demoProducts } from "./data/products";
import { apiRequest } from "./lib/api";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Marketplace from "./components/Marketplace";
import ExplorePage from "./components/ExplorePage";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";
import ProfilePage from "./components/ProfilePage";
import { ProductModal, SellModal, LoginModal } from "./components/Modals";

// Read persisted data safely so malformed localStorage does not crash the app.
function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("campuskart_user") || "null");
  } catch {
    return null;
  }
}

export default function App() {
  const navigate = useNavigate();

  // Listings and Explore filters are shared across the homepage and Explore.
  const [products, setProducts] = useState(demoProducts);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Modal visibility and the currently selected listing.
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSell, setShowSell] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Browser-local preferences and cart data.
  const [favorites, setFavorites] = useState(() => readStoredArray("campuskart_favorites"));
  const [cartIds, setCartIds] = useState(() =>
    readStoredArray("campuskart_cart").map(String)
  );
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(readStoredUser);
  const [apiOnline, setApiOnline] = useState(false);
  const [toast, setToast] = useState("");

  // Feedback messages are transient and do not affect routing.
  function notify(message) {
    setToast(message);
    clearTimeout(window.__campusKartToast);
    window.__campusKartToast = setTimeout(() => setToast(""), 2800);
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  // Route helpers keep all navigation decisions in one place.
  function goToExplore(category = "All", query = "") {
    setActiveCategory(category);
    setSearch(query);
    navigate("/explore");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitSearch() {
    navigate("/explore");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetHome() {
    setActiveCategory("All");
    setSearch("");
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showHowItWorks() {
    navigate("/");
    setTimeout(() => scrollToSection("how-it-works"), 0);
  }

  function openSellModal() {
    if (!user) {
      setShowLogin(true);
      notify("Sign in to publish a listing.");
      return;
    }
    setShowSell(true);
  }

  // Persist favorites whenever a product is liked or unliked.
  function toggleFavorite(id) {
    setFavorites((current) => {
      const productId = String(id);
      const next = current.map(String).includes(productId)
        ? current.filter((itemId) => String(itemId) !== productId)
        : [...current, productId];

      localStorage.setItem("campuskart_favorites", JSON.stringify(next));
      return next;
    });
  }

  function addToCart(product) {
    if (!user) {
      setShowLogin(true);
      notify("Sign in to add items to your cart.");
      return;
    }

    const id = String(product.id || product._id);
    if (cartIds.includes(id)) {
      notify("This item is already in your cart.");
      return;
    }

    setCartIds((current) => {
      const next = [...current, id];
      localStorage.setItem("campuskart_cart", JSON.stringify(next));
      return next;
    });
    notify("Added to your cart.");
  }

  function removeFromCart(productId) {
    setCartIds((current) => {
      const next = current.filter((id) => id !== String(productId));
      localStorage.setItem("campuskart_cart", JSON.stringify(next));
      return next;
    });
    notify("Item removed from your cart.");
  }

  // Load live listings and restore the session when the app starts.
  useEffect(() => {
    let active = true;

    apiRequest("/products")
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setApiOnline(true);
      })
      .catch(() => {
        if (!active) return;
        setApiOnline(false);
        notify("API unavailable — showing demo listings. Start the backend for live features.");
      });

    if (localStorage.getItem("campuskart_token")) {
      apiRequest("/auth/me")
        .then((data) => {
          if (!active) return;
          setUser(data.user);
          localStorage.setItem("campuskart_user", JSON.stringify(data.user));
        })
        .catch(() => {
          if (!active) return;
          localStorage.removeItem("campuskart_token");
          localStorage.removeItem("campuskart_user");
          setUser(null);
        });
    }

    return () => {
      active = false;
    };
  }, []);

  // Authentication and publishing actions call the existing Express API.
  async function handleAuth(form) {
    const endpoint = form.mode === "register" ? "/auth/register" : "/auth/login";
    const result = await apiRequest(endpoint, { method: "POST", body: form });

    localStorage.setItem("campuskart_token", result.token);
    localStorage.setItem("campuskart_user", JSON.stringify(result.user));
    setUser(result.user);
    setShowLogin(false);
    notify(`Welcome ${result.user.name}!`);
  }

  async function handlePublish(form) {
    if (!user) throw new Error("Please sign in before publishing a listing.");
    if (!apiOnline) throw new Error("The backend is offline. Start the backend and try again.");

    const saved = await apiRequest("/products", { method: "POST", body: form });
    setProducts((current) => [saved, ...current]);
    setShowSell(false);
    notify("Your listing has been published.");
  }

  function handleLogout() {
    localStorage.removeItem("campuskart_token");
    localStorage.removeItem("campuskart_user");
    setUser(null);
    navigate("/");
    notify("You have signed out.");
  }

  const cartProducts = products.filter((product) =>
    cartIds.includes(String(product.id || product._id))
  );

  // The same account component serves both /profile and /cart.
  function renderAccountPage(section) {
    return (
      <ProfilePage
        user={user}
        cartProducts={cartProducts}
        activeSection={section}
        onNavigate={(page) => navigate(`/${page}`)}
        onRemoveFromCart={removeFromCart}
        onOpenProduct={setSelectedProduct}
        onLogout={handleLogout}
        onBrowse={() => goToExplore()}
      />
    );
  }

  return (
    <div className={darkMode ? "app-shell dark-mode" : "app-shell"}>
      {/* Shared navigation remains mounted across all routes. */}
      <Navbar
        onSell={openSellModal}
        onLogin={() => setShowLogin(true)}
        onProfile={() => user ? navigate("/profile") : setShowLogin(true)}
        onNotify={(message) => notify(message || "You're all caught up.")}
        onHome={resetHome}
        onExplore={() => goToExplore(activeCategory, search)}
        onHowItWorks={showHowItWorks}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((current) => !current)}
        user={user}
        cartCount={cartIds.length}
        search={search}
        setSearch={setSearch}
        onSearch={submitSearch}
      />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero search={search} setSearch={setSearch} onSearch={submitSearch} />
                <Categories
                  activeCategory={activeCategory}
                  onCategory={(category) => goToExplore(category)}
                  onViewAll={() => goToExplore()}
                />
                <Marketplace
                  products={products}
                  activeCategory="All"
                  search=""
                  favorites={favorites}
                  onFavorite={toggleFavorite}
                  onOpen={setSelectedProduct}
                  limit={4}
                  showFilters={false}
                  onViewAll={() => goToExplore()}
                />
                <TrustSection onSell={openSellModal} />
              </>
            }
          />

          <Route
            path="/explore"
            element={
              <ExplorePage
                products={products}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                search={search}
                favorites={favorites}
                onFavorite={toggleFavorite}
                onOpen={setSelectedProduct}
                onClear={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
              />
            }
          />

          <Route path="/profile" element={user ? renderAccountPage("profile") : <Navigate to="/" replace />} />
          <Route path="/cart" element={user ? renderAccountPage("cart") : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer onFeedback={() => notify("Thanks for the feedback!")} />

      {/* Modals are outside Routes so they work from any page. */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onMessage={() => notify("Seller messaging is not implemented yet.")}
          onAddToCart={() => addToCart(selectedProduct)}
          isInCart={cartIds.includes(String(selectedProduct.id || selectedProduct._id))}
        />
      )}
      {showSell && <SellModal onClose={() => setShowSell(false)} onPublish={handlePublish} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleAuth} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}
