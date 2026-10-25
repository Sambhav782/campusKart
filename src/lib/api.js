const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("campuskart_token");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body;
}
