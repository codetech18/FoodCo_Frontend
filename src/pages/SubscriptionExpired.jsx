import React from "react";
import { Link } from "react-router-dom";
import { useRestaurant } from "../context/RestaurantContext";

const SubscriptionExpired = () => {
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";
  const name   = profile?.name        || "Your restaurant";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </div>
        <h1 className="font-display text-3xl font-black text-white mb-3">
          Subscription Expired
        </h1>
        <p className="text-white/40 text-sm leading-relaxed mb-2">
          <span className="text-white font-semibold">{name}</span>'s 7-day free trial has ended.
        </p>
        <p className="text-white/30 text-sm leading-relaxed mb-8">
          To continue taking orders, the monthly subscription fee of{" "}
          <span className="text-white font-bold">₦20,000</span> needs to be paid.
          Please contact SERVRR support to renew your subscription.
        </p>

        <div className="bg-[#111111] border border-white/5 p-5 mb-6 text-left space-y-3">
          <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">How to renew</p>
          {[
            "Contact us at support@servrr.ng",
            "Pay ₦20,000 via bank transfer or Paystack",
            "Your account will be reactivated within 1 hour",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5"
                style={{ background: accent }}>{i + 1}</div>
              <p className="text-white/50 text-sm">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <a href="mailto:support@servrr.ng"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-3.5 rounded-full no-underline transition-all hover:opacity-85"
            style={{ background: accent }}>
            Contact Support
          </a>
          <Link to="/" className="text-white/30 hover:text-white text-sm transition-colors no-underline">
            Back to SERVRR
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpired;
