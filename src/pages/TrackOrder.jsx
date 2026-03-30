import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/config";

const STATUS_STEPS = ["pending", "in_progress", "ready", "completed"];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-500/15 border-yellow-500/30",
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-400",
    bg: "bg-blue-500/15 border-blue-500/30",
  },
  ready: {
    label: "Ready",
    color: "text-[#fa5631]",
    bg: "bg-[#fa5631]/15 border-[#fa5631]/30",
  },
  completed: {
    label: "Completed",
    color: "text-green-400",
    bg: "bg-green-500/15 border-green-500/30",
  },
};

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editItems, setEditItems] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [menuFilter, setMenuFilter] = useState("All");
  const [liveMenu, setLiveMenu] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "menu"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((item) => item.available !== false);
      setLiveMenu(items);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (!snap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = { id: snap.id, ...snap.data() };
      setOrder(data);
      setEditItems((prev) =>
        prev === null ? data.items.map((i) => ({ ...i })) : prev,
      );
      setLoading(false);
    });
    return unsub;
  }, [orderId]);

  const isPending = order?.status === "pending";
  const canAddMore =
    order?.status === "pending" || order?.status === "in_progress";

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const changeQty = (index, delta) => {
    setEditItems((prev) => {
      const next = [...prev];
      const newQty = next[index].qty + delta;
      if (newQty <= 0) return next.filter((_, i) => i !== index);
      next[index] = { ...next[index], qty: newQty };
      return next;
    });
  };

  const addMenuItem = (menuItem) => {
    setEditItems((prev) => {
      const existing = prev.findIndex((i) => i.name === menuItem.name);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], qty: next[existing].qty + 1 };
        return next;
      }
      return [...prev, { name: menuItem.name, price: menuItem.price, qty: 1 }];
    });
  };

  const editTotal = editItems
    ? editItems.reduce((sum, i) => sum + i.price * i.qty, 0)
    : 0;

  const saveChanges = async () => {
    if (!editItems || editItems.length === 0)
      return window.alert("You need at least one item in your order.");
    setSaving(true);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        items: editItems,
        total: editTotal,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      window.alert("Failed to save changes. Try again.");
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#fa5631] rounded-full animate-spin" />
      </div>
    );

  if (notFound)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/30 text-sm mb-4">Order not found.</p>
          <Link to="/menu" className="text-[#fa5631] underline text-sm">
            Go back to menu
          </Link>
        </div>
      </div>
    );

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const categories = ["All", ...new Set(liveMenu.map((m) => m.category))];
  const filteredMenu =
    menuFilter === "All"
      ? liveMenu
      : liveMenu.filter((m) => m.category === menuFilter);
  const lockedItemNames =
    !isPending && order?.items
      ? new Set(order.items.map((i) => i.name))
      : new Set();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── Full NavBar ─────────────────────────────────────────────────── */}
      <nav className="bg-[#111111] border-b border-white/5 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0.5 no-underline group">
            <span className="font-display text-xl font-black text-white group-hover:text-[#fa5631] transition-colors">
              FOOD
            </span>
            <span className="font-display text-xl font-black text-[#fa5631] italic">
              co.
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-6 list-none">
            {[
              { label: "Home", to: "/" },
              { label: "Menu", to: "/menu" },
              { label: "Order", to: "/order" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors no-underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <span className="text-sm font-medium text-[#fa5631] font-semibold">
                Tracking Order
              </span>
            </li>
          </ul>

          {/* Order ID pill — desktop */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5">
            <span className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">
              Order
            </span>
            <span className="text-white font-mono text-xs">
              {orderId.slice(-8).toUpperCase()}
            </span>
            <button
              onClick={handleCopyId}
              className={`text-[10px] font-semibold px-2 py-0.5 border transition-all cursor-pointer ${
                copied
                  ? "bg-green-500/20 border-green-500/30 text-green-400"
                  : "bg-transparent border-white/10 text-white/40 hover:text-white"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer bg-transparent border-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span
              className={`w-5 h-0.5 bg-white block transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`w-5 h-0.5 bg-white block transition-all ${mobileMenuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`w-5 h-0.5 bg-white block transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-72 border-t border-white/5" : "max-h-0"}`}
        >
          <ul className="py-4 flex flex-col gap-4 list-none">
            {[
              { label: "Home", to: "/" },
              { label: "Menu", to: "/menu" },
              { label: "Order", to: "/order" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-white/60 hover:text-white text-sm font-medium no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Order ID on mobile */}
            <li className="pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs">Order ID:</span>
                <span className="text-white font-mono text-xs">
                  {orderId.slice(-8).toUpperCase()}
                </span>
                <button
                  onClick={handleCopyId}
                  className={`text-[10px] font-semibold px-2 py-0.5 border transition-all cursor-pointer ${
                    copied
                      ? "bg-green-500/20 border-green-500/30 text-green-400"
                      : "bg-transparent border-white/10 text-white/40 hover:text-white"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-[#fa5631] text-xs font-semibold tracking-widest uppercase mb-3">
            <span className="w-6 h-px bg-[#fa5631]" />
            Order Tracking
          </div>
          <h1 className="font-display text-4xl font-black text-white mb-1">
            Hey, {order.customerName}!
          </h1>
          <p className="text-white/30 text-sm">Table {order.table}</p>
        </div>

        {/* Order ID box */}
        <div className="bg-[#111111] border border-white/8 p-4 mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-1">
              Order ID
            </p>
            <p className="text-white font-mono text-sm break-all">{orderId}</p>
          </div>
          <button
            onClick={handleCopyId}
            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border transition-all cursor-pointer ${
              copied
                ? "bg-green-500/20 border-green-500/30 text-green-400"
                : "bg-transparent border-white/15 text-white/50 hover:text-white hover:border-white/30"
            }`}
          >
            {copied ? (
              <>
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy ID
              </>
            )}
          </button>
        </div>

        {/* Status badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 border text-sm font-bold mb-8 ${cfg.bg} ${cfg.color}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              order.status === "pending"
                ? "bg-yellow-400 animate-pulse"
                : order.status === "in_progress"
                  ? "bg-blue-400 animate-pulse"
                  : order.status === "ready"
                    ? "bg-[#fa5631] animate-pulse"
                    : "bg-green-400"
            }`}
          />
          {cfg.label}
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        done
                          ? "bg-[#fa5631] border-[#fa5631] text-white"
                          : "bg-transparent border-white/15 text-white/20"
                      } ${active ? "ring-2 ring-[#fa5631]/30 ring-offset-2 ring-offset-[#0a0a0a]" : ""}`}
                    >
                      {i < currentStep ? (
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold tracking-wide text-center ${done ? "text-white/60" : "text-white/20"}`}
                    >
                      {STATUS_CONFIG[step].label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mb-5 transition-all ${i < currentStep ? "bg-[#fa5631]" : "bg-white/8"}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Status message */}
        <div className="bg-[#111111] border border-white/5 p-5 mb-8 text-sm text-white/50 leading-relaxed">
          {order.status === "pending" &&
            "⏳ Your order has been received and is waiting to be prepared. You can edit or add items below."}
          {order.status === "in_progress" &&
            "👨‍🍳 Your order is being prepared right now. You can still add new items but existing ones are locked."}
          {order.status === "ready" &&
            "🛎️ Your order is ready! A waiter will bring it to your table shortly."}
          {order.status === "completed" &&
            "✅ Your order has been served. Enjoy your meal!"}
        </div>

        {/* Order items */}
        <div className="bg-[#111111] border border-white/5 mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <p className="text-white font-bold text-sm">Your Order</p>
            {isPending && (
              <span className="text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 font-semibold">
                Editable
              </span>
            )}
            {order.status === "in_progress" && (
              <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 font-semibold">
                New items only
              </span>
            )}
          </div>

          <div className="p-5 space-y-3">
            {(editItems || order.items)?.map((item, i) => {
              const isLocked = !isPending && lockedItemNames.has(item.name);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-white/70 text-sm">{item.name}</span>
                    {isLocked && (
                      <span className="text-[10px] text-white/20 border border-white/10 px-1.5 py-0.5">
                        locked
                      </span>
                    )}
                  </div>
                  {!isLocked && (isPending || canAddMore) ? (
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => changeQty(i, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-white/8 hover:bg-red-500/60 text-white border border-white/10 transition-all cursor-pointer text-sm font-bold leading-none"
                      >
                        −
                      </button>
                      <div className="w-8 h-7 flex items-center justify-center bg-[#fa5631] text-white text-xs font-black border-y border-[#fa5631]">
                        {item.qty}
                      </div>
                      <button
                        onClick={() => changeQty(i, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white/8 hover:bg-[#fa5631] text-white border border-white/10 transition-all cursor-pointer text-sm font-bold leading-none"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="w-8 h-7 flex items-center justify-center bg-white/10 text-white/50 text-xs font-black">
                      {item.qty}
                    </span>
                  )}
                  <span className="text-white/40 text-xs w-24 text-right">
                    ₦{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              );
            })}
            <div className="pt-3 border-t border-white/5 flex justify-between">
              <span className="text-white/30 text-xs font-semibold uppercase tracking-wide">
                Total
              </span>
              <span className="text-[#fa5631] font-black text-sm">
                ₦
                {(canAddMore
                  ? editTotal
                  : Number(order.total || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          {canAddMore && (
            <div className="px-5 pb-5">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full border border-dashed border-white/15 hover:border-[#fa5631]/50 text-white/40 hover:text-[#fa5631] text-xs font-semibold py-3 transition-all cursor-pointer bg-transparent flex items-center justify-center gap-2"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {showAddMenu ? "Hide Menu" : "Add More Items"}
              </button>
            </div>
          )}
        </div>

        {/* Add items from live menu */}
        {canAddMore && showAddMenu && (
          <div className="bg-[#111111] border border-white/5 mb-6">
            <div className="px-5 py-4 border-b border-white/5">
              <p className="text-white font-bold text-sm mb-3">Add from Menu</p>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMenuFilter(cat)}
                    className={`px-3 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                      menuFilter === cat
                        ? "bg-[#fa5631] border-[#fa5631] text-white"
                        : "bg-transparent border-white/10 text-white/40 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5 space-y-2 max-h-72 overflow-y-auto">
              {filteredMenu.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-4">
                  No items available in this category.
                </p>
              ) : (
                filteredMenu.map((item) => {
                  const inOrder = editItems?.find((i) => i.name === item.name);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="text-white/70 text-sm">{item.name}</p>
                        <p className="text-[#fa5631] text-xs font-semibold">
                          ₦{Number(item.price).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => addMenuItem(item)}
                        className={`text-xs font-semibold px-3 py-1.5 border transition-all cursor-pointer ${
                          inOrder
                            ? "bg-[#fa5631]/20 border-[#fa5631]/40 text-[#fa5631]"
                            : "bg-transparent border-white/15 text-white hover:bg-[#fa5631] hover:border-[#fa5631]"
                        }`}
                      >
                        {inOrder ? `+1 (${inOrder.qty})` : "+ Add"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Save button */}
        {canAddMore && (
          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full bg-[#fa5631] hover:bg-[#e04420] disabled:opacity-50 text-white font-bold py-4 rounded-full transition-all cursor-pointer border-none flex items-center justify-center gap-2 mb-4"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
                </svg>
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        )}

        <p className="text-white/20 text-xs text-center">
          {isPending
            ? "Changes can only be made while your order is pending."
            : canAddMore
              ? "Your order is being prepared. You can still add new items."
              : "Your order can no longer be edited."}
        </p>
      </div>
    </div>
  );
};

export default TrackOrder;
