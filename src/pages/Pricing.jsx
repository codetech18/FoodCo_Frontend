import React, { useState } from "react";
import { Link } from "react-router-dom";

const Icons = {
  Check: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fa5631"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Zap: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

const plans = [
  {
    name: "Starter",
    price: "₦10,000",
    period: "/month",
    description: "Perfect for cafes and small bars looking to go digital.",
    features: [
      "Up to 10 Tables",
      "Digital QR Menu",
      "Basic Analytics",
      "Email Support",
      "Standard Theme",
    ],
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Professional",
    price: "₦25,000",
    period: "/month",
    description: "Built for busy restaurants needing full control.",
    features: [
      "Unlimited Tables",
      "Custom Brand Colors",
      "Real-time Dashboard",
      "Priority WhatsApp Support",
      "Advanced Analytics",
      "Kitchen Display Sync",
    ],
    cta: "Go Professional",
    featured: true, // This will be highlighted
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For restaurant chains and multi-location groups.",
    features: [
      "Multi-location Mgmt",
      "Custom API Access",
      "Dedicated Account Manager",
      "White-label Domain",
      "Staff Performance Tracking",
      "24/7 Phone Support",
    ],
    cta: "Coming soon",
    featured: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#fa5631]">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#fa5631] opacity-5 blur-[120px] rounded-full pointer-events-none" />

      {/* --- Navigation --- */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-black text-2xl tracking-tight text-white hover:text-[#fa5631] transition-colors"
        >
          SERVRR
        </Link>
        <div className="flex gap-8 items-center">
          <Link
            to="/support"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Support
          </Link>
          <Link
            to="/login"
            className="bg-white/5 px-5 py-2 rounded-full text-sm font-bold border border-white/10 hover:bg-white/10 transition-all"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* --- Header --- */}
      <section className="relative z-10 pt-24 pb-12 px-6 text-center max-w-3xl mx-auto">
        <span className="text-[#fa5631] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
          Pricing Plans
        </span>
        <h1 className="font-display text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
          Scalable solutions for{" "}
          <span className="text-white/40 italic">every kitchen.</span>
        </h1>
        <p className="text-white/50 text-lg">
          No hidden fees. No hardware lock-in. Switch plans anytime your
          business grows.
        </p>
      </section>

      {/* --- Pricing Grid --- */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 group ${
                plan.featured
                  ? "bg-[#111111] border-[#fa5631]/40 shadow-[0_0_50px_-12px_rgba(250,86,49,0.2)] scale-105 z-20"
                  : "bg-[#0d0d0d] border-white/5 hover:border-white/20 z-10"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#fa5631] text-black text-[10px] font-black uppercase py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Icons.Zap /> Recommended
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm text-white/70"
                  >
                    <Icons.Check /> {feature}
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                  plan.featured
                    ? "bg-[#fa5631] text-black hover:bg-[#ff6b4a] shadow-xl shadow-[#fa5631]/20"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- Trust/FAQ Strip --- */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-white/30 text-sm italic">
          "We switched to SERVRR Professional and saw a 15% increase in table
          turnover in the first month."
        </p>
        <p className="text-white/50 text-xs font-bold mt-4 uppercase tracking-widest">
          — Lagos Grill House
        </p>
      </section>

      <footer className="border-t border-white/5 py-12 text-center opacity-30 text-[10px] font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} SERVRR TECHNOLOGIES. BUILT FOR THE AFRICAN
        TABLE.
      </footer>
    </div>
  );
};

export default Pricing;
