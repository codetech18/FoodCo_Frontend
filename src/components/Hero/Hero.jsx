import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRestaurant } from "../../context/RestaurantContext";

const Hero = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();

  const name = profile?.name || "FOODco";
  const tagline = profile?.tagline || "Culinary delights, delivered.";
  const description =
    profile?.description ||
    "Browse our mouthwatering menu, place your order effortlessly, and experience a world of flavour.";
  const accent = profile?.accentColor || "#fa5631";
  const heroImage = profile?.heroImageUrl || null;
  const logoUrl = profile?.logoUrl || null;

  return (
    <section
      id="Home"
      className="relative min-h-screen bg-[#0a0a0a] flex items-center overflow-hidden"
    >
      {/* Gradient glow */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${accent}08, transparent)`,
        }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: `${accent}0d` }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-16 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text */}
        <div>
          <div
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8"
            style={{ color: accent }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: accent }}
            />
            Now Accepting Orders
          </div>

          <h1 className="font-display text-6xl lg:text-7xl font-black leading-none tracking-tight text-white mb-6">
            Welcome to{" "}
            <span className="italic" style={{ color: accent }}>
              {name}
            </span>
          </h1>

          <p className="text-white/50 text-lg leading-relaxed max-w-lg mb-4 font-light">
            {tagline}
          </p>
          <p className="text-white/30 text-base leading-relaxed max-w-lg mb-10">
            {description}
          </p>

          <button
            onClick={() => navigate(`/${restaurantId}/menu`)}
            className="group inline-flex items-center gap-3 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 border-none cursor-pointer"
            style={{ background: accent }}
          >
            Explore Menu
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

          {/* Stats */}
          <div className="flex items-center gap-8 mt-14 pt-10 border-t border-white/10">
            {[
              {
                value: profile?.stat1Value || "200+",
                label: profile?.stat1Label || "Menu Items",
              },
              {
                value: profile?.stat2Value || "5K+",
                label: profile?.stat2Label || "Happy Customers",
              },
              {
                value: profile?.stat3Value || "4.9★",
                label: profile?.stat3Label || "Rating",
              },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-white/40 text-xs tracking-wide mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image / avatar */}
        <div className="relative hidden lg:flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none" />
          <div
            className="absolute -inset-8 rounded-full blur-3xl"
            style={{ background: `${accent}1a` }}
          />
          {heroImage ? (
            <img
              src={heroImage}
              alt={name}
              loading="lazy"
              className="relative z-20 w-auto max-h-[580px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
              style={{ filter: `drop-shadow(0 20px 60px ${accent}40)` }}
            />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt={name}
              loading="lazy"
              className="relative z-20 w-64 h-64 object-contain drop-shadow-2xl opacity-20"
            />
          ) : (
            <div
              className="relative z-20 w-72 h-72 rounded-full flex items-center justify-center border border-white/5"
              style={{ background: `${accent}10` }}
            >
              <span
                className="font-display text-8xl font-black"
                style={{ color: accent }}
              >
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
