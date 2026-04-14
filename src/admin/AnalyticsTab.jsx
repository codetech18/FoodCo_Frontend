import React, { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { useRestaurant } from "../context/RestaurantContext";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDate = (ts) => ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;

const filterByPeriod = (orders, period) => {
  const now = new Date();
  return orders.filter((o) => {
    const d = toDate(o.createdAt);
    if (!d) return false;
    if (period === "7d")  return (now - d) <= 7  * 86400000;
    if (period === "30d") return (now - d) <= 30 * 86400000;
    return true;
  });
};

const fmtCurrency = (v) => `₦${Number(v || 0).toLocaleString()}`;
const fmtShortDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, icon }) => (
  <div className="bg-[#111111] border border-white/5 p-5 flex items-start gap-4">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: `${accent}20` }}>
      <span style={{ color: accent }}>{icon}</span>
    </div>
    <div>
      <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-1">{label}</p>
      <p className="font-display text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 px-3 py-2 text-xs">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {currency ? fmtCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AnalyticsTab = () => {
  const { restaurantId } = useParams();
  const { profile }      = useRestaurant();
  const accent           = profile?.accentColor || "#fa5631";

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState("30d");

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(
      collection(db, "restaurants", restaurantId, "orders"),
      orderBy("createdAt", "asc"),
    );
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [restaurantId]);

  const filtered = useMemo(() => filterByPeriod(orders, period), [orders, period]);
  const completed = useMemo(() => filtered.filter((o) => o.status === "completed"), [filtered]);

  // ── KPI stats ──────────────────────────────────────────────────────────────
  const totalRevenue  = completed.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalOrders   = filtered.length;
  const avgOrderValue = completed.length ? totalRevenue / completed.length : 0;
  const completionRate = filtered.length
    ? Math.round((completed.length / filtered.length) * 100) : 0;

  // ── Revenue over time ──────────────────────────────────────────────────────
  const revenueData = useMemo(() => {
    const map = {};
    completed.forEach((o) => {
      const d = toDate(o.createdAt);
      if (!d) return;
      const key = d.toISOString().split("T")[0];
      map[key] = (map[key] || 0) + Number(o.total || 0);
    });
    // Fill missing days
    const days = period === "7d" ? 7 : period === "30d" ? 30 : null;
    if (days) {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        if (!map[key]) map[key] = 0;
      }
    }
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date: fmtShortDate(date), revenue }));
  }, [completed, period]);

  // ── Orders per day ─────────────────────────────────────────────────────────
  const ordersData = useMemo(() => {
    const map = {};
    filtered.forEach((o) => {
      const d = toDate(o.createdAt);
      if (!d) return;
      const key = d.toISOString().split("T")[0];
      map[key] = (map[key] || 0) + 1;
    });
    const days = period === "7d" ? 7 : period === "30d" ? 30 : null;
    if (days) {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        if (!map[key]) map[key] = 0;
      }
    }
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date: fmtShortDate(date), orders: count }));
  }, [filtered, period]);

  // ── Peak hours ─────────────────────────────────────────────────────────────
  const peakHoursData = useMemo(() => {
    const map = {};
    for (let i = 0; i < 24; i++) map[i] = 0;
    filtered.forEach((o) => {
      const d = toDate(o.createdAt);
      if (!d) return;
      map[d.getHours()] = (map[d.getHours()] || 0) + 1;
    });
    return Object.entries(map).map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      orders: count,
    }));
  }, [filtered]);

  // ── Top dishes ─────────────────────────────────────────────────────────────
  const topDishesData = useMemo(() => {
    const map = {};
    filtered.forEach((o) => {
      (o.items || []).forEach((item) => {
        map[item.name] = (map[item.name] || 0) + item.qty;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, qty]) => ({ name, qty }));
  }, [filtered]);

  // ── Order status breakdown ─────────────────────────────────────────────────
  const statusData = useMemo(() => {
    const map = { pending: 0, in_progress: 0, ready: 0, completed: 0 };
    filtered.forEach((o) => { if (map[o.status] !== undefined) map[o.status]++; });
    return [
      { name: "Completed",   value: map.completed,   color: "#22c55e" },
      { name: "Pending",     value: map.pending,     color: "#eab308" },
      { name: "In Progress", value: map.in_progress, color: "#3b82f6" },
      { name: "Ready",       value: map.ready,       color: accent },
    ].filter((d) => d.value > 0);
  }, [filtered, accent]);

  const PERIOD_OPTS = [
    { key: "7d",  label: "Last 7 Days" },
    { key: "30d", label: "Last 30 Days" },
    { key: "all", label: "All Time" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/10 rounded-full animate-spin"
        style={{ borderTopColor: accent }} />
    </div>
  );

  const chartGrid   = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />;
  const axisStyle   = { fill: "rgba(255,255,255,0.3)", fontSize: 10 };

  return (
    <div className="space-y-8">

      {/* Period selector */}
      <div className="flex items-center gap-2">
        {PERIOD_OPTS.map(({ key, label }) => (
          <button key={key} onClick={() => setPeriod(key)}
            className="px-4 py-2 text-xs font-semibold border transition-all cursor-pointer"
            style={period === key
              ? { background: accent, borderColor: accent, color: "white" }
              : { background: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
            {label}
          </button>
        ))}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmtCurrency(totalRevenue)}
          sub="Completed orders only" accent={accent}
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
        <StatCard label="Total Orders" value={totalOrders}
          sub={`${completed.length} completed`} accent={accent}
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>} />
        <StatCard label="Avg Order Value" value={fmtCurrency(avgOrderValue)}
          sub="Per completed order" accent={accent}
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>} />
        <StatCard label="Completion Rate" value={`${completionRate}%`}
          sub="Orders marked completed" accent={accent}
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z"/></svg>} />
      </div>

      {/* Revenue over time */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-1">Revenue Over Time</h3>
        <p className="text-white/30 text-xs mb-6">Daily revenue from completed orders</p>
        {revenueData.length === 0 ? (
          <p className="text-white/20 text-sm text-center py-12">No completed orders in this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              {chartGrid}
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip currency />} />
              <Area type="monotone" dataKey="revenue" stroke={accent} strokeWidth={2}
                fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: accent }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders per day + Peak hours side by side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders per day */}
        <div className="bg-[#111111] border border-white/5 p-6">
          <h3 className="text-white font-bold text-sm mb-1">Orders Per Day</h3>
          <p className="text-white/30 text-xs mb-6">All orders regardless of status</p>
          {ordersData.every(d => d.orders === 0) ? (
            <p className="text-white/20 text-sm text-center py-12">No orders in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersData}>
                {chartGrid}
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill={accent} radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Peak hours */}
        <div className="bg-[#111111] border border-white/5 p-6">
          <h3 className="text-white font-bold text-sm mb-1">Peak Hours</h3>
          <p className="text-white/30 text-xs mb-6">When customers order the most</p>
          {filtered.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-12">No orders in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={peakHoursData}>
                {chartGrid}
                <XAxis dataKey="hour" tick={{ ...axisStyle, fontSize: 8 }} axisLine={false} tickLine={false}
                  interval={2} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" radius={[3, 3, 0, 0]}
                  fill={accent} opacity={0.85}>
                  {peakHoursData.map((entry, i) => (
                    <Cell key={i}
                      fill={accent}
                      opacity={entry.orders === Math.max(...peakHoursData.map(d => d.orders)) ? 1 : 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top dishes + Order status side by side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top dishes */}
        <div className="bg-[#111111] border border-white/5 p-6">
          <h3 className="text-white font-bold text-sm mb-1">Top Dishes</h3>
          <p className="text-white/30 text-xs mb-6">Most ordered items this period</p>
          {topDishesData.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-12">No orders in this period.</p>
          ) : (
            <div className="space-y-3">
              {topDishesData.map((dish, i) => {
                const max = topDishesData[0].qty;
                const pct = Math.round((dish.qty / max) * 100);
                return (
                  <div key={dish.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/20 text-[10px] font-black w-4">#{i + 1}</span>
                        <span className="text-white/70 text-xs truncate max-w-[180px]">{dish.name}</span>
                      </div>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: accent }}>
                        {dish.qty} sold
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: accent, opacity: 0.7 + (pct / 333) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="bg-[#111111] border border-white/5 p-6">
          <h3 className="text-white font-bold text-sm mb-1">Order Status Breakdown</h3>
          <p className="text-white/30 text-xs mb-6">Distribution of order statuses</p>
          {statusData.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-12">No orders in this period.</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    dataKey="value" paddingAngle={3} strokeWidth={0}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-white/50 text-xs">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs">{s.value}</span>
                      <span className="text-white/20 text-[10px]">
                        {Math.round((s.value / filtered.length) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wide">Total</span>
                    <span className="text-white font-bold text-xs">{filtered.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
