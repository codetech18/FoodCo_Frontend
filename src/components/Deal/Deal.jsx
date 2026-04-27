import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useRestaurant } from "../../context/RestaurantContext";

const Deal = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();

  const accent = profile?.accentColor || "#fa5631";
  const dealFreeItem = profile?.dealFreeItem || "";
  const dealDesc = profile?.dealDesc || "";
  const dealBadge = profile?.dealBadge || "TODAY";
  const dealTag = profile?.dealTag || "Deal of the Day";

  const [menuItems, setMenuItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(
      collection(db, "restaurants", restaurantId, "menu"),
      orderBy("createdAt", "asc"),
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((i) => i.available !== false);
      setMenuItems(items);
      // Auto-select first item if nothing selected yet
      if (items.length > 0) setSelectedId((prev) => prev || items[0].id);
    });
  }, [restaurantId]);

  const deal = menuItems.find((i) => i.id === selectedId) || menuItems[0];

  if (!deal) return null; // No menu items yet — hide section

  const description =
    dealDesc ||
    `Order the ${deal.name}${dealFreeItem ? ` and get a free ${dealFreeItem}` : ""} — a customer favourite. ${deal.description || ""}`.trim();

  return (
    <section id="About" className="bg-[#111111] py-28 overflow-hidden relative">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${accent}66, transparent)`,
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative flex justify-center order-2 lg:order-1">
            <div
              className="absolute w-80 h-80 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ background: `${accent}26` }}
            />
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-full border"
                style={{ borderColor: `${accent}33` }}
              />
              <div className="absolute -inset-12 rounded-full border border-white/5" />
              {deal.imageUrl ? (
                <img
                  src={deal.imageUrl}
                  alt={deal.name}
                  loading="lazy"
                  className="relative z-10 w-64 lg:w-80 rounded-2xl object-cover drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                  style={{ filter: `drop-shadow(0 20px 50px ${accent}59)` }}
                />
              ) : (
                <div
                  className="relative z-10 w-64 lg:w-64 h-64 rounded-2xl flex items-center justify-center border border-white/10"
                  style={{ background: `${accent}15` }}
                >
                  <span className="text-7xl">🍽️</span>
                </div>
              )}
              <div
                className="absolute -top-3 -right-3 z-20 text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full"
                style={{ background: accent }}
              >
                {dealBadge}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ color: accent }}
            >
              <span className="w-8 h-px" style={{ background: accent }} />
              {dealTag}
            </div>

            <h2 className="font-display text-5xl lg:text-6xl font-black text-white leading-tight mb-3">
              <span className="italic" style={{ color: accent }}>
                {deal.name}
              </span>
            </h2>

            <p
              className="text-white/30 text-xl font-light mb-2"
              style={{ color: `${accent}99` }}
            >
              ₦{Number(deal.price || 0).toLocaleString()}
            </p>

            <p className="text-white/50 text-base leading-relaxed mb-6 max-w-lg">
              {description}
            </p>

            {/* Highlight */}
            {dealFreeItem && (
              <div className="bg-white/5 border border-white/10 p-4 mb-6 rounded-2xl flex items-start gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-xl"
                  style={{ background: `${accent}33` }}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: accent }}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">
                    Free {dealFreeItem}
                  </div>
                  <div className="text-white/40 text-sm">
                    With every {deal.name} order. Today only.
                  </div>
                </div>
              </div>
            )}

            {/* Menu item picker */}
            {menuItems.length > 1 && (
              <div className="mb-6">
                <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-2">
                  Featured item
                </p>
                <div className="flex flex-wrap gap-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className="px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer rounded-full"
                      style={
                        selectedId === item.id
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
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => navigate(`/${restaurantId}/menu`)}
              className="inline-flex items-center gap-3 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 group border-none cursor-pointer"
              style={{ background: accent }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Order Now
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Deal;
