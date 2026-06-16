// ── Table Session Utility ─────────────────────────────────────────────────────
// Tracks the active table session for this browser tab in sessionStorage.
// Tab-scoped (not localStorage) so two tabs/devices never share a session id
// by accident. The session doc itself (status/total/etc.) always comes live
// from Firestore — this only remembers which session this tab belongs to.

const SESSION_KEY = "servrr_active_session";

export const saveActiveSession = (restaurantId, table, sessionId) => {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ restaurantId, table, sessionId })
  );
};

export const getActiveSession = (restaurantId) => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.restaurantId !== restaurantId) return null;
    return { table: s.table, sessionId: s.sessionId };
  } catch {
    return null;
  }
};

export const clearActiveSession = () => sessionStorage.removeItem(SESSION_KEY);
