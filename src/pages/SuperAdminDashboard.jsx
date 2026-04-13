import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection, getDocs, doc, updateDoc,
  deleteDoc, getDoc, query, orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useAuth } from "../admin/AuthContext";

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub }) => (
  <div className="bg-[#111111] border border-white/5 p-6">
    <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-2">{label}</p>
    <p className="font-display text-3xl font-black text-white">{value}</p>
    {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
  </div>
);

// ── Confirm Modal ─────────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative z-10 bg-[#111111] border border-white/10 w-full max-w-sm p-7">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
      <h3 className="text-white font-bold text-base mb-3">Are you sure?</h3>
      <p className="text-white/40 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 bg-transparent border border-white/10 text-white/50 hover:text-white text-sm font-semibold py-2.5 transition-all cursor-pointer">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2.5 transition-all cursor-pointer border-none">
          Confirm
        </button>
      </div>
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const navigate   = useNavigate();
  const { admin }  = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [confirm, setConfirm]         = useState(null); // { type, restaurantId, name }
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId]   = useState(null);
  const [restaurantOrders, setRestaurantOrders] = useState({});

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      // Get all users
      const usersSnap  = await getDocs(collection(db, "users"));
      const usersMap   = {};
      usersSnap.forEach(d => { usersMap[d.data().restaurantId] = d.data(); });

      // Get all restaurants
      const restSnap   = await getDocs(collection(db, "restaurants"));
      const list       = [];

      for (const restDoc of restSnap.docs) {
        const restaurantId = restDoc.id;
        // Get profile
        const profileRef = doc(db, "restaurants", restaurantId, "profile", "info");
        const profileSnap = await getDoc(profileRef);
        const profile    = profileSnap.exists() ? profileSnap.data() : {};

        // Get order count + revenue
        const ordersSnap = await getDocs(collection(db, "restaurants", restaurantId, "orders"));
        const orders     = ordersSnap.docs.map(d => d.data());
        const totalOrders   = orders.length;
        const totalRevenue  = orders
          .filter(o => o.status === "completed")
          .reduce((sum, o) => sum + Number(o.total || 0), 0);

        list.push({
          restaurantId,
          name:        profile.name        || restaurantId,
          accentColor: profile.accentColor  || "#fa5631",
          logoUrl:     profile.logoUrl      || "",
          ownerEmail:  usersMap[restaurantId]?.email || profile.contactEmail || "—",
          createdAt:   profile.createdAt,
          suspended:   profile.suspended    || false,
          totalOrders,
          totalRevenue,
        });
      }

      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRestaurants(list);
    } catch (err) {
      console.error("Failed to load restaurants:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const loadOrders = async (restaurantId) => {
    if (restaurantOrders[restaurantId]) return;
    const snap   = await getDocs(
      query(collection(db, "restaurants", restaurantId, "orders"), orderBy("createdAt", "desc"))
    );
    setRestaurantOrders(prev => ({
      ...prev,
      [restaurantId]: snap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 10),
    }));
  };

  const handleExpand = (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    loadOrders(id);
  };

  const handleSuspend = async (restaurantId, currentlySuspended) => {
    setActionLoading(restaurantId);
    await updateDoc(doc(db, "restaurants", restaurantId, "profile", "info"), {
      suspended: !currentlySuspended,
    });
    setRestaurants(prev => prev.map(r =>
      r.restaurantId === restaurantId ? { ...r, suspended: !currentlySuspended } : r
    ));
    setActionLoading(null);
    setConfirm(null);
  };

  const handleDelete = async (restaurantId) => {
    setActionLoading(restaurantId);
    try {
      // Delete menu
      const menuSnap = await getDocs(collection(db, "restaurants", restaurantId, "menu"));
      for (const d of menuSnap.docs) await deleteDoc(d.ref);
      // Delete orders
      const ordersSnap = await getDocs(collection(db, "restaurants", restaurantId, "orders"));
      for (const d of ordersSnap.docs) await deleteDoc(d.ref);
      // Delete profile
      await deleteDoc(doc(db, "restaurants", restaurantId, "profile", "info"));
      // Remove from list
      setRestaurants(prev => prev.filter(r => r.restaurantId !== restaurantId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete restaurant. Try again.");
    }
    setActionLoading(null);
    setConfirm(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.restaurantId.toLowerCase().includes(search.toLowerCase()) ||
    r.ownerEmail.toLowerCase().includes(search.toLowerCase())
  );

  const totalOrders  = restaurants.reduce((s, r) => s + r.totalOrders, 0);
  const totalRevenue = restaurants.reduce((s, r) => s + r.totalRevenue, 0);
  const thisWeek     = restaurants.filter(r => {
    if (!r.createdAt) return false;
    const d = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
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

      {/* Header */}
      <header className="bg-[#111111] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              <span className="font-display text-xl font-black text-white">TABLE</span>
              <span className="font-display text-xl font-black text-[#fa5631] italic">flow.</span>
            </div>
            <span className="text-[10px] text-white/30 font-semibold tracking-widest uppercase border border-white/10 px-2 py-0.5">
              Super Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-xs hidden sm:block">{admin?.email}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-semibold px-3 py-1.5 border border-white/10 hover:border-white/30 transition-all cursor-pointer bg-transparent">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[#fa5631] text-xs font-semibold tracking-widest uppercase mb-2">
            <span className="w-6 h-px bg-[#fa5631]" />
            Platform Overview
          </div>
          <h1 className="font-display text-4xl font-black text-white">Super Admin</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Restaurants" value={restaurants.length} sub={`${thisWeek} joined this week`} />
          <StatCard label="Total Orders" value={totalOrders.toLocaleString()} />
          <StatCard label="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} sub="Completed orders only" />
          <StatCard label="Suspended" value={restaurants.filter(r => r.suspended).length} />
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <input type="text" placeholder="Search by name, slug or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-[#111111] border border-white/10 text-white placeholder-white/20 text-sm px-4 py-2.5 focus:outline-none focus:border-[#fa5631]/40 transition-colors" />
          <button onClick={fetchRestaurants}
            className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-semibold px-4 py-2.5 border border-white/10 hover:border-white/30 transition-all cursor-pointer bg-transparent">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Restaurants list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-white/10 border-t-[#fa5631] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/20 text-sm">
            {search ? "No restaurants match your search." : "No restaurants yet."}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.restaurantId}
                className={`bg-[#111111] border transition-all ${
                  r.suspended ? "border-red-500/20 opacity-70" : "border-white/5 hover:border-white/10"
                }`}>
                {/* Row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Logo / Avatar */}
                  <div className="flex-shrink-0">
                    {r.logoUrl ? (
                      <img src={r.logoUrl} alt={r.name} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 rounded flex items-center justify-center text-white font-black text-sm"
                        style={{ background: `${r.accentColor}33` }}>
                        <span style={{ color: r.accentColor }}>{r.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm">{r.name}</p>
                      {r.suspended && (
                        <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 font-semibold">
                          SUSPENDED
                        </span>
                      )}
                      <div className="w-3 h-3 rounded-full border-2 border-[#0a0a0a]"
                        style={{ background: r.accentColor }} title="Accent colour" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap mt-0.5">
                      <span className="text-white/30 text-xs font-mono">/{r.restaurantId}</span>
                      <span className="text-white/20 text-xs">{r.ownerEmail}</span>
                      <span className="text-white/20 text-xs">Joined {formatDate(r.createdAt)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-white font-bold text-sm">{r.totalOrders}</p>
                      <p className="text-white/30 text-[10px]">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm" style={{ color: r.accentColor }}>
                        ₦{r.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-white/30 text-[10px]">Revenue</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Expand orders */}
                    <button onClick={() => handleExpand(r.restaurantId)}
                      title="View recent orders"
                      className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-all cursor-pointer bg-transparent border border-white/10 hover:border-white/30">
                      <svg className={`w-3.5 h-3.5 transition-transform ${expandedId === r.restaurantId ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {/* View live site */}
                    <a href={`/${r.restaurantId}`} target="_blank" rel="noopener noreferrer"
                      title="View restaurant"
                      className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-all border border-white/10 hover:border-white/30 no-underline">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                      </svg>
                    </a>
                    {/* Suspend / Unsuspend */}
                    <button
                      onClick={() => setConfirm({ type: "suspend", restaurantId: r.restaurantId, name: r.name, suspended: r.suspended })}
                      disabled={actionLoading === r.restaurantId}
                      title={r.suspended ? "Unsuspend" : "Suspend"}
                      className="w-8 h-8 flex items-center justify-center transition-all cursor-pointer bg-transparent border hover:border-yellow-500/30 hover:text-yellow-400 border-white/10 text-white/30 disabled:opacity-40">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {r.suspended
                          ? <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z"/>
                          : <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>
                        }
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setConfirm({ type: "delete", restaurantId: r.restaurantId, name: r.name })}
                      disabled={actionLoading === r.restaurantId}
                      title="Delete restaurant"
                      className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer bg-transparent border border-white/10 disabled:opacity-40">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded orders */}
                {expandedId === r.restaurantId && (
                  <div className="border-t border-white/5 px-5 py-4">
                    <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-3">
                      Recent Orders (last 10)
                    </p>
                    {!restaurantOrders[r.restaurantId] ? (
                      <div className="flex items-center gap-2 text-white/20 text-xs py-2">
                        <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                        Loading...
                      </div>
                    ) : restaurantOrders[r.restaurantId].length === 0 ? (
                      <p className="text-white/20 text-xs py-2">No orders yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {restaurantOrders[r.restaurantId].map(order => (
                          <div key={order.id}
                            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 border ${
                                order.status === "completed" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                order.status === "ready"     ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                                order.status === "in_progress" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                              }`}>
                                {order.status?.replace("_", " ") || "pending"}
                              </span>
                              <span className="text-white/60 text-xs">{order.customerName || "Guest"}</span>
                              <span className="text-white/30 text-xs">Table {order.table}</span>
                              <span className="text-white/20 text-xs">{formatTime(order.createdAt)}</span>
                            </div>
                            <span className="font-bold text-xs" style={{ color: r.accentColor }}>
                              ₦{Number(order.total || 0).toLocaleString()}
                            </span>
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
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
