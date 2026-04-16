import React, { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

const Welcome = () => {
  const { admin, restaurantId, authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState("");

  // Redirect if auth is finished but no user is found
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate("/login");
    }
  }, [authLoading, admin, navigate]);

  // Fetch restaurant details once we have the ID
  useEffect(() => {
    if (!restaurantId || restaurantId === "superadmin") return;

    getDoc(doc(db, "restaurants", restaurantId, "profile", "info")).then(
      (snap) => {
        if (snap.exists()) setProfile(snap.data());
      },
    );
  }, [restaurantId]);

  // STOPS BROKEN LINKS: Wait for Auth and RestaurantID to be ready
  if (authLoading || (!restaurantId && admin)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/5 border-t-[#fa5631] rounded-full animate-spin" />
      </div>
    );
  }

  // Safety fallback if something goes wrong
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
    <div className="bg-[#111111] border border-white/5 p-5 rounded-xl">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-white font-bold text-sm mb-0.5">{label}</p>
          <p className="text-white/30 text-xs">{description}</p>
        </div>
        {primary && (
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${accent}26`, color: accent }}
          >
            SHARE THIS
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 px-3 py-2.5 rounded-lg">
        <span className="flex-1 font-mono text-xs text-white/60 truncate">
          {url}
        </span>
        <button
          onClick={() => handleCopy(url, urlKey)}
          className="text-[10px] font-semibold px-2.5 py-1 border transition-all cursor-pointer flex-shrink-0 rounded"
          style={
            copied === urlKey
              ? {
                  background: "rgba(34,197,94,0.15)",
                  borderColor: "rgba(34,197,94,0.3)",
                  color: "#4ade80",
                }
              : {
                  background: "transparent",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                }
          }
        >
          {copied === urlKey ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border"
            style={{ background: `${accent}20`, borderColor: `${accent}40` }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: accent }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M20 6L9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
            You're live, {name}!
          </h1>
          <p className="text-white/40 text-sm">
            Your dashboard and customer menu are ready.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <LinkCard
            label="Customer Menu"
            url={customerUrl}
            urlKey="customer"
            description="Give this URL to your guests so they can order."
            primary
          />
          <LinkCard
            label="Admin Dashboard"
            url={adminUrl}
            urlKey="admin"
            description="Manage your orders and menu items here."
          />
        </div>

        <Link
          to={`/${restaurantId}/admin`}
          className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-full no-underline transition-all hover:opacity-85 shadow-lg"
          style={{ background: accent, boxShadow: `0 10px 30px ${accent}33` }}
        >
          Go to Dashboard
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
      </div>
    </div>
  );
};

export default Welcome;
