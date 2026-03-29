import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { IoMdStarHalf } from "react-icons/io";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../../Context2";

const categories = ["All", "Mains", "Drinks", "Breakfast"];

const StarRow = () => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4].map((i) => (
      <FaStar key={i} className="text-[#fa5631] w-3 h-3" />
    ))}
    <IoMdStarHalf className="text-[#fa5631] w-3 h-3" />
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
  const { quantities, increment, decrement, totalCount } = useOrder();
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "menu"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((item) => item.available !== false);
      setMenuItems(items);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <section id="Menu" className="bg-[#0a0a0a] py-28 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 text-[#fa5631] text-xs font-semibold tracking-widest uppercase mb-3">
              <span className="w-8 h-px bg-[#fa5631]" />
              What we serve
            </div>
            <h2 className="font-display text-5xl lg:text-7xl font-black text-white leading-none">
              Our <span className="text-[#fa5631] italic">Menu</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {totalCount > 0 && (
              <div className="flex items-center gap-2 bg-[#fa5631]/15 border border-[#fa5631]/30 text-[#fa5631] text-xs font-semibold px-3 py-2">
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
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-all duration-200 border cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#fa5631] border-[#fa5631] text-white"
                    : "border-white/15 text-white/50 hover:border-white/40 hover:text-white bg-transparent"
                }`}
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
              return (
                <div
                  key={item.id}
                  className={`group bg-[#111111] border transition-all duration-300 overflow-hidden flex flex-col ${
                    qty > 0
                      ? "border-[#fa5631]/40"
                      : "border-white/5 hover:border-[#fa5631]/20"
                  }`}
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
                      <div className="absolute top-3 right-3 w-7 h-7 bg-[#fa5631] rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg">
                        {qty}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-white font-semibold text-sm mb-1 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-white/40 text-xs leading-relaxed mb-3 flex-1">
                      {item.description}
                    </p>
                    <StarRow />
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <span className="text-[#fa5631] font-bold text-base">
                        ₦{Number(item.price || 0).toLocaleString()}
                      </span>
                      {qty === 0 ? (
                        <button
                          onClick={() =>
                            increment(item.name, String(item.price))
                          }
                          className="text-xs font-semibold px-4 py-1.5 bg-transparent hover:bg-[#fa5631] text-white border border-white/15 hover:border-[#fa5631] transition-all duration-200 cursor-pointer"
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-0">
                          <button
                            onClick={() => decrement(item.name)}
                            className="w-8 h-8 flex items-center justify-center bg-white/8 hover:bg-red-500/80 text-white border border-white/10 hover:border-red-500 transition-all duration-200 cursor-pointer text-base font-bold border-none"
                          >
                            −
                          </button>
                          <div className="w-8 h-8 flex items-center justify-center bg-[#fa5631] text-white text-sm font-black">
                            {qty}
                          </div>
                          <button
                            onClick={() =>
                              increment(item.name, String(item.price))
                            }
                            className="w-8 h-8 flex items-center justify-center bg-white/8 hover:bg-[#fa5631] text-white border border-white/10 hover:border-[#fa5631] transition-all duration-200 cursor-pointer text-base font-bold border-none"
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

        {/* CTA — navigates to /order page */}
        {!loading && menuItems.length > 0 && (
          <div className="flex justify-center mt-14">
            <button
              onClick={() => navigate("/order")}
              className="group inline-flex items-center gap-3 border border-[#fa5631] text-[#fa5631] hover:bg-[#fa5631] hover:text-white font-semibold px-10 py-4 transition-all duration-300 cursor-pointer bg-transparent"
            >
              Proceed to Order
              {totalCount > 0 && (
                <span className="bg-[#fa5631] group-hover:bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">
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
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
