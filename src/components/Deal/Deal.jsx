import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRestaurant } from "../../context/RestaurantContext";

const Deal = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();

  const accent = profile?.accentColor || "#fa5631";
  const dealTitle = profile?.dealTitle || "Deal Of The Day";
  const dealItem = profile?.dealItem || "Ramen Noodles";
  const dealFreeItem = profile?.dealFreeItem || "Yogurt Smoothie";
  const dealDesc =
    profile?.dealDesc ||
    `Order the ${dealItem} and get a free ${dealFreeItem} — on us!`;
  const dealImageUrl = profile?.dealImageUrl || null;
  const dealBadge = profile?.dealBadge || "NEW!";
  const dealTag = profile?.dealTag || "Limited Time";

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
              {dealImageUrl ? (
                <img
                  src={dealImageUrl}
                  alt={dealItem}
                  loading="lazy"
                  className="relative z-10 w-64 lg:w-80 rounded-2xl object-cover drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                  style={{ filter: `drop-shadow(0 20px 50px ${accent}59)` }}
                />
              ) : (
                <div
                  className="relative z-10 w-64 lg:w-72 h-64 lg:h-72 rounded-2xl flex items-center justify-center border border-white/10"
                  style={{ background: `${accent}15` }}
                >
                  <span className="text-7xl">🍜</span>
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

            <h2 className="font-display text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              <span className="italic" style={{ color: accent }}>
                Deal
              </span>
              <br />
              {dealTitle}
            </h2>

            <p className="text-white/50 text-base leading-relaxed mb-8 max-w-lg">
              {dealDesc}
            </p>

            <div className="bg-white/5 border border-white/10 p-4 mb-8 rounded-2xl flex items-start gap-4">
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
                  With every {dealItem} order. Today only.
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/${restaurantId}/menu`)}
              className="inline-flex items-center gap-3 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 group border-none cursor-pointer"
              style={{ background: accent }}
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
