import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Order from "../components/Order/Order";
import Footer from "../components/Footer/Footer";

const OrderPage = () => {
  return (
    <div className="antialiased bg-[#0a0a0a] text-white overflow-x-hidden">
      <NavBar />

      {/* Page header */}
      <div className="bg-[#111111] pt-32 pb-10 px-6 border-b border-white/5 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 text-[#fa5631] text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-8 h-px bg-[#fa5631]" />
            Almost there
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-black text-white mb-3">
            Complete your <span className="text-[#fa5631] italic">Order</span>
          </h1>
          <p className="text-white/40 text-base max-w-lg">
            Fill in your details below and confirm your order. You'll be able to track it in real time once placed.
          </p>
        </div>
      </div>

      <Order />
      <Footer />
    </div>
  );
};

export default OrderPage;
