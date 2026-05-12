import React from "react";
import { useRestaurant } from "../context/RestaurantContext";

const SubscriptionExpired = () => {
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";
  const name = profile?.name || "This restaurant";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 text-white">
      <div className="text-center max-w-sm">
        <div
          className="w-24 h-24 rounded-full border flex items-center justify-center mx-auto mb-7"
          style={{
            background: `${accent}12`,
            borderColor: `${accent}30`,
            animation: "sad-bob 2.4s ease-in-out infinite",
          }}
        >
          <svg
            className="w-14 h-14"
            style={{ color: accent }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9 10h.01M15 10h.01" strokeLinecap="round" />
            <path d="M8.5 16c1-1.2 2.1-1.8 3.5-1.8s2.5.6 3.5 1.8" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-black mb-3">
          Page Not Available Right Now
        </h1>
        <p className="text-white/45 text-sm leading-relaxed mb-2">
          {name}'s ordering page is temporarily unavailable.
        </p>
        <p className="text-white/30 text-sm leading-relaxed">
          Please reach out to a staff member for help placing your order.
        </p>

        <style>{`
          @keyframes sad-bob {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(6px) rotate(-2deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default SubscriptionExpired;
