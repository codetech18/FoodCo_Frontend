import React from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero/Hero";
import Deal from "../components/Deal/Deal";
import Team from "../components/Team/Team";
import Footer from "../components/Footer/Footer";
import ActiveOrderBanner from "../components/ActiveOrderBanner";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Active order banner — shows if customer has a cached order */}
      <ActiveOrderBanner />

      <Hero />
      <Deal />

      {/* CTA Banner — leads to Menu/Order page */}
      <div className="bg-[#fa5631] py-16 px-6 text-center relative overflow-hidden">
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
            Over 20 dishes across mains, drinks, and breakfast — pick your
            favourites and order in seconds.
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="inline-flex items-center gap-3 bg-white text-[#fa5631] font-bold px-10 py-4 rounded-full hover:bg-[#0a0a0a] hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-none"
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

      <Team />
      <Footer />
    </div>
  );
};

export default Home;
