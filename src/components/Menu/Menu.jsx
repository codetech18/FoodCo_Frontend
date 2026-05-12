import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { IoMdStarHalf } from "react-icons/io";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useOrder } from "../../Context2";
import { useRestaurant } from "../../context/RestaurantContext";
import { generateToken, saveTableSession } from "../../utils/tableToken";

const CATEGORIES = ["All", "Mains", "Drinks", "Breakfast"];

const StarRow = ({ accent }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4].map((i) => (
      <FaStar key={i} style={{ color: accent }} className="w-3 h-3" />
    ))}
    <IoMdStarHalf style={{ color: accent }} className="w-3 h-3" />
    <span className="text-white/30 text-xs ml-1">4.5</span>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[#111111] border border-white/5 overflow-hidden animate-pulse">
    <div className="h-48 bg-white/5" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-white/5 rounded w-3/4" />
      <div className="h-2 bg-white/5 rounded w-full" />
      <div className="h-2 bg-white/5 rounded w-2/3" />
      <div className="flex justify-between mt-4 pt-3 border-t border-white/5">
        <div className="h-4 bg-white/5 rounded w-16" />
        <div className="h-7 bg-white/5 rounded w-14" />
      </div>
    </div>
  </div>
);

const Menu = () => {
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";

  const { quantities, increment, decrement, totalCount } = useOrder();
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table") || "";
  const tokenParam = searchParams.get("token") || "";

  // ── Validate token from QR scan and save session ──────────────────────────
  useEffect(() => {
    if (!tableParam || !tokenParam || !restaurantId) return;
    const expected = generateToken(restaurantId, tableParam);
    if (tokenParam === expected) {
      // If scanning a different table, clear the old table session first
      const existingSession = JSON.parse(
        localStorage.getItem("servrr_table_session") || "null",
      );
      if (existingSession && existingSession.table !== tableParam) {
        localStorage.removeItem("servrr_table_session");
      }
      saveTableSession(restaurantId, tableParam, tokenParam);
    }
  }, [tableParam, tokenParam, restaurantId]);

  // ── Load menu ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!restaurantId) return;
    const q = query(
      collection(db, "restaurants", restaurantId, "menu"),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((item) => item.available !== false);
        setMenuItems(items);
        setLoading(false);
      },
      (err) => {
        console.error("Menu error:", err);
        setLoading(false);
      },
    );
    return unsub;
  }, [restaurantId]);

  const filtered =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);
  const orderTotal = Object.values(quantities).reduce(
    (sum, { price, qty }) => sum + Number(price || 0) * qty,
    0,
  );
  const orderPath = `/${restaurantId}/order${tableParam ? `?table=${tableParam}` : ""}`;
  const goToOrder = () => {
    if (totalCount > 0) navigate(orderPath);
  };

  return (
    <section id="Menu" className="bg-[#0a0a0a] py-28 relative">
      {totalCount > 0 && (
        <button
          type="button"
          onClick={goToOrder}
          className="fixed right-4 bottom-6 md:right-6 md:bottom-8 z-40 flex items-center gap-3 text-white border shadow-2xl px-4 py-3 rounded-full cursor-pointer transition-all duration-300"
          style={{
            background: "#111111",
            borderColor: `${accent}66`,
            boxShadow: `0 12px 40px ${accent}26`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = accent;
            e.currentTarget.style.borderColor = accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111111";
            e.currentTarget.style.borderColor = `${accent}66`;
          }}
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span
              className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white"
              style={{ background: accent }}
            >
              {totalCount}
            </span>
          </span>
          <span className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-bold">View Order</span>
            <span className="text-[10px] text-white/50">
              ₦{orderTotal.toLocaleString()}
            </span>
          </span>
        </button>
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: accent }}
            >
              <span className="w-8 h-px" style={{ background: accent }} />
              What we serve
            </div>
            <h2 className="font-display text-5xl lg:text-7xl font-black text-white leading-none">
              Our{" "}
              <span className="italic" style={{ color: accent }}>
                Menu
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {totalCount > 0 && (
              <div
                className="flex items-center gap-2 text-xs font-semibold px-3 py-2"
                style={{
                  background: `${accent}26`,
                  border: `1px solid ${accent}4d`,
                  color: accent,
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {totalCount} item{totalCount !== 1 ? "s" : ""} in order
              </div>
            )}
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-all duration-200 border cursor-pointer"
                style={
                  activeCategory === cat
                    ? {
                        background: accent,
                        borderColor: accent,
                        color: "white",
                      }
                    : {
                        background: "transparent",
                        borderColor: "rgba(255,255,255,0.15)",
                        color: "rgba(255,255,255,0.5)",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading ? (
            Array(8)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 text-white/20 text-sm">
              No {activeCategory === "All" ? "" : activeCategory} items on the
              menu yet.
            </div>
          ) : (
            filtered.map((item) => {
              const qty = quantities[item.name]?.qty || 0;
              const description = item.description || "";
              const isLong = description.trim().length > 80;
              const isExpanded = !!expandedDescriptions[item.id];
              return (
                <div
                  key={item.id}
                  className="group bg-[#111111] border transition-all duration-300 overflow-hidden flex flex-col"
                  style={{
                    borderColor:
                      qty > 0 ? `${accent}66` : "rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="relative h-48 overflow-hidden bg-[#1a1a1a]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <svg
                          className="w-12 h-12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white/60 text-[10px] font-semibold tracking-widest uppercase px-2 py-1">
                      {item.category}
                    </div>
                    {qty > 0 && (
                      <div
                        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg"
                        style={{ background: accent }}
                      >
                        {qty}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-white font-semibold text-sm mb-1 leading-snug">
                      {item.name}
                    </h3>
                    <div className="text-white/40 text-xs leading-relaxed mb-3 flex-1">
                      <p
                        style={
                          isExpanded || !isLong
                            ? undefined
                            : {
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }
                        }
                      >
                        {description}
                      </p>
                      {isLong && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDescriptions((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                          className="mt-1 bg-transparent border-none p-0 text-xs font-semibold cursor-pointer"
                          style={{ color: accent }}
                        >
                          {isExpanded ? "See less" : "See more"}
                        </button>
                      )}
                    </div>
                    <StarRow accent={accent} />
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <span
                        className="font-bold text-base"
                        style={{ color: accent }}
                      >
                        ₦{Number(item.price || 0).toLocaleString()}
                      </span>
                      {qty === 0 ? (
                        <button
                          onClick={() =>
                            increment(item.name, String(item.price))
                          }
                          className="text-xs font-semibold px-4 py-1.5 bg-transparent text-white border border-white/15 transition-all duration-200 cursor-pointer"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = accent;
                            e.currentTarget.style.borderColor = accent;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor =
                              "rgba(255,255,255,0.15)";
                          }}
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="flex items-center">
                          <button
                            onClick={() => decrement(item.name)}
                            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-red-500/80 text-white border border-white/10 hover:border-red-500 transition-all duration-200 cursor-pointer text-base font-bold"
                          >
                            −
                          </button>
                          <div
                            className="w-8 h-8 flex items-center justify-center text-white text-sm font-black"
                            style={{ background: accent }}
                          >
                            {qty}
                          </div>
                          <button
                            onClick={() =>
                              increment(item.name, String(item.price))
                            }
                            className="w-8 h-8 flex items-center justify-center bg-white/5 text-white border border-white/10 transition-all duration-200 cursor-pointer text-base font-bold"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = accent;
                              e.currentTarget.style.borderColor = accent;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.05)";
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.1)";
                            }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Proceed CTA */}
        {!loading && menuItems.length > 0 && (
          <div className="flex flex-col items-center gap-3 mt-14">
            <button
              onClick={goToOrder}
              disabled={totalCount === 0}
              className="group inline-flex items-center gap-3 font-semibold px-10 py-4 rounded-full transition-all duration-300 bg-transparent cursor-pointer"
              style={
                totalCount > 0
                  ? { border: `1px solid ${accent}`, color: accent }
                  : {
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.2)",
                      cursor: "not-allowed",
                    }
              }
              onMouseEnter={(e) => {
                if (totalCount > 0) {
                  e.currentTarget.style.background = accent;
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (totalCount > 0) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = accent;
                }
              }}
            >
              Proceed to Order
              {totalCount > 0 && (
                <span
                  className="text-white text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: accent }}
                >
                  {totalCount}
                </span>
              )}
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            {totalCount === 0 && (
              <p className="text-white/20 text-xs">
                Add at least one item to proceed
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
