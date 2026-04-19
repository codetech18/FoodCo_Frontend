// ── Table Session Utility ─────────────────────────────────────────────────────
// Manages the active table session in localStorage
// A session links multiple orders from the same table together

const SESSION_KEY = "servrr_table_session";

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = (restaurantId) => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.restaurantId !== restaurantId) return null;
    if (s.status === "closed" || s.status === "paid") {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
};

export const clearSession = () => localStorage.removeItem(SESSION_KEY);

export const updateSession = (updates) => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...s, ...updates }));
  } catch {}
};
