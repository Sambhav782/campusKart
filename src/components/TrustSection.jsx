// Explains the three-step campus exchange flow.
export default function TrustSection({ onSell }) {
  const steps = [
    ["01", "Post in seconds", "Add a photo, price and a few details. That's it."],
    ["02", "Connect locally", "Chat with verified students from your campus."],
    ["03", "Meet & exchange", "Agree on a spot and complete the handoff on campus."]
  ];

  return (
    <section className="trust-section" id="how-it-works">
      <div className="trust-copy">
        <span className="section-kicker">Built for campus life</span>
        <h2>A marketplace that feels like your campus.</h2>
        <p>No strangers. No complicated shipping. Just students helping students get more value from things they already own.</p>
        <button className="primary-btn" onClick={onSell}>List your first item <span>→</span></button>
      </div>

      <div className="steps">
        {steps.map(([number, title, text]) => (
          <div className="step" key={number}>
            <span>{number}</span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
