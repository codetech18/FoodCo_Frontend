// Utility to manage the active order in localStorage

const KEY = "foodco_active_order_id";

export const saveOrderId = (id) => {
  try { localStorage.setItem(KEY, id); } catch (_) {}
};

export const getOrderId = () => {
  try { return localStorage.getItem(KEY); } catch (_) { return null; }
};

export const clearOrderId = () => {
  try { localStorage.removeItem(KEY); } catch (_) {}
};
