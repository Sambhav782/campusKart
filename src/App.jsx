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
import ProductDetailPage from "./components/ProductDetailPage";

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

  // Favorites remain browser-local; the authenticated user's cart lives on the backend.
  const [favorites, setFavorites] = useState(() => readStoredArray("campuskart_favorites"));
  const [cartProducts, setCartProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

  function openProduct(product) {
    navigate(`/product/${encodeURIComponent(String(product.id || product._id))}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  async function refreshCart() {
    if (!localStorage.getItem("campuskart_token")) {
      setCartProducts([]);
      return;
    }
    setCartLoading(true);
    try {
      setCartProducts(await apiRequest("/cart"));
    } catch (error) {
      notify(error.message || "Could not load your cart.");
    } finally {
      setCartLoading(false);
    }
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

  async function addToCart(product) {
    if (!user) {
      setShowLogin(true);
      notify("Sign in to add items to your cart.");
      return;
    }
    const id = String(product.id || product._id);
    if (cartProducts.some((item) => String(item.id || item._id) === id)) {
      notify("This item is already in your cart.");
      return;
    }
    try {
      setCartProducts(await apiRequest(`/cart/${encodeURIComponent(id)}`, { method: "POST" }));
      notify("Added to your cart.");
    } catch (error) {
      notify(error.message || "Could not add this item.");
    }
  }

  async function removeFromCart(productId) {
    try {
      setCartProducts(await apiRequest(`/cart/${encodeURIComponent(productId)}`, { method: "DELETE" }));
      notify("Item removed from your cart.");
    } catch (error) {
      notify(error.message || "Could not remove this item.");
    }
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
        .then(async (data) => {
          if (!active) return;
          setUser(data.user);
          localStorage.setItem("campuskart_user", JSON.stringify(data.user));
          setCartProducts(await apiRequest("/cart"));
          const [mine, purchases, alerts] = await Promise.all([apiRequest("/my-products"), apiRequest("/orders"), apiRequest("/notifications")]);
          setMyProducts(mine); setOrders(purchases); setNotifications(alerts);
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
    const [cart, mine, purchases, alerts] = await Promise.all([apiRequest("/cart"), apiRequest("/my-products"), apiRequest("/orders"), apiRequest("/notifications")]);
    setCartProducts(cart); setMyProducts(mine); setOrders(purchases); setNotifications(alerts);
    setShowLogin(false);
    notify(`Welcome ${result.user.name}!`);
  }

  async function handlePublish(form) {
    if (!user) throw new Error("Please sign in before publishing a listing.");
    if (!apiOnline) throw new Error("The backend is offline. Start the backend and try again.");

    const saved = await apiRequest("/products", { method: "POST", body: form });
    setProducts((current) => [saved, ...current]);
    setMyProducts((current) => [saved, ...current]);
    setShowSell(false);
    notify("Your listing has been published.");
  }

  async function openNotifications() {
    if (!user) { setShowLogin(true); return; }
    navigate("/notifications");
    try {
      const updated = await apiRequest("/notifications/read", { method: "POST" });
      setNotifications(updated);
    } catch (error) {
      notify(error.message || "Could not update notifications.");
    }
  }

  async function handleBuy(product, quantity = 1) {
    if (!user) { setShowLogin(true); notify("Sign in to buy this item."); return; }
    try {
      const result = await apiRequest(`/orders/${encodeURIComponent(product.id || product._id)}`, { method: "POST", body: { quantity } });
      const productId = String(product.id || product._id);
      setCartProducts((current) => current.filter((item) => String(item.id || item._id) !== productId));
      const updatedProduct = result.product;
      setProducts((current) => current.map((item) => String(item.id || item._id) === productId ? updatedProduct : item).filter((item) => Number(item.quantity ?? 1) > 0 && item.status !== "sold"));
      setMyProducts((current) => current.map((item) => String(item.id || item._id) === productId ? updatedProduct : item));
      setNotifications((current) => current);
      setOrders((current) => [{ ...result.order, product: result.product }, ...current]);
      if (Number(updatedProduct.quantity ?? 1) <= 0 || updatedProduct.status === "sold") navigate("/orders");
      notify("Purchase recorded. No payment was taken.");
    } catch (error) { notify(error.message || "Could not complete purchase."); }
  }

  async function handleBuyAll() {
    if (!user) { setShowLogin(true); notify("Sign in to buy these items."); return; }
    if (!cartProducts.length) { notify("Your cart is empty."); return; }
    try {
      const result = await apiRequest("/orders/bulk", { method: "POST" });
      const purchasedIds = new Set(result.orders.map((order) => String(order.productId)));
      setCartProducts([]);
      setOrders((current) => [...result.orders, ...current]);
      setProducts((current) => current.map((product) => {
        if (!purchasedIds.has(String(product.id || product._id))) return product;
        const remaining = Math.max(0, Number(product.quantity ?? 1) - 1);
        return { ...product, quantity: remaining, status: remaining <= 0 ? "sold" : "available" };
      }).filter((product) => Number(product.quantity ?? 1) > 0 && product.status !== "sold"));
      setMyProducts((current) => current.map((product) => {
        if (!purchasedIds.has(String(product.id || product._id))) return product;
        const remaining = Math.max(0, Number(product.quantity ?? 1) - 1);
        return { ...product, quantity: remaining, status: remaining <= 0 ? "sold" : "available" };
      }));
      notify(`Purchase recorded for ${result.orders.length} ${result.orders.length === 1 ? "item" : "items"}. No payment was taken.`);
      navigate("/orders");
    } catch (error) { notify(error.message || "Could not complete purchase."); }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm("Delete your CampusKart account permanently? This will also delete all listings you published. This cannot be undone.");
    if (!confirmed) return;
    try {
      await apiRequest("/account", { method: "DELETE" });
      localStorage.removeItem("campuskart_token");
      localStorage.removeItem("campuskart_user");
      setUser(null);
      setCartProducts([]); setMyProducts([]); setOrders([]); setNotifications([]);
      setProducts((current) => current.filter((product) => String(product.ownerId) !== String(user?.id)));
      navigate("/");
      notify("Your account and listings have been deleted.");
    } catch (error) {
      notify(error.message || "Could not delete your account.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("campuskart_token");
    localStorage.removeItem("campuskart_user");
    setUser(null);
    setCartProducts([]); setMyProducts([]); setOrders([]); setNotifications([]);
    navigate("/");
    notify("You have signed out.");
  }

  // The same account component serves both /profile and /cart.
  function renderAccountPage(section) {
    return (
      <ProfilePage
        user={user}
        cartProducts={cartProducts}
        myProducts={myProducts}
        orders={orders}
        notifications={notifications}
        activeSection={section}
        onNavigate={(page) => navigate(`/${page}`)}
        onRemoveFromCart={removeFromCart}
        onOpenProduct={openProduct}
        onBuyProduct={handleBuy}
        onBuyAll={handleBuyAll}
        onOpenNotifications={openNotifications}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
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
        onNotifications={openNotifications}
        onHome={resetHome}
        onExplore={() => goToExplore(activeCategory, search)}
        onHowItWorks={showHowItWorks}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((current) => !current)}
        user={user}
        notificationCount={notifications.filter((item) => !item.read).length}
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
                  onOpen={openProduct}
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
                onOpen={openProduct}
                onClear={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
              />
            }
          />

          <Route path="/product/:productId" element={<ProductDetailPage products={products} user={user} cartProducts={cartProducts} onBuy={handleBuy} onAddToCart={addToCart} notify={notify} />} />
          <Route path="/profile" element={user ? renderAccountPage("profile") : <Navigate to="/" replace />} />
          <Route path="/cart" element={user ? renderAccountPage("cart") : <Navigate to="/" replace />} />
          <Route path="/your-listings" element={user ? renderAccountPage("listings") : <Navigate to="/" replace />} />
          <Route path="/orders" element={user ? renderAccountPage("orders") : <Navigate to="/" replace />} />
          <Route path="/notifications" element={user ? renderAccountPage("notifications") : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer onFeedback={() => notify("Thanks for the feedback!")} />

      {/* Shared account and listing dialogs remain available on every route. */}
      {showSell && <SellModal onClose={() => setShowSell(false)} onPublish={handlePublish} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleAuth} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}
