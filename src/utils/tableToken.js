// ── Table Token Utility ───────────────────────────────────────────────────────
// Tokens are derived from restaurantId + table + date (daily rotation)
// They're not cryptographically secure but they're practical —
// a remote customer won't know today's token without scanning the QR code.

const TOKEN_KEY = "servrr_table_token";
const TOKEN_TTL = 3 * 60 * 60 * 1000; // 3 hours in ms

// Generate a deterministic daily token for a given restaurant + table
// Uses a simple hash so it changes every day automatically
export const generateToken = (restaurantId, table) => {
  const today = new Date().toISOString().split("T")[0]; // "2026-04-19"
  const secret = `${restaurantId}::${table}::${today}::servrr`;
  // Simple non-crypto hash — good enough for this use case
  let hash = 0;
  for (let i = 0; i < secret.length; i++) {
    hash = (hash << 5) - hash + secret.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(8, "0");
};

// Save a verified token to localStorage with expiry
export const saveTableSession = (restaurantId, table, token) => {
  const session = {
    restaurantId,
    table,
    token,
    expiresAt: Date.now() + TOKEN_TTL,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
};

// Retrieve and validate the stored session
export const getTableSession = (restaurantId) => {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Must match current restaurant
    if (session.restaurantId !== restaurantId) return null;
    // Must not be expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    // Validate token against today's expected value
    const expected = generateToken(restaurantId, session.table);
    if (session.token !== expected) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return session; // { restaurantId, table, token, expiresAt }
  } catch {
    return null;
  }
};

// Clear the session (e.g. after order placed)
export const clearTableSession = () => {
  localStorage.removeItem(TOKEN_KEY);
};
