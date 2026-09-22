import React, { useState } from "react";
import { products } from "./data/products";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Marketplace from "./components/Marketplace";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";
import { ProductModal, SellModal, LoginModal } from "./components/Modals";
import "./index.css";

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSell, setShowSell] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Show a short status message.
  const notify = (message) => {
    setToast(message);
    clearTimeout(window.__campusKartToast);
    window.__campusKartToast = setTimeout(() => setToast(""), 2400);
  };

  // Scroll to a page section.
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const selectCategory = (category) => {
    setActiveCategory(category);
    scrollTo("marketplace");
  };

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  };

  const resetHome = () => {
    setActiveCategory("All");
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={darkMode ? "app-shell dark-mode" : "app-shell"}>
      <Navbar
        onSell={() => setShowSell(true)}
        onLogin={() => setShowLogin(true)}
        onNotify={notify}
        onHome={resetHome}
        onHowItWorks={() => scrollTo("how-it-works")}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((current) => !current)}
      />

      <main>
        <Hero
          search={search}
          setSearch={setSearch}
          onSearch={() => scrollTo("marketplace")}
        />

        <Categories
          activeCategory={activeCategory}
          onCategory={selectCategory}
          onViewAll={() => {
            setActiveCategory("All");
            setSearch("");
          }}
        />

        <Marketplace
          products={products}
          activeCategory={activeCategory}
          search={search}
          favorites={favorites}
          onFavorite={toggleFavorite}
          onOpen={setSelectedProduct}
          onFilter={() => notify("Filters will be connected to the backend next.")}
          onSort={() => notify("Sorting preference saved for this session.")}
          onClear={() => {
            setSearch("");
            setActiveCategory("All");
          }}
        />

        <TrustSection onSell={() => setShowSell(true)} />
      </main>

      <Footer onFeedback={() => notify("Thanks for the feedback!")} />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onMessage={() => {
            setSelectedProduct(null);
            notify("Chat opened — seller contact is ready for the demo.");
          }}
        />
      )}

      {showSell && (
        <SellModal
          onClose={() => setShowSell(false)}
          onPublish={() => {
            setShowSell(false);
            notify("Demo listing saved! Backend connection comes next.");
          }}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={() => {
            setShowLogin(false);
            notify("Demo sign-in successful.");
          }}
          onGoogle={() => notify("Google sign-in will be connected later.")}
        />
      )}

      {toast && (
        <div className="toast">
          <span>✓</span>{toast}
        </div>
      )}
    </div>
  );
}
