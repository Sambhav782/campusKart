import React from "react";
// Simple footer for the prototype.
export default function Footer({ onFeedback }) {
  return (
    <footer>
      <div className="footer-brand">
        <span className="brand-mark">K</span>
        <div><b>CampusKart</b><small>Your campus. Your marketplace.</small></div>
      </div>
      <div className="footer-note">Made for students, by students <span>✦</span></div>
      <div className="footer-links">
        <button>Privacy</button><button>Help</button><button onClick={onFeedback}>Feedback</button>
      </div>
    </footer>
  );
}
