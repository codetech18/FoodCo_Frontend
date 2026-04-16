import React, { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../admin/AuthContext";

const Welcome = () => {
  const { admin, restaurantId, authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate("/login");
    }
  }, [authLoading, admin, navigate]);

  useEffect(() => {
    if (!restaurantId || restaurantId === "superadmin") return;

    getDoc(doc(db, "restaurants", restaurantId, "profile", "info")).then(
      (snap) => {
        if (snap.exists()) setProfile(snap.data());
      },
    );
  }, [restaurantId]);

  if (authLoading || (!restaurantId && admin)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/5 border-t-[#fa5631] rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurantId) return <Navigate to="/login" />;

  const accent = profile?.accentColor || "#fa5631";
  const name = profile?.name || "Restaurant";
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const customerUrl = `${baseUrl}/${restaurantId}`;
  const adminUrl = `${baseUrl}/${restaurantId}/admin`;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const LinkCard = ({ label, url, urlKey, description, primary }) => (
    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl transition-all hover:border-white/10 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-black uppercase italic tracking-tight text-white m-0">
            {label}
          </h3>
          <p className="text-white/40 text-xs font-medium mt-1">
            {description}
          </p>
        </div>
        {primary && (
          <div
            className="text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest"
            style={{ backgroundColor: `${accent}20`, color: accent }}
          >
            Live Now
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/5 p-2 pl-4 rounded-2xl group-hover:border-white/10 transition-all">
        <span className="flex-1 font-mono text-[11px] text-white/40 truncate">
          {url.replace(/^https?:\/\//, "")}
        </span>
        <button
          onClick={() => handleCopy(url, urlKey)}
          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer border-none transition-all active:scale-95"
          style={
            copied === urlKey
              ? { background: "#22c55e", color: "white" }
              : { background: "#1a1a1a", color: "white" }
          }
        >
          {copied === urlKey ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/10 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] blur-[120px] rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20 lg:py-32">
        {/* Success Header */}
        <div className="text-center mb-16">
          <div
            className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border rotate-12 transition-transform hover:rotate-0 duration-500"
            style={{ background: `${accent}10`, borderColor: `${accent}30` }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: accent }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                d="M20 6L9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="font-display text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
            System <br /> <span style={{ color: accent }}>Deployed.</span>
          </h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-[0.2em]">
            Welcome to the future of {name}
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 gap-4 mb-10">
          <LinkCard
            label="Customer Storefront"
            url={customerUrl}
            urlKey="customer"
            description="The digital interface where your guests will browse and order."
            primary
          />
          <LinkCard
            label="Kitchen Command"
            url={adminUrl}
            urlKey="admin"
            description="Your private dashboard to manage inventory and incoming orders."
          />
        </div>

        {/* Final CTA */}
        <div className="flex flex-col items-center gap-6">
          <Link
            to={`/${restaurantId}/admin`}
            className="w-full flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-xs py-6 rounded-full no-underline transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: accent,
              boxShadow: `0 20px 40px -10px ${accent}40`,
            }}
          >
            Open Dashboard
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <button
            onClick={() => window.print()}
            className="bg-transparent border-none text-white/20 hover:text-white/40 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors"
          >
            Print Setup Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
