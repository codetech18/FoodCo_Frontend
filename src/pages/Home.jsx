import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero/Hero";
import Deal from "../components/Deal/Deal";
import Footer from "../components/Footer/Footer";
import ActiveOrderBanner from "../components/ActiveOrderBanner";
import { useRestaurant } from "../context/RestaurantContext";

const Home = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { profile, loading, notFound } = useRestaurant();

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#fa5631] rounded-full animate-spin" />
      </div>
    );

  if (notFound)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-white/30 text-sm mb-2">Restaurant not found</p>
          <p className="text-white/20 text-xs">
            No restaurant exists at{" "}
            <span className="text-white/40">/{restaurantId}</span>
          </p>
        </div>
      </div>
    );

  const accent = profile?.accentColor || "#fa5631";

  return (
    <div className="antialiased bg-[#0a0a0a] text-white overflow-x-hidden">
      <NavBar />
      <ActiveOrderBanner />
      <Hero />
      <Deal />

      {/* CTA Banner */}
      <div
        className="py-16 px-6 text-center relative overflow-hidden"
        style={{ background: accent }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-white/80 text-xs font-semibold tracking-widest uppercase mb-3">
            Ready to eat?
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            Browse our full menu & place your order
          </h2>
          <p className="text-white/70 text-base mb-8">
            Pick your favourites and order in seconds.
          </p>
          <button
            onClick={() => navigate(`/${restaurantId}/menu`)}
            className="inline-flex items-center gap-3 bg-white font-bold px-10 py-4 rounded-full hover:bg-[#0a0a0a] hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-none"
            style={{ color: accent }}
          >
            View Menu & Order
            <svg
              className="w-4 h-4"
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

      <Footer />
    </div>
  );
};

export default Home;
