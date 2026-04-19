import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { useRestaurant } from "../context/RestaurantContext";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  ready: {
    label: "Ready",
    color: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  completed: {
    label: "Completed",
    color: "bg-green-500/15 text-green-400 border-green-500/30",
  },
};
const NEXT_STATUS = {
  pending: "in_progress",
  in_progress: "ready",
  ready: "completed",
};
const NEXT_LABEL = {
  pending: "Mark In Progress",
  in_progress: "Mark Ready",
  ready: "Mark Completed",
};

const SESSION_STATUS = {
  open: {
    label: "Open",
    color: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  awaiting_payment: {
    label: "Bill Requested",
    color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  paid: {
    label: "Paid",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  closed: {
    label: "Closed",
    color: "bg-white/5 text-white/30 border-white/10",
  },
};

const formatTime = (ts) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
};
const formatDate = (ts) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
const getDateKey = (ts) => {
  if (!ts) return "Unknown";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toISOString().split("T")[0];
};
const formatDateKey = (key) => {
  if (key === "Unknown") return "Unknown Date";
  const d = new Date(key);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
const groupByDate = (orders) => {
  const groups = {};
  orders.forEach((o) => {
    const key = getDateKey(o.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(o);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ order, accent, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 8000);
    return () => clearTimeout(t);
  }, []);
  const itemCount = (order.items || []).reduce((s, i) => s + i.qty, 0);
  return (
    <div
      className="flex items-start gap-3 w-full max-w-sm pointer-events-auto"
      style={{
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease",
      }}
    >
      <div
        className="bg-[#111111] border shadow-2xl w-full overflow-hidden"
        style={{
          borderColor: `${accent}60`,
          boxShadow: `0 8px 40px ${accent}20`,
        }}
      >
        <div className="h-1 w-full" style={{ background: accent }} />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: accent }}
                />
                <span
                  className="relative inline-flex rounded-full h-2.5 w-2.5"
                  style={{ background: accent }}
                />
              </span>
              <p className="text-white font-bold text-sm">New Order!</p>
            </div>
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onDismiss, 400);
              }}
              className="text-white/30 hover:text-white bg-transparent border-none cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 text-xs mb-1">
            <span className="font-semibold text-white">
              {order.customerName || "Guest"}
            </span>{" "}
            · Table {order.table}
          </p>
          <p className="text-white/40 text-xs mb-2">
            {itemCount} item{itemCount !== 1 ? "s" : ""} · ₦
            {Number(order.total || 0).toLocaleString()}
          </p>
          <div className="h-0.5 bg-white/10 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full origin-left"
              style={{
                background: accent,
                animation: "shrink 8s linear forwards",
              }}
            />
          </div>
        </div>
      </div>
      <style>{`@keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>
    </div>
  );
};

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({
  order,
  isNew,
  updateStatus,
  deleteOrder,
  accent,
  compact,
}) => {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  return (
    <div
      className={`bg-[#0f0f0f] border transition-all duration-500 ${isNew ? "shadow-lg" : "border-white/5"}`}
      style={
        isNew
          ? { borderColor: accent, boxShadow: `0 4px 24px ${accent}1a` }
          : {}
      }
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {isNew && (
            <span
              className="text-[10px] font-black px-2 py-0.5 border animate-pulse"
              style={{
                color: accent,
                background: `${accent}26`,
                borderColor: `${accent}4d`,
              }}
            >
              NEW
            </span>
          )}
          <div>
            <p className="text-white font-bold text-sm">
              {order.customerName || "Guest"}
            </p>
            <p className="text-white/30 text-xs">
              {formatTime(order.createdAt)} · {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 border ${cfg.color}`}
          >
            {cfg.label}
          </span>
          <button
            onClick={() => deleteOrder(order.id)}
            className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer bg-transparent border-none"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      {!compact && (
        <div className="px-4 py-3 space-y-1">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 text-white text-[10px] font-black flex items-center justify-center"
                  style={{ background: accent }}
                >
                  {item.qty}
                </span>
                <span className="text-white/60 text-xs">{item.name}</span>
              </div>
              <span className="text-white/30 text-xs">
                ₦{(parseFloat(item.price) * item.qty).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-white/5">
            <span className="text-white/30 text-xs">Total</span>
            <span className="font-bold text-xs" style={{ color: accent }}>
              ₦{Number(order.total || 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
      {order.status !== "completed" && (
        <div className="px-4 py-2 border-t border-white/5 flex justify-end">
          <button
            onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
            className="text-xs font-semibold px-3 py-1.5 text-white transition-all cursor-pointer border-none flex items-center gap-1.5"
            style={{ background: accent }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {NEXT_LABEL[order.status]}
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

// ── Table Session Card ────────────────────────────────────────────────────────
const SessionCard = ({ session, orders, accent, onClose, onMarkPaid }) => {
  const [expanded, setExpanded] = useState(true);
  const cfg = SESSION_STATUS[session.status] || SESSION_STATUS.open;
  const sessionOrders = orders.filter((o) => session.orderIds?.includes(o.id));

  return (
    <div
      className="bg-[#111111] border border-white/5 overflow-hidden"
      style={
        session.status === "awaiting_payment"
          ? { borderColor: `${accent}60` }
          : {}
      }
    >
      {/* Session header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
            style={{ background: `${accent}20`, color: accent }}
          >
            {session.table}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-sm">
                Table {session.table}
              </p>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 border ${cfg.color}`}
              >
                {cfg.label}
              </span>
              {session.status === "awaiting_payment" && (
                <span
                  className="text-[10px] font-black px-2 py-0.5 animate-pulse"
                  style={{ background: `${accent}26`, color: accent }}
                >
                  BILL REQUESTED
                </span>
              )}
            </div>
            <p className="text-white/30 text-xs">
              {sessionOrders.length} order
              {sessionOrders.length !== 1 ? "s" : ""} · Opened{" "}
              {formatTime(session.openedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white/30 text-[10px] uppercase tracking-wide">
              Total Bill
            </p>
            <p className="font-black text-base" style={{ color: accent }}>
              ₦{Number(session.totalBill || 0).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white border border-white/10 hover:border-white/30 transition-all cursor-pointer bg-transparent"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Orders */}
      {expanded && (
        <div className="p-4 space-y-3">
          {sessionOrders.length === 0 ? (
            <p className="text-white/20 text-xs text-center py-4">
              No orders linked yet.
            </p>
          ) : (
            sessionOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#0f0f0f] border border-white/5 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-xs font-semibold">
                    {order.customerName || "Guest"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 border ${(STATUS_CONFIG[order.status] || STATUS_CONFIG.pending).color}`}
                    >
                      {
                        (STATUS_CONFIG[order.status] || STATUS_CONFIG.pending)
                          .label
                      }
                    </span>
                    <span className="text-white/40 text-xs">
                      {formatTime(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-white/40 text-xs">
                        {item.qty}× {item.name}
                      </span>
                      <span className="text-white/30 text-xs">
                        ₦{(parseFloat(item.price) * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-white/5">
                  <span className="text-white/20 text-[10px]">Subtotal</span>
                  <span className="text-white/50 text-xs font-bold">
                    ₦{Number(order.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Actions */}
          {session.status !== "closed" && session.status !== "paid" && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onMarkPaid(session.id)}
                className="flex-1 text-white text-xs font-bold py-2.5 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                style={{ background: accent }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
                </svg>
                Mark as Paid & Close
              </button>
              <button
                onClick={() => onClose(session.id)}
                className="px-4 text-white/40 hover:text-white text-xs font-semibold border border-white/10 hover:border-white/30 transition-all cursor-pointer bg-transparent"
              >
                Close Table
              </button>
            </div>
          )}
          {(session.status === "paid" || session.status === "closed") && (
            <div className="text-center py-2 text-white/20 text-xs">
              {session.status === "paid" ? "✓ Paid & Closed" : "Table Closed"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main OrdersTab ────────────────────────────────────────────────────────────
const OrdersTab = () => {
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";

  const [orders, setOrders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("tables"); // "tables" | "orders"
  const [filter, setFilter] = useState("pending");
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [toasts, setToasts] = useState([]);
  const prevOrderIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [880, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
        gain.gain.linearRampToValueAtTime(
          0.35,
          ctx.currentTime + i * 0.15 + 0.05,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.15 + 0.5,
        );
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.5);
      });
    } catch (_) {}
  };

  // Listen to orders
  useEffect(() => {
    const q = query(
      collection(db, "restaurants", restaurantId, "orders"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      const incoming = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (!isFirstLoad.current) {
        const newItems = incoming.filter(
          (o) => !prevOrderIds.current.has(o.id),
        );
        if (newItems.length > 0) {
          playSound();
          setToasts((prev) => [
            ...prev,
            ...newItems.map((o) => ({ ...o, _toastId: o.id })),
          ]);
          setNewOrderIds(new Set(newItems.map((o) => o.id)));
          setTimeout(() => setNewOrderIds(new Set()), 4000);
        }
      }
      prevOrderIds.current = new Set(incoming.map((o) => o.id));
      setOrders(incoming);
      setLoading(false);
      isFirstLoad.current = false;
    });
  }, [restaurantId]);

  // Listen to table sessions
  useEffect(() => {
    const q = query(
      collection(db, "restaurants", restaurantId, "tableSessions"),
      orderBy("openedAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [restaurantId]);

  const updateStatus = async (id, nextStatus) => {
    await updateDoc(doc(db, "restaurants", restaurantId, "orders", id), {
      status: nextStatus,
    });
  };
  const deleteOrder = async (id) => {
    if (window.confirm("Delete this order permanently?"))
      await deleteDoc(doc(db, "restaurants", restaurantId, "orders", id));
  };
  const closeSession = async (sessionId) => {
    await updateDoc(
      doc(db, "restaurants", restaurantId, "tableSessions", sessionId),
      {
        status: "closed",
        closedAt: new Date(),
      },
    );
  };
  const markSessionPaid = async (sessionId) => {
    await updateDoc(
      doc(db, "restaurants", restaurantId, "tableSessions", sessionId),
      {
        status: "paid",
        paidAt: new Date(),
      },
    );
  };

  const activeSessions = sessions.filter(
    (s) => s.status === "open" || s.status === "awaiting_payment",
  );
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    in_progress: orders.filter((o) => o.status === "in_progress").length,
    ready: orders.filter((o) => o.status === "ready").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div
          className="w-8 h-8 border-2 border-white/10 rounded-full animate-spin"
          style={{ borderTopColor: accent }}
        />
      </div>
    );

  return (
    <>
      {/* Toast stack */}
      <div
        className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none"
        style={{ maxWidth: "360px", width: "calc(100vw - 3rem)" }}
      >
        {toasts.map((t) => (
          <Toast
            key={t._toastId}
            order={t}
            accent={accent}
            onDismiss={() =>
              setToasts((prev) => prev.filter((x) => x._toastId !== t._toastId))
            }
          />
        ))}
      </div>

      <div>
        {/* View toggle */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: "tables", label: `Tables`, badge: activeSessions.length },
            { key: "orders", label: "All Orders", badge: null },
          ].map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold border transition-all cursor-pointer"
              style={
                view === key
                  ? { background: accent, borderColor: accent, color: "white" }
                  : {
                      background: "transparent",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.4)",
                    }
              }
            >
              {label}
              {badge !== null && badge > 0 && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                  style={
                    view === key
                      ? { background: "rgba(255,255,255,0.2)", color: "white" }
                      : {
                          background: "rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.5)",
                        }
                  }
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tables View ── */}
        {view === "tables" && (
          <div>
            {activeSessions.length === 0 ? (
              <div className="text-center py-24 text-white/20 text-sm">
                No active tables right now. Orders will appear here when
                customers scan their QR codes.
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    orders={orders}
                    accent={accent}
                    onClose={closeSession}
                    onMarkPaid={markSessionPaid}
                  />
                ))}
              </div>
            )}

            {/* Closed sessions today */}
            {sessions.filter(
              (s) => s.status === "paid" || s.status === "closed",
            ).length > 0 && (
              <div className="mt-10">
                <p className="text-white/20 text-xs font-semibold tracking-widest uppercase mb-4">
                  Closed Today
                </p>
                <div className="space-y-3">
                  {sessions
                    .filter((s) => s.status === "paid" || s.status === "closed")
                    .map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        orders={orders}
                        accent={accent}
                        onClose={closeSession}
                        onMarkPaid={markSessionPaid}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Orders View ── */}
        {view === "orders" && (
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {[
                { key: "pending", label: "Pending" },
                { key: "in_progress", label: "In Progress" },
                { key: "ready", label: "Ready" },
                { key: "completed", label: "Completed" },
                { key: "all", label: "All" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="px-3 py-1.5 text-xs font-semibold tracking-wide border transition-all cursor-pointer flex items-center gap-1.5"
                  style={
                    filter === key
                      ? {
                          background: accent,
                          borderColor: accent,
                          color: "white",
                        }
                      : {
                          background: "transparent",
                          borderColor: "rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.4)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (filter !== key) {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== key) {
                      e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.1)";
                    }
                  }}
                >
                  {label}
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={
                      filter === key
                        ? {
                            background: "rgba(255,255,255,0.2)",
                            color: "white",
                          }
                        : {
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.4)",
                          }
                    }
                  >
                    {counts[key]}
                  </span>
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 text-white/20 text-sm">
                No {filter === "all" ? "" : filter.replace("_", " ")} orders yet
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isNew={newOrderIds.has(order.id)}
                    updateStatus={updateStatus}
                    deleteOrder={deleteOrder}
                    accent={accent}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersTab;
