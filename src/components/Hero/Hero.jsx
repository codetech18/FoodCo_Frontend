import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRestaurant } from "../../context/RestaurantContext";

const Hero = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();

  const accent = profile?.accentColor || "#fa5631";
  const name =
    profile?.name ||
    (restaurantId
      ? restaurantId.replace(/-/g, " ").toUpperCase()
      : "YOUR BRAND");
  const tagline = profile?.tagline || "Experience a world of flavour.";
  const description =
    profile?.description ||
    "Browse our mouthwatering menu, place your order effortlessly, and experience a world of flavour tailored for you.";
  const heroImage = profile?.heroImageUrl || null;

  const stats = [
    { value: profile?.stat1Value, label: profile?.stat1Label },
    { value: profile?.stat2Value, label: profile?.stat2Label },
    { value: profile?.stat3Value, label: profile?.stat3Label },
  ].filter((stat) => stat.value && stat.label);

  const floatingStat =
    stats.length > 0
      ? stats[stats.length - 1]
      : { value: "4.9★", label: "Top Rated" };

  const scrollToMenu = () => {
    document.querySelector("#Menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const goToOrder = () => {
    navigate(`/${restaurantId}/menu`);
  };

  return (
    <section className="relative min-h-screen bg-[#0a0a0a] flex items-center overflow-hidden w-full pt-24 pb-16 lg:pt-0 lg:pb-0">
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none translate-x-1/3 -translate-y-1/3"
        style={{ backgroundColor: accent }}
      />
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none -translate-x-1/3 translate-y-1/3"
        style={{ backgroundColor: accent }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full grid lg:grid-cols-12 gap-16 items-center relative z-10">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="inline-flex items-center gap-3 bg-[#111111] border border-white/5 text-[10px] sm:text-xs font-black tracking-widest uppercase px-4 py-2.5 rounded-full mb-8 w-fit shadow-xl backdrop-blur-md">
            <span
              className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]"
              style={{ backgroundColor: accent, color: accent }}
            />
            <span className="text-white/90">Now Accepting Orders</span>
          </div>

          <div
            className="w-16 h-1 mb-6 rounded-full"
            style={{ backgroundColor: accent }}
          />

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tight text-white mb-6 break-words hyphens-auto">
            {name}
          </h1>

          <h2
            className="text-xl md:text-2xl font-light tracking-wide mb-6"
            style={{ color: accent }}
          >
            {tagline}
          </h2>

          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl mb-10 font-light">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
            <button
              onClick={goToOrder}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
              style={{
                backgroundColor: accent,
                color: "#0a0a0a",
                boxShadow: `0 10px 30px -10px ${accent}`,
              }}
            >
              Order Now
            </button>

            <button
              onClick={scrollToMenu}
              className="w-full sm:w-auto group inline-flex justify-center items-center gap-3 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 bg-transparent border hover:bg-white/5"
              style={{
                borderColor: accent,
                color: accent,
              }}
            >
              View Menu
              <svg
                className="w-4 h-4 group-hover:translate-y-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 max-w-xl">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col">
                  <span className="font-display text-2xl md:text-3xl font-black text-white mb-1">
                    {stat.value}
                  </span>
                  <span className="text-white/40 text-xs font-bold uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Adjusted Right Side Container - Height reduced for a tighter look */}
        <div className="lg:col-span-5 relative w-full h-[400px] lg:h-[500px] hidden md:flex items-center justify-center">
          <div className="absolute top-1/4 -left-8 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] shadow-2xl flex items-center gap-5 z-30 animate-[bounce_4s_infinite]">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${accent}20`, color: accent }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="pr-2">
              <p className="text-white font-black text-lg">
                {floatingStat.value}
              </p>
              <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">
                {floatingStat.label}
              </p>
            </div>
          </div>

          {heroImage ? (
            <div className="relative w-full h-full rounded-[3rem] overflow-hidden group border border-white/10 z-20">
              <div
                className="absolute inset-0 z-10 opacity-40 transition-opacity duration-700 group-hover:opacity-20 mix-blend-multiply"
                style={{ backgroundColor: accent }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
              <img
                src={heroImage}
                alt={name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="relative w-full h-full rounded-[3rem] border border-white/5 bg-[#111111] overflow-hidden flex items-center justify-center z-20 shadow-2xl">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at center, ${accent} 0%, transparent 60%)`,
                }}
              />
              <div
                className="absolute w-[150%] h-[150%] animate-[spin_20s_linear_infinite] opacity-30"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0 340deg, ${accent} 360deg)`,
                }}
              />
              <div className="absolute inset-2 rounded-[2.8rem] bg-[#0a0a0a] flex items-center justify-center backdrop-blur-3xl border border-white/5">
                <div
                  className="w-40 h-40 rounded-full border border-dashed animate-[spin_40s_linear_infinite_reverse] flex items-center justify-center"
                  style={{ borderColor: `${accent}40` }}
                >
                  <div
                    className="w-28 h-28 rounded-full border flex items-center justify-center relative"
                    style={{ borderColor: `${accent}60` }}
                  >
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-50"
                      style={{ backgroundColor: accent }}
                    />
                    <span
                      className="font-display text-6xl font-black relative z-10"
                      style={{ color: accent }}
                    >
                      {name.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-2xl z-10 pointer-events-none opacity-60"
            style={{ backgroundColor: accent }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
