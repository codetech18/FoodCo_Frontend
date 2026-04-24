import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useAuth } from "../admin/AuthContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── Shared UI ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent = "#ffffff" }) => (
  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col justify-center">
    <p className="text-white/30 text-[10px] font-black tracking-widest uppercase mb-2">
      {label}
    </p>
    <p
      className="font-display text-4xl font-black italic"
      style={{ color: accent }}
    >
      {value}
    </p>
    {sub && (
      <p className="text-white/30 text-[10px] font-bold uppercase mt-2">
        {sub}
      </p>
    )}
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col">
    <div className="mb-6">
      <h3 className="text-white font-bold text-lg">{title}</h3>
      {subtitle && <p className="text-white/30 text-xs mt-1">{subtitle}</p>}
    </div>
    <div className="flex-1 min-h-[300px]">{children}</div>
  </div>
);

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div
      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative z-10 bg-[#111111] border border-white/10 w-full max-w-sm p-8 rounded-3xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
      <h3 className="text-white font-display text-2xl font-black uppercase italic mb-3">
        Confirm Action
      </h3>
      <p className="text-white/40 text-sm mb-8 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-transparent border border-white/10 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl transition-all cursor-pointer border-none"
        >
          Execute
        </button>
      </div>
    </div>
  </div>
);

