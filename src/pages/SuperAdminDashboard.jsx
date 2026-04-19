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
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useAuth } from "../admin/AuthContext"; // Adjust path if needed
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

// ── Shared UI Components ─────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, accent = "#ffffff" }) => (
  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col justify-center">
    <p className="text-white/30 text-[10px] font-black tracking-widest uppercase mb-2">
      {label}
    </p>
    <p
      className="font-display text-4xl font-black text-white italic"
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

// ── Main Dashboard Component ─────────────────────────────────────────────────

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState("overview");

  // Data State
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [restaurantOrders, setRestaurantOrders] = useState({});

  // Action State
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // --- EXISTING LOGIC: Data Fetching ---
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

        // FIX: If the restaurant was deleted from the database, skip it entirely!
        if (!profileSnap.exists()) {
          continue;
        }

        const profile = profileSnap.data();

        const ordersSnap = await getDocs(
          collection(db, "restaurants", restaurantId, "orders"),
        );
        const orders = ordersSnap.docs.map((d) => d.data());
        const totalOrders = orders.length;
        const totalRevenue = orders
          .filter((o) => o.status === "completed")
          .reduce((sum, o) => sum + Number(o.total || 0), 0);

        list.push({
          restaurantId,
          name: profile.name || restaurantId,
          accentColor: profile.accentColor || "#fa5631",
          logoUrl: profile.logoUrl || "",
          ownerEmail: email || profile.contactEmail || "—",
          createdAt: profile.createdAt,
          suspended: profile.suspended || false,
          totalOrders,
          totalRevenue,
        });
      }

      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setRestaurants(list);
    } catch (err) {
      console.error("Failed to load restaurants:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // --- EXISTING LOGIC: Actions ---
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
      // 1. Delete menu
      const menuSnap = await getDocs(
        collection(db, "restaurants", restaurantId, "menuItems"),
      ); // Ensure this matches your actual menu collection name
      for (const d of menuSnap.docs) await deleteDoc(d.ref);

      // 2. Delete orders
      const ordersSnap = await getDocs(
        collection(db, "restaurants", restaurantId, "orders"),
      );
      for (const d of ordersSnap.docs) await deleteDoc(d.ref);

      // 3. Delete profile
      await deleteDoc(doc(db, "restaurants", restaurantId, "profile", "info"));

      // 4. FIX: Find and delete the owner's document from the 'users' collection
      const userQuery = query(
        collection(db, "users"),
        where("restaurantId", "==", restaurantId),
      );
      const userSnap = await getDocs(userQuery);
      for (const userDoc of userSnap.docs) {
        await deleteDoc(userDoc.ref);
      }

      // 5. Remove from UI
      setRestaurants((prev) =>
        prev.filter((r) => r.restaurantId !== restaurantId),
      );
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete restaurant completely. Try again.");
    }
    setActionLoading(null);
    setConfirm(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // --- EXISTING LOGIC: Derived Stats ---
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

  // --- Analytics Data Processing ---
  const topRevenueData = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        revenue: r.totalRevenue,
        orders: r.totalOrders,
      }));
  }, [restaurants]);

  const platformHealthData = useMemo(() => {
    const active = restaurants.filter((r) => !r.suspended).length;
    const suspended = restaurants.filter((r) => r.suspended).length;
    return [
      { name: "Active", value: active, color: "#4ade80" },
      { name: "Suspended", value: suspended, color: "#f87171" },
    ];
  }, [restaurants]);

  const avgRevenue =
    restaurants.length > 0 ? totalRevenue / restaurants.length : 0;

  // --- Render Helpers ---
  const formatTime = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      {/* ── Confirm Modal ── */}
      {confirm && (
        <ConfirmModal
          message={
            confirm.type === "delete"
              ? `Permanently delete "${confirm.name}"? This removes all their menu items and orders. This cannot be undone.`
              : confirm.suspended
                ? `Unsuspend "${confirm.name}"? They'll be able to access their dashboard again.`
                : `Suspend "${confirm.name}"? Their customers will see an account restricted message.`
          }
          onConfirm={() =>
            confirm.type === "delete"
              ? handleDelete(confirm.restaurantId)
              : handleSuspend(confirm.restaurantId, confirm.suspended)
          }
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Sidebar Navigation ── */}
      <aside className="w-64 border-r border-white/5 flex flex-col sticky top-0 h-screen hidden lg:flex bg-[#0a0a0a]">
        <div className="p-8">
          <div className="flex items-center gap-1.5">
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
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${
              activeTab === "overview"
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
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Restaurants
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${
              activeTab === "analytics"
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
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Analytics
          </button>
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
              title="Logout"
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

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-1.5">
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
          {/* Header Title */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[#fa5631] text-[10px] font-black tracking-widest uppercase mb-2">
                <span className="w-4 h-px bg-[#fa5631]" /> Global Platform
              </div>
              <h1 className="font-display text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter">
                {activeTab === "overview"
                  ? "Network Overview"
                  : "Platform Analytics"}
              </h1>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg border-none ${activeTab === "overview" ? "bg-[#fa5631] text-white" : "bg-transparent text-white/40"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg border-none ${activeTab === "analytics" ? "bg-[#fa5631] text-white" : "bg-transparent text-white/40"}`}
              >
                Analytics
              </button>
            </div>
          </div>

          {/* ── TAB: OVERVIEW (Restaurant Management) ── */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Stats */}
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

              {/* Search & Actions */}
              <div className="flex flex-col md:flex-row items-center gap-4 bg-[#0a0a0a] p-2 rounded-2xl border border-white/5">
                <div className="flex-1 flex items-center gap-3 px-4 w-full">
                  <svg
                    className="w-4 h-4 text-white/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
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

              {/* Restaurant List */}
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
                        {/* Identity */}
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
                            <div className="flex items-center gap-3">
                              <h3 className="text-white font-bold text-base">
                                {r.name}
                              </h3>
                              {r.suspended && (
                                <span className="text-[9px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                                  Suspended
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

                        {/* Quick Stats */}
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

                        {/* Actions */}
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
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer border-none"
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

                      {/* Orders Drawer */}
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
                                        #
                                        {order.orderNum || order.id.slice(0, 5)}
                                      </span>
                                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-white">
                                        {order.status}
                                      </span>
                                    </div>
                                    <p className="text-white text-xs font-bold">
                                      Table{" "}
                                      {order.tableNumber || order.table || "?"}
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

          {/* ── TAB: ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
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
                          itemStyle={{
                            color: "#fa5631",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                          formatter={(value) => [
                            `₦${value.toLocaleString()}`,
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

                {/* Health & Order Volume */}
                <div className="space-y-6 flex flex-col">
                  {/* Summary Blocks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl">
                      <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">
                        Avg Merchant Rev
                      </p>
                      <p className="text-white font-mono font-bold">
                        ₦{Math.round(avgRevenue).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl">
                      <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">
                        Network Conversion
                      </p>
                      <p className="text-[#4ade80] font-mono font-bold">
                        +12.4%
                      </p>
                    </div>
                  </div>

                  {/* Active vs Suspended Pie Chart */}
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
                          {platformHealthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111",
                            border: "none",
                            borderRadius: "8px",
                          }}
                          itemStyle={{ color: "#fff", fontSize: "12px" }}
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

                {/* Order Volume Bar Chart */}
                <div className="lg:col-span-3">
                  <ChartCard
                    title="Transaction Density"
                    subtitle="Total orders processed per merchant (Top 5)"
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
                          formatter={(value) => [value, "Total Orders"]}
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
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
