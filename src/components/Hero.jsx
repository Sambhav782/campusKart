// Landing section with search and a small product preview.
import { products } from "../data/products";

export default function Hero({ search, setSearch, onSearch }) {
  return (
    <section className="hero">
      <div className="hero-glow one" />
      <div className="hero-glow two" />
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> GNIOT student marketplace</div>
          <h1>Buy smarter.<br /><em>Sell easier.</em><br />Stay on campus.</h1>
          <p>Everything students need, exchanged within their own campus community.</p>

          <div className="hero-search">
            <span className="search-icon">⌕</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search books, electronics, furniture..." />
            <button onClick={onSearch}>Search</button>
          </div>

          <div className="hero-meta">
            <span><b>2.4k+</b> listings</span><i />
            <span><b>1.8k+</b> students</span><i />
            <span><b>98%</b> campus verified</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="float-card card-a">
            <span className="float-icon green">✓</span>
            <div><strong>Sold!</strong><small>Engineering book</small></div>
            <b>₹280</b>
          </div>

          <div className="product-visual">
            <div className="visual-grid" />
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="mini-brand"><span>K</span> CampusKart</div>
                <div className="mini-search">⌕ Search anything...</div>
                <div className="mini-cats"><span>Books</span><span>Tech</span><span>Hostel</span></div>
                {[products[0], products[3]].map((product) => (
                  <div className="mini-card" key={product.id}>
                    <img src={product.image} alt="" />
                    <div><b>{product.title}</b><small>{product.condition}</small><strong>₹{product.price}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="float-card card-b">
            <span className="float-icon blue">♢</span>
            <div><strong>Campus verified</strong><small>Safe student-to-student</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}
