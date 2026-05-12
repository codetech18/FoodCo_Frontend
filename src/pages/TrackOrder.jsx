import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useRestaurant } from "../context/RestaurantContext";

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
  const { orderId, restaurantId } = useParams();
  const { profile } = useRestaurant();

  // Dynamic accent from profile
  const accent = profile?.accentColor || "#fa5631";
  const name = profile?.name || "FOODco";
  const logo = profile?.logoUrl || null;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editItems, setEditItems] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tableSession, setTableSession] = useState(null);
  const [requestingBill, setRequestingBill] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    return onSnapshot(
      doc(db, "restaurants", restaurantId, "orders", orderId),
      (snap) => {
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
      },
    );
  }, [orderId, restaurantId]);

  useEffect(() => {
    if (!order?.sessionId) {
      setTableSession(null);
      return;
    }
    return onSnapshot(
      doc(db, "restaurants", restaurantId, "tableSessions", order.sessionId),
      (snap) => {
        setTableSession(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      },
    );
  }, [order?.sessionId, restaurantId]);

  const isPaidOnline = order?.paymentStatus === "paid";
  const isPending = order?.status === "pending";
  const canEditOrder = !isPaidOnline && isPending;

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

  const editTotal = editItems
    ? editItems.reduce((sum, i) => sum + i.price * i.qty, 0)
    : 0;

  const saveChanges = async () => {
    if (isPaidOnline) return window.alert("This order has already been paid.");
    if (!isPending) return window.alert("This order can no longer be edited.");
    if (!editItems || editItems.length === 0)
      return window.alert("You need at least one item.");
    setSaving(true);
    try {
      await updateDoc(doc(db, "restaurants", restaurantId, "orders", orderId), {
        items: editItems,
        total: editTotal,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      window.alert("Failed to save. Try again.");
    }
    setSaving(false);
  };

  const handleRequestBill = async () => {
    if (!order?.sessionId || requestingBill) return;
    setRequestingBill(true);
    try {
      await updateDoc(
        doc(db, "restaurants", restaurantId, "tableSessions", order.sessionId),
        {
          status: "awaiting_payment",
          billRequestedAt: serverTimestamp(),
        },
      );
    } catch (err) {
      window.alert("Failed to request bill. Try again.");
    } finally {
      setRequestingBill(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 border-white/10 rounded-full animate-spin"
          style={{ borderTopColor: accent }}
        />
      </div>
    );

  if (notFound)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/30 text-sm mb-4">Order not found.</p>
          <Link
            to={`/${restaurantId}/menu`}
            className="underline text-sm"
            style={{ color: accent }}
          >
            Go back to menu
          </Link>
        </div>
      </div>
    );

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const lockedItemNames =
    !isPending && order?.items
      ? new Set(order.items.map((i) => i.name))
      : new Set();
  const sessionStatus = tableSession?.status;
  const billAlreadyRequested = sessionStatus === "awaiting_payment";
  const billClosed = sessionStatus === "paid" || sessionStatus === "closed";
  const canRequestBill =
    Boolean(order.sessionId) &&
    !isPaidOnline &&
    !billAlreadyRequested &&
    !billClosed;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── NavBar ── */}
      <nav className="bg-[#111111] border-b border-white/5 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          {/* Dynamic logo */}
          <Link
            to={`/${restaurantId}`}
            className="flex items-center gap-2 no-underline group"
          >
            {logo ? (
              <img
                src={logo}
                alt={name}
                className="h-7 w-auto object-contain"
              />
            ) : (
              <span
                className="font-display text-xl font-black text-white group-hover:transition-colors"
                style={{ color: undefined }}
                onMouseEnter={(e) => (e.target.style.color = accent)}
                onMouseLeave={(e) => (e.target.style.color = "white")}
              >
                {name}
              </span>
            )}
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-6 list-none">
            {[
              { label: "Home", to: `/${restaurantId}` },
              { label: "Menu", to: `/${restaurantId}/menu` },
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
              <span className="text-sm font-semibold" style={{ color: accent }}>
                Tracking Order
              </span>
            </li>
          </ul>

          {/* Order ID pill */}
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
              { label: "Home", to: `/${restaurantId}` },
              { label: "Menu", to: `/${restaurantId}/menu` },
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

      {/* ── Page content ── */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: accent }}
          >
            <span className="w-6 h-px" style={{ background: accent }} />
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
                    ? "animate-pulse"
                    : "bg-green-400"
            }`}
            style={order.status === "ready" ? { background: accent } : {}}
          />
          {cfg.label}
        </div>

        {/* Progress bar — accent-colored */}
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
                          ? "text-white"
                          : "bg-transparent border-white/15 text-white/20"
                      }`}
                      style={
                        done
                          ? {
                              background: accent,
                              borderColor: accent,
                              boxShadow: active
                                ? `0 0 0 3px ${accent}30`
                                : undefined,
                            }
                          : {}
                      }
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
                      className="flex-1 h-0.5 mb-5 transition-all"
                      style={{
                        background:
                          i < currentStep ? accent : "rgba(255,255,255,0.08)",
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Status message */}
        <div className="bg-[#111111] border border-white/5 p-5 mb-8 text-sm text-white/50 leading-relaxed">
          {isPaidOnline &&
            "Your payment is confirmed. Staff will prepare the order exactly as paid."}
          {!isPaidOnline && order.status === "pending" &&
            "⏳ Your order has been received and is waiting to be prepared. You can edit it below while it is still pending."}
          {!isPaidOnline && order.status === "in_progress" &&
            "👨‍🍳 Your order is being prepared right now. To add more food, go back to the menu and place another order."}
          {!isPaidOnline && order.status === "ready" &&
            "🛎️ Your order is ready! A waiter will bring it to your table shortly."}
          {!isPaidOnline && order.status === "completed" &&
            "✅ Your order has been served. Enjoy your meal!"}
        </div>

        {/* Payment / bill action */}
        {isPaidOnline ? (
          <div className="bg-green-500/10 border border-green-500/25 p-5 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center text-green-400">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-green-400 font-bold text-sm">Paid Online</p>
                <p className="text-white/40 text-xs">
                  Payment is confirmed and the table bill is closed.
                </p>
              </div>
            </div>
          </div>
        ) : order.sessionId ? (
          <div className="bg-[#111111] border border-white/5 p-5 mb-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-white font-bold text-sm">Table Bill</p>
                <p className="text-white/35 text-xs">
                  ₦{Number(tableSession?.totalBill || order.total || 0).toLocaleString()}
                </p>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-1 border ${
                  billAlreadyRequested
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/25"
                    : billClosed
                      ? "bg-white/5 text-white/30 border-white/10"
                      : "bg-green-500/10 text-green-400 border-green-500/25"
                }`}
              >
                {billAlreadyRequested
                  ? "Bill Requested"
                  : billClosed
                    ? "Closed"
                    : "Open"}
              </span>
            </div>
            {canRequestBill && (
              <button
                type="button"
                onClick={handleRequestBill}
                disabled={requestingBill}
                className="w-full bg-transparent border border-white/10 hover:border-white/30 text-white/60 hover:text-white font-semibold py-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-40"
              >
                {requestingBill ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                    </svg>
                    Request Bill
                  </>
                )}
              </button>
            )}
            {billAlreadyRequested && (
              <p className="text-white/30 text-xs">
                Your bill has been sent to staff. They will be with you shortly.
              </p>
            )}
          </div>
        ) : null}

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
                Locked
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
                  {canEditOrder ? (
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => changeQty(i, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-white/8 hover:bg-red-500/60 text-white border border-white/10 transition-all cursor-pointer text-sm font-bold leading-none"
                      >
                        −
                      </button>
                      <div
                        className="w-8 h-7 flex items-center justify-center text-white text-xs font-black border-y"
                        style={{ background: accent, borderColor: accent }}
                      >
                        {item.qty}
                      </div>
                      <button
                        onClick={() => changeQty(i, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white/8 text-white border border-white/10 transition-all cursor-pointer text-sm font-bold leading-none hover:text-white"
                        style={{}}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = accent)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "")
                        }
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
              <span className="font-black text-sm" style={{ color: accent }}>
                ₦
                {(canEditOrder
                  ? editTotal
                  : Number(order.total || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        {canEditOrder && (
          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full disabled:opacity-50 text-white font-bold py-4 rounded-full transition-all cursor-pointer border-none flex items-center justify-center gap-2 mb-4"
            style={{ background: accent }}
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

        <Link
          to={`/${restaurantId}/menu`}
          className="w-full bg-transparent border border-white/10 hover:border-white/30 text-white/60 hover:text-white font-semibold py-3.5 rounded-full transition-all flex items-center justify-center gap-2 text-sm no-underline mb-4"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Menu
        </Link>

        <p className="text-white/20 text-xs text-center">
          {isPaidOnline
            ? "Paid online orders cannot be edited after payment."
            : isPending
            ? "Changes can only be made while your order is pending."
            : "This order can no longer be edited. To add more items, place another order from the menu."}
        </p>
      </div>
    </div>
  );
};

export default TrackOrder;