// ── Invite Codes Panel ────────────────────────────────────────────────────────
const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () =>
    Array.from(
      { length: 5 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `SRV-${seg()}-${seg()}`;
};

const InviteCodesPanel = ({ accent = "#fa5631" }) => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [expiry, setExpiry] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "inviteCodes"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      setCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await addDoc(collection(db, "inviteCodes"), {
        code: generateCode(),
        note: note.trim(),
        status: "unused",
        expiresAt: expiry ? new Date(expiry) : null,
        createdAt: serverTimestamp(),
        usedBy: null,
        usedAt: null,
      });
      setNote("");
      setExpiry("");
    } catch (err) {
      alert("Failed to create code.");
    }
    setCreating(false);
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Revoke this code?")) return;
    await updateDoc(doc(db, "inviteCodes", id), { status: "revoked" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    await deleteDoc(doc(db, "inviteCodes", id));
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
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

  const unused = codes.filter((c) => c.status === "unused").length;
  const used = codes.filter((c) => c.status === "used").length;
  const revoked = codes.filter((c) => c.status === "revoked").length;

  const inputCls =
    "w-full bg-[#111] border border-white/10 text-white placeholder-white/20 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 transition-colors";

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Unused", count: unused, color: "#4ade80" },
          { label: "Used", count: used, color: accent },
          { label: "Revoked", count: revoked, color: "#f87171" },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl text-center"
          >
            <p
              className="font-black text-3xl italic font-display"
              style={{ color }}
            >
              {count}
            </p>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Generate */}
      <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Generate New Invite Code
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
                Note (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Club 701 - Abuja"
                className={inputCls}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
                Expiry Date (optional)
              </label>
              <input
                type="date"
                className={inputCls}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all cursor-pointer border-none disabled:opacity-50"
            style={{ background: accent }}
          >
            {creating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            )}
            Generate Code
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <h3 className="text-white font-bold text-sm mb-4">All Codes</h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <div
              className="w-6 h-6 border-2 border-white/10 rounded-full animate-spin"
              style={{ borderTopColor: accent }}
            />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16 text-white/20 text-sm border border-dashed border-white/5 rounded-2xl">
            No invite codes yet.
          </div>
        ) : (
          <div className="space-y-2">
            {codes.map((c) => {
              const isExpired =
                c.expiresAt &&
                new Date() >
                  (c.expiresAt.toDate
                    ? c.expiresAt.toDate()
                    : new Date(c.expiresAt));
              const status =
                isExpired && c.status === "unused" ? "expired" : c.status;
              const STATUS_STYLE = {
                unused: "bg-green-500/10 text-green-400 border-green-500/20",
                used: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                revoked: "bg-red-500/10 text-red-400 border-red-500/20",
                expired: "bg-white/5 text-white/30 border-white/10",
              };
              return (
                <div
                  key={c.id}
                  className="bg-[#0a0a0a] border border-white/5 rounded-xl px-5 py-3 flex items-center gap-4 flex-wrap"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-mono text-white font-bold text-sm tracking-wider">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleCopy(c.code)}
                      className="text-[10px] font-black px-2 py-0.5 border rounded transition-all cursor-pointer"
                      style={
                        copied === c.code
                          ? {
                              background: "rgba(74,222,128,0.15)",
                              borderColor: "rgba(74,222,128,0.3)",
                              color: "#4ade80",
                            }
                          : {
                              background: "transparent",
                              borderColor: "rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.3)",
                            }
                      }
                    >
                      {copied === c.code ? "✓" : "Copy"}
                    </button>
                  </div>
                  <span className="text-white/30 text-xs flex-1 truncate">
                    {c.note || "—"}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 border rounded capitalize ${STATUS_STYLE[status]}`}
                  >
                    {status}
                  </span>
                  <div className="text-white/20 text-xs flex-shrink-0">
                    {c.status === "used" ? (
                      <span>
                        Used by{" "}
                        <span className="text-white/40">{c.usedBy || "—"}</span>{" "}
                        · {formatDate(c.usedAt)}
                      </span>
                    ) : c.expiresAt ? (
                      <span>Expires {formatDate(c.expiresAt)}</span>
                    ) : (
                      <span>Created {formatDate(c.createdAt)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.status === "unused" && !isExpired && (
                      <button
                        onClick={() => handleRevoke(c.id)}
                        className="text-[10px] font-black px-2.5 py-1 border border-yellow-500/20 text-yellow-400/60 hover:text-yellow-400 rounded transition-all cursor-pointer bg-transparent"
                      >
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="w-7 h-7 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer bg-transparent border-none"
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [restaurantOrders, setRestaurantOrders] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const list = [];
      for (const userDoc of usersSnap.docs) {
        const { restaurantId, email } = userDoc.data();
        if (!restaurantId) continue;
        const profileSnap = await getDoc(
          doc(db, "restaurants", restaurantId, "profile", "info"),
        );
        if (!profileSnap.exists()) continue;
        const profile = profileSnap.data();
        const ordersSnap = await getDocs(
          collection(db, "restaurants", restaurantId, "orders"),
        );
        const orders = ordersSnap.docs.map((d) => d.data());
        const now = new Date();
        const trialEndsAt = profile.trialEndsAt?.toDate?.() || null;
        const paidUntil = profile.subscriptionPaidUntil?.toDate?.() || null;
        const inTrial = trialEndsAt && now < trialEndsAt;
        const isPaid = paidUntil && now < paidUntil;
        const subExpired =
          profile.paymentMode === "at_table" && !inTrial && !isPaid;

        list.push({
          restaurantId,
          name: profile.name || restaurantId,
          accentColor: profile.accentColor || "#fa5631",
          logoUrl: profile.logoUrl || "",
          ownerEmail: email || profile.contactEmail || "—",
          createdAt: profile.createdAt,
          suspended: profile.suspended || false,
          paymentMode: profile.paymentMode || "at_table",
          subscriptionStatus: profile.subscriptionStatus || "trial",
          trialEndsAt,
          subscriptionPaidUntil: paidUntil,
          subExpired,
          totalOrders: orders.length,
          totalRevenue: orders
            .filter((o) => o.status === "completed")
            .reduce((s, o) => s + Number(o.total || 0), 0),
        });
      }
      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setRestaurants(list);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const loadOrders = async (restaurantId) => {
    if (restaurantOrders[restaurantId]) return;
    const snap = await getDocs(
      query(
        collection(db, "restaurants", restaurantId, "orders"),
        orderBy("createdAt", "desc"),
      ),
    );
    setRestaurantOrders((prev) => ({
      ...prev,
      [restaurantId]: snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .slice(0, 10),
    }));
  };

  const handleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    loadOrders(id);
  };

  const handleSuspend = async (restaurantId, currentlySuspended) => {
    setActionLoading(restaurantId);
    await updateDoc(doc(db, "restaurants", restaurantId, "profile", "info"), {
      suspended: !currentlySuspended,
    });
    setRestaurants((prev) =>
      prev.map((r) =>
        r.restaurantId === restaurantId
          ? { ...r, suspended: !currentlySuspended }
          : r,
      ),
    );
    setActionLoading(null);
    setConfirm(null);
  };

  const handleDelete = async (restaurantId) => {
    setActionLoading(restaurantId);
    try {
      const menuSnap = await getDocs(
        collection(db, "restaurants", restaurantId, "menu"),
      );
      for (const d of menuSnap.docs) await deleteDoc(d.ref);
      const ordersSnap = await getDocs(
        collection(db, "restaurants", restaurantId, "orders"),
      );
      for (const d of ordersSnap.docs) await deleteDoc(d.ref);
      await deleteDoc(doc(db, "restaurants", restaurantId, "profile", "info"));
      const userQuery = query(
        collection(db, "users"),
        where("restaurantId", "==", restaurantId),
      );
      const userSnap = await getDocs(userQuery);
      for (const d of userSnap.docs) await deleteDoc(d.ref);
      setRestaurants((prev) =>
        prev.filter((r) => r.restaurantId !== restaurantId),
      );
    } catch (err) {
      alert("Failed to delete. Try again.");
    }
    setActionLoading(null);
    setConfirm(null);
  };

  const handleMarkPaid = async (restaurantId) => {
    const paidUntil = new Date();
    paidUntil.setDate(paidUntil.getDate() + 30);
    // Also reactivate if account was auto-suspended for non-payment
    const r = restaurants.find((x) => x.restaurantId === restaurantId);
    const updates = {
      subscriptionStatus: "active",
      subscriptionPaidUntil: paidUntil,
      subExpired: false,
    };
    if (r?.suspendedReason === "subscription_expired") {
      updates.suspended = false;
      updates.suspendedReason = null;
    }
    await updateDoc(
      doc(db, "restaurants", restaurantId, "profile", "info"),
      updates,
    );
    setRestaurants((prev) =>
      prev.map((x) =>
        x.restaurantId === restaurantId
          ? {
              ...x,
              subscriptionStatus: "active",
              subscriptionPaidUntil: paidUntil,
              subExpired: false,
              suspended:
                x.suspendedReason === "subscription_expired"
                  ? false
                  : x.suspended,
            }
          : x,
      ),
    );
    alert(`✓ ${restaurantId} marked as paid. Active for 30 days.`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.restaurantId.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerEmail.toLowerCase().includes(search.toLowerCase()),
  );

  const totalOrders = restaurants.reduce((s, r) => s + r.totalOrders, 0);
  const totalRevenue = restaurants.reduce((s, r) => s + r.totalRevenue, 0);
  const thisWeek = restaurants.filter((r) => {
    if (!r.createdAt) return false;
    const d = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const topRevenueData = useMemo(
    () =>
      [...restaurants]
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
        .map((r) => ({
          name: r.name,
          revenue: r.totalRevenue,
          orders: r.totalOrders,
        })),
    [restaurants],
  );

  const platformHealthData = useMemo(
    () => [
      {
        name: "Active",
        value: restaurants.filter((r) => !r.suspended).length,
        color: "#4ade80",
      },
      {
        name: "Suspended",
        value: restaurants.filter((r) => r.suspended).length,
        color: "#f87171",
      },
    ],
    [restaurants],
  );

  const formatTime = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const NAV_ITEMS = [
    {
      key: "overview",
      label: "Restaurants",
      icon: (
        <>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </>
      ),
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: (
        <>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </>
      ),
    },
    {
      key: "invites",
      label: "Invite Codes",
      icon: (
        <>
          <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 1 0 0-4V7a2 2 0 0 1 2-2z" />
        </>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      {confirm && (
        <ConfirmModal
          message={
            confirm.type === "delete"
              ? `Permanently delete "${confirm.name}"? This cannot be undone.`
              : confirm.suspended
                ? `Unsuspend "${confirm.name}"?`
                : `Suspend "${confirm.name}"?`
          }
          onConfirm={() =>
            confirm.type === "delete"
              ? handleDelete(confirm.restaurantId)
              : handleSuspend(confirm.restaurantId, confirm.suspended)
          }
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex-col sticky top-0 h-screen hidden lg:flex bg-[#0a0a0a]">
        <div className="p-8">
          <div className="flex items-center gap-1">
            <span className="font-display text-2xl font-black text-white">
              SERVRR
            </span>
            <span className="font-display text-2xl font-black text-[#fa5631] italic">
              HQ
            </span>
          </div>
          <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-1">
            Super Admin Console
          </p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${
                activeTab === key
                  ? "bg-[#fa5631] text-white shadow-lg shadow-[#fa5631]/20"
                  : "bg-transparent text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {icon}
              </svg>
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
            <div className="overflow-hidden">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">
                Logged In As
              </p>
              <p className="text-white text-xs font-bold truncate mt-1">
                {admin?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-transparent border-none text-white/40 hover:text-red-400 cursor-pointer transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-1">
            <span className="font-display text-xl font-black text-white">
              SERVRR
            </span>
            <span className="font-display text-xl font-black text-[#fa5631] italic">
              HQ
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/40 hover:text-white bg-transparent border-none text-xs font-bold uppercase cursor-pointer"
          >
            Logout
          </button>
        </header>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto w-full">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[#fa5631] text-[10px] font-black tracking-widest uppercase mb-2">
                <span className="w-4 h-px bg-[#fa5631]" /> Global Platform
              </div>
              <h1 className="font-display text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter">
                {activeTab === "overview"
                  ? "Network Overview"
                  : activeTab === "analytics"
                    ? "Platform Analytics"
                    : "Invite Codes"}
              </h1>
            </div>
            {/* Mobile tabs */}
            <div className="flex lg:hidden bg-white/5 p-1 rounded-xl overflow-x-auto gap-1">
              {NAV_ITEMS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-shrink-0 px-4 py-3 text-[10px] font-black uppercase rounded-lg border-none ${activeTab === key ? "bg-[#fa5631] text-white" : "bg-transparent text-white/40"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Merchants"
                  value={restaurants.length}
                  sub={`${thisWeek} joined this week`}
                  accent="#ffffff"
                />
                <StatCard
                  label="Total Orders"
                  value={totalOrders.toLocaleString()}
                />
                <StatCard
                  label="Gross Volume"
                  value={`₦${totalRevenue.toLocaleString()}`}
                  accent="#fa5631"
                />
                <StatCard
                  label="Suspended"
                  value={restaurants.filter((r) => r.suspended).length}
                  accent="#f87171"
                />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 bg-[#0a0a0a] p-2 rounded-2xl border border-white/5">
                <div className="flex-1 flex items-center gap-3 px-4 w-full">
                  <svg
                    className="w-4 h-4 text-white/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, slug or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent border-none text-white placeholder-white/20 text-sm focus:outline-none py-3"
                  />
                </div>
                <button
                  onClick={fetchRestaurants}
                  className="w-full md:w-auto flex items-center justify-center gap-2 text-white bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all cursor-pointer border-none"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  Sync Data
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-[#fa5631] rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-white/5 rounded-3xl">
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                    No restaurants found.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filtered.map((r) => (
                    <div
                      key={r.restaurantId}
                      className={`bg-[#0a0a0a] border rounded-2xl transition-all overflow-hidden ${r.suspended ? "border-red-500/20 opacity-70" : "border-white/5 hover:border-white/10"}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                        <div className="flex items-center gap-4 flex-1">
                          {r.logoUrl ? (
                            <img
                              src={r.logoUrl}
                              alt={r.name}
                              className="w-12 h-12 object-contain rounded-xl border border-white/5"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-lg border border-white/5"
                              style={{
                                background: `${r.accentColor}15`,
                                color: r.accentColor,
                              }}
                            >
                              {r.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-white font-bold text-base">
                                {r.name}
                              </h3>
                              {r.suspended && (
                                <span className="text-[9px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                                  Suspended
                                </span>
                              )}
                              {r.paymentMode === "at_table" &&
                                (r.subExpired ? (
                                  <span className="text-[9px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                                    ⚠ Sub Expired
                                  </span>
                                ) : r.subscriptionStatus === "trial" ? (
                                  <span className="text-[9px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                                    Trial
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                                    ✓ Paid
                                  </span>
                                ))}
                              {r.paymentMode === "online" && (
                                <span className="text-[9px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                                  💳 Online
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-white/40 text-[10px] font-mono">
                                /{r.restaurantId}
                              </span>
                              <span className="text-white/20 text-[10px]">
                                •
                              </span>
                              <span className="text-white/30 text-[10px]">
                                {r.ownerEmail}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 md:justify-center flex-1 py-4 md:py-0 border-y md:border-y-0 border-white/5">
                          <div>
                            <p className="text-white font-mono font-bold text-sm">
                              {r.totalOrders}
                            </p>
                            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5">
                              Orders
                            </p>
                          </div>
                          <div>
                            <p
                              className="font-mono font-bold text-sm"
                              style={{ color: r.accentColor }}
                            >
                              ₦{r.totalRevenue.toLocaleString()}
                            </p>
                            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5">
                              Revenue
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleExpand(r.restaurantId)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer border-none"
                          >
                            <svg
                              className={`w-4 h-4 transition-transform ${expandedId === r.restaurantId ? "rotate-180" : ""}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                          <a
                            href={`/${r.restaurantId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors no-underline"
                          >
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                          {r.paymentMode === "at_table" &&
                            (r.subExpired ||
                              r.subscriptionStatus === "trial") && (
                              <button
                                onClick={() => handleMarkPaid(r.restaurantId)}
                                className="p-3 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-green-400 transition-colors cursor-pointer border-none"
                                title="Mark subscription as paid (extends 30 days)"
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    d="M20 6L9 17l-5-5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </button>
                            )}
                          <button
                            onClick={() =>
                              setConfirm({
                                type: "suspend",
                                restaurantId: r.restaurantId,
                                name: r.name,
                                suspended: r.suspended,
                              })
                            }
                            disabled={actionLoading === r.restaurantId}
                            className="p-3 bg-white/5 hover:bg-yellow-500/10 rounded-xl text-white/50 hover:text-yellow-400 transition-colors cursor-pointer border-none"
                          >
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              {r.suspended ? (
                                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
                              ) : (
                                <>
                                  <circle cx="12" cy="12" r="10" />
                                  <line
                                    x1="4.93"
                                    y1="4.93"
                                    x2="19.07"
                                    y2="19.07"
                                  />
                                </>
                              )}
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              setConfirm({
                                type: "delete",
                                restaurantId: r.restaurantId,
                                name: r.name,
                              })
                            }
                            disabled={actionLoading === r.restaurantId}
                            className="p-3 bg-white/5 hover:bg-red-500/10 rounded-xl text-white/50 hover:text-red-400 transition-colors cursor-pointer border-none"
                          >
                            <svg
                              className="w-4 h-4"
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
                      {expandedId === r.restaurantId && (
                        <div className="bg-[#111] p-6 border-t border-white/5">
                          <p className="text-white/30 text-[10px] font-black tracking-widest uppercase mb-4">
                            Latest Transactions
                          </p>
                          {!restaurantOrders[r.restaurantId] ? (
                            <p className="text-white/20 text-xs">
                              Loading orders...
                            </p>
                          ) : restaurantOrders[r.restaurantId].length === 0 ? (
                            <p className="text-white/20 text-xs">
                              No transaction history.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {restaurantOrders[r.restaurantId].map((order) => (
                                <div
                                  key={order.id}
                                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"
                                >
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-white/40 text-[10px] font-mono">
                                        #{order.id.slice(0, 5)}
                                      </span>
                                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-white">
                                        {order.status}
                                      </span>
                                    </div>
                                    <p className="text-white text-xs font-bold">
                                      Table {order.table || "?"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-mono text-sm font-bold text-white">
                                      ₦
                                      {Number(
                                        order.total || 0,
                                      ).toLocaleString()}
                                    </p>
                                    <p className="text-white/30 text-[9px] uppercase font-bold mt-1">
                                      {formatTime(order.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Analytics Tab ── */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ChartCard
                    title="Top Grossing Locations"
                    subtitle="Revenue comparison of top 5 merchants"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={topRevenueData}
                        margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorRev"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#fa5631"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#fa5631"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="name"
                          stroke="#ffffff30"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111",
                            border: "1px solid #ffffff10",
                            borderRadius: "12px",
                          }}
                          formatter={(v) => [
                            `₦${v.toLocaleString()}`,
                            "Revenue",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#fa5631"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRev)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
                <div className="space-y-6 flex flex-col">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl">
                      <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">
                        Avg Merchant Rev
                      </p>
                      <p className="text-white font-mono font-bold">
                        ₦
                        {Math.round(
                          restaurants.length
                            ? totalRevenue / restaurants.length
                            : 0,
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl">
                      <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">
                        Active Merchants
                      </p>
                      <p className="text-[#4ade80] font-mono font-bold">
                        {restaurants.filter((r) => !r.suspended).length}
                      </p>
                    </div>
                  </div>
                  <ChartCard
                    title="Platform Status"
                    subtitle="Active vs Restricted accounts"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformHealthData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {platformHealthData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111",
                            border: "none",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4 border-t border-white/5 pt-4">
                      {platformHealthData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: d.color }}
                          />
                          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                            {d.name} ({d.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>
                <div className="lg:col-span-3">
                  <ChartCard
                    title="Transaction Density"
                    subtitle="Total orders per merchant (Top 5)"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topRevenueData}
                        margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="name"
                          stroke="#ffffff30"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#ffffff30"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#ffffff05" }}
                          contentStyle={{
                            backgroundColor: "#111",
                            border: "1px solid #ffffff10",
                            borderRadius: "12px",
                          }}
                          formatter={(v) => [v, "Total Orders"]}
                        />
                        <Bar
                          dataKey="orders"
                          fill="#ffffff"
                          radius={[6, 6, 0, 0]}
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              </div>
            </div>
          )}

          {/* ── Invite Codes Tab ── */}
          {activeTab === "invites" && <InviteCodesPanel accent="#fa5631" />}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
