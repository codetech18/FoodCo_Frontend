import React, { useEffect, useState } from "react";
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
  orders.forEach((order) => {
    const key = getDateKey(order.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(order);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
};

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, isNew, updateStatus, deleteOrder, accent }) => {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  return (
    <div
      className={`bg-[#111111] border transition-all duration-500 ${
        isNew ? "shadow-lg" : "border-white/5 hover:border-white/10"
      }`}
      style={
        isNew
          ? { borderColor: accent, boxShadow: `0 4px 24px ${accent}1a` }
          : {}
      }
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
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
              Table {order.table} · {formatTime(order.createdAt)} ·{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-3 py-1 border ${cfg.color}`}
          >
            {cfg.label}
          </span>
          <button
            onClick={() => deleteOrder(order.id)}
            className="w-7 h-7 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer bg-transparent border-none"
            title="Delete order"
          >
            <svg
              className="w-3.5 h-3.5"
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

      {/* Card body */}
      <div className="px-5 py-4 grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-2">
            Items Ordered
          </p>
          <div className="space-y-1.5">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0"
                    style={{ background: accent }}
                  >
                    {item.qty}
                  </span>
                  <span className="text-white/70 text-sm">{item.name}</span>
                </div>
                <span className="text-white/40 text-xs">
                  ₦{(parseFloat(item.price) * item.qty).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between">
            <span className="text-white/30 text-xs font-semibold uppercase tracking-wide">
              Total
            </span>
            <span className="font-bold text-sm" style={{ color: accent }}>
              ₦{Number(order.total || 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-1">
              Email
            </p>
            <p className="text-white/60 text-xs break-all">
              {order.email || "—"}
            </p>
          </div>
          <div>
            <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-1">
              Allergies / Notes
            </p>
            <p className="text-white/60 text-xs">{order.allergies || "None"}</p>
          </div>
        </div>
      </div>

      {/* Pipeline button */}
      {order.status !== "completed" && (
        <div className="px-5 py-3 border-t border-white/5 flex justify-end">
          <button
            onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
            className="text-xs font-semibold px-4 py-2 text-white transition-all cursor-pointer border-none flex items-center gap-2"
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

// ── Orders Tab ────────────────────────────────────────────────────────────────
const OrdersTab = () => {
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const prevOrderIds = React.useRef(new Set());

  useEffect(() => {
    const q = query(
      collection(db, "restaurants", restaurantId, "orders"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      const incoming = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (!loading) {
        const newIds = new Set();
        incoming.forEach((o) => {
          if (!prevOrderIds.current.has(o.id)) newIds.add(o.id);
        });
        if (newIds.size > 0) {
          setNewOrderIds(newIds);
          try {
            const ctx = new (
              window.AudioContext || window.webkitAudioContext
            )();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + 0.4,
            );
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch (_) {}
          setTimeout(() => setNewOrderIds(new Set()), 3000);
        }
      }

      prevOrderIds.current = new Set(incoming.map((o) => o.id));
      setOrders(incoming);
      setLoading(false);
    });
    return unsub;
  }, [restaurantId]);

  const updateStatus = async (id, nextStatus) => {
    await updateDoc(doc(db, "restaurants", restaurantId, "orders", id), {
      status: nextStatus,
    });
  };

  const deleteOrder = async (id) => {
    if (window.confirm("Delete this order permanently?")) {
      await deleteDoc(doc(db, "restaurants", restaurantId, "orders", id));
    }
  };

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

  const groupedOrders = groupByDate(filtered);

  return (
    <div>
      {/* Filter tabs */}
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
                ? { background: accent, borderColor: accent, color: "white" }
                : {
                    background: "transparent",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                  }
            }
            onMouseEnter={(e) => {
              if (filter !== key) {
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== key) {
                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }
            }}
          >
            {label}
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
              style={
                filter === key
                  ? { background: "rgba(255,255,255,0.2)", color: "white" }
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
      ) : filter === "all" ? (
        // Grouped by date
        <div className="space-y-10">
          {groupedOrders.map(([dateKey, dayOrders]) => {
            const dayTotal = dayOrders
              .filter((o) => o.status === "completed")
              .reduce((sum, o) => sum + Number(o.total || 0), 0);
            return (
              <div key={dateKey}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/8">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: accent }}
                    />
                    <h3 className="text-white font-bold text-base">
                      {formatDateKey(dateKey)}
                    </h3>
                    <span className="text-white/30 text-xs border border-white/10 px-2 py-0.5">
                      {dayOrders.length} order
                      {dayOrders.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs font-semibold uppercase tracking-wide">
                      Revenue
                    </span>
                    <span
                      className="font-black text-sm"
                      style={{ color: accent }}
                    >
                      ₦{dayTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {dayOrders.map((order) => (
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
              </div>
            );
          })}
        </div>
      ) : (
        // Normal list
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
  );
};

export default OrdersTab;
