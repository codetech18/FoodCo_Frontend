import React from "react";
import { Link } from "react-router-dom";
import { useRestaurant } from "../context/RestaurantContext";

const Suspended = () => {
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";
  const name   = profile?.name        || "This restaurant";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-black text-white mb-3">Account Restricted</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-2">
          <span className="text-white font-semibold">{name}</span>'s account has been temporarily restricted.
        </p>
        <p className="text-white/30 text-sm leading-relaxed mb-8">
          If you believe this is a mistake, please contact the platform administrator.
        </p>
        <Link to="/"
          className="inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-full no-underline transition-all hover:opacity-85"
          style={{ background: accent }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Tableflow
        </Link>
      </div>
    </div>
  );
};

export default Suspended;
