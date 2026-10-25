import React, { useEffect, useState } from "react";
import { products as demoProducts } from "./data/products";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Marketplace from "./components/Marketplace";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";
import { ProductModal, SellModal, LoginModal } from "./components/Modals";
import { apiRequest } from "./lib/api";
import "./index.css";

export default function App() {
  const [products, setProducts] = useState(demoProducts);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSell, setShowSell] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("campuskart_favorites") || "[]"); }
    catch { return []; }
  });
  const [toast, setToast] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("campuskart_user") || "null"); }
    catch { return null; }
  });
  const [apiOnline, setApiOnline] = useState(false);

  const notify = (message) => {
    setToast(message);
    clearTimeout(window.__campusKartToast);
    window.__campusKartToast = setTimeout(() => setToast(""), 2800);
  };
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const selectCategory = (category) => { setActiveCategory(category); scrollTo("marketplace"); };
  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id];
      localStorage.setItem("campuskart_favorites", JSON.stringify(next));
      return next;
    });
  };
  const resetHome = () => {
    setActiveCategory("All");
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let active = true;
    apiRequest("/products").then((data) => {
      if (active) { setProducts(data); setApiOnline(true); }
    }).catch(() => {
      if (active) { setApiOnline(false); notify("API unavailable — showing demo listings. Start the backend for live features."); }
    });
    if (localStorage.getItem("campuskart_token")) {
      apiRequest("/auth/me").then((data) => {
        if (active) { setUser(data.user); localStorage.setItem("campuskart_user", JSON.stringify(data.user)); }
      }).catch(() => {
        localStorage.removeItem("campuskart_token");
        localStorage.removeItem("campuskart_user");
        if (active) setUser(null);
      });
    }
    return () => { active = false; };
  }, []);

  const handleAuth = async (form) => {
    const endpoint = form.mode === "register" ? "/auth/register" : "/auth/login";
    const result = await apiRequest(endpoint, { method: "POST", body: form });
    localStorage.setItem("campuskart_token", result.token);
    localStorage.setItem("campuskart_user", JSON.stringify(result.user));
    setUser(result.user);
    setShowLogin(false);
    notify(`Welcome ${result.user.name}!`);
  };

  const handlePublish = async (form) => {
    if (!user) throw new Error("Please sign in before publishing a listing.");
    if (!apiOnline) throw new Error("The backend is offline. Start the backend and try again.");
    const saved = await apiRequest("/products", { method: "POST", body: form });
    setProducts((current) => [saved, ...current]);
    setShowSell(false);
    notify("Your listing has been published.");
  };

  const handleLogout = () => {
    localStorage.removeItem("campuskart_token");
    localStorage.removeItem("campuskart_user");
    setUser(null);
    notify("You have signed out.");
  };

  return (
    <div className={darkMode ? "app-shell dark-mode" : "app-shell"}>
      <Navbar
        onSell={() => { if (!user) { setShowLogin(true); notify("Sign in to publish a listing."); } else setShowSell(true); }}
        onLogin={() => user ? handleLogout() : setShowLogin(true)}
        onNotify={() => notify(user ? "You're all caught up." : "Sign in to access your account.")}
        onHome={resetHome}
        onHowItWorks={() => scrollTo("how-it-works")}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((current) => !current)}
        user={user}
      />
      <main>
        <Hero search={search} setSearch={setSearch} onSearch={() => scrollTo("marketplace")} />
        <Categories activeCategory={activeCategory} onCategory={selectCategory} onViewAll={() => { setActiveCategory("All"); setSearch(""); }} />
        <Marketplace
          products={products}
          activeCategory={activeCategory}
          search={search}
          favorites={favorites}
          onFavorite={toggleFavorite}
          onOpen={setSelectedProduct}
          onFilter={() => notify("Use search and categories to narrow listings.")}
          onSort={(event) => {
            const mode = event.target.value;
            setProducts((current) => [...current].sort((a, b) => mode === "Price: low to high" ? a.price - b.price : mode === "Newest first" ? new Date(b.createdAt || 0) - new Date(a.createdAt || 0) : 0));
          }}
          onClear={() => { setSearch(""); setActiveCategory("All"); }}
        />
        <TrustSection onSell={() => { if (user) setShowSell(true); else setShowLogin(true); }} />
      </main>
      <Footer onFeedback={() => notify("Thanks for the feedback!")} />
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onMessage={() => notify("Seller messaging is not implemented yet.")} />}
      {showSell && <SellModal onClose={() => setShowSell(false)} onPublish={handlePublish} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleAuth} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}
