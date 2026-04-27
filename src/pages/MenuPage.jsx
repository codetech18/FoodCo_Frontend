import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Menu from "../components/Menu/Menu";
import Footer from "../components/Footer/Footer";
import ActiveOrderBanner from "../components/ActiveOrderBanner";
import { useRestaurant } from "../context/RestaurantContext";

const MenuPage = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";

  return (
    <div className="antialiased bg-[#0a0a0a] text-white overflow-x-hidden">
      <NavBar />
      <ActiveOrderBanner />

      {/* Page header */}
      <div className="bg-[#111111] pt-32 pb-12 px-6 border-b border-white/5 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: accent }}
          >
            <span className="w-8 h-px" style={{ background: accent }} />
            Step 1 of 2
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-black text-white mb-4">
            Pick your{" "}
            <span className="italic" style={{ color: accent }}>
              dishes
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl">
            Browse the menu below, click{" "}
            <strong className="text-white font-medium">+ Add</strong> on
            anything you want, then proceed to the order form.
          </p>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center text-white text-sm font-bold"
                style={{ background: accent }}
              >
                1
              </div>
              <span className="text-white text-sm font-medium">
                Add items from the menu
              </span>
            </div>
            <div className="w-8 h-px bg-white/20" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 border border-white/10 flex items-center justify-center text-white/50 text-sm font-bold">
                2
              </div>
              <span className="text-white/50 text-sm">
                Fill in the order form & confirm
              </span>
            </div>
          </div>
        </div>
      </div>

      <Menu />
      <Footer />
    </div>
  );
};

export default MenuPage;
