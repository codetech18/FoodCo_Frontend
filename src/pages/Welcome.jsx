import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../admin/AuthContext";

const Welcome = () => {
  const { admin, restaurantId } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState("");

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const customerUrl = `${baseUrl}/${restaurantId}`;
  const adminUrl    = `${baseUrl}/${restaurantId}/admin`;

  useEffect(() => {
    if (!restaurantId) return;
    getDoc(doc(db, "restaurants", restaurantId, "profile", "info"))
      .then(snap => { if (snap.exists()) setProfile(snap.data()); });
  }, [restaurantId]);

  const accent = profile?.accentColor || "#fa5631";
  const name   = profile?.name        || restaurantId;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const LinkCard = ({ label, url, urlKey, description, primary }) => (
    <div className="bg-[#111111] border border-white/5 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-white font-bold text-sm mb-0.5">{label}</p>
          <p className="text-white/30 text-xs">{description}</p>
        </div>
        {primary && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${accent}26`, color: accent }}>
            SHARE THIS
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 px-3 py-2.5">
        <span className="flex-1 font-mono text-xs text-white/60 truncate">{url}</span>
        <button onClick={() => handleCopy(url, urlKey)}
          className="text-[10px] font-semibold px-2.5 py-1 border transition-all cursor-pointer flex-shrink-0"
          style={copied === urlKey
            ? { background: "rgba(34,197,94,0.15)", borderColor: "rgba(34,197,94,0.3)", color: "#4ade80" }
            : { background: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
          {copied === urlKey ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="mt-2 flex items-center gap-1.5 text-xs no-underline transition-colors"
        style={{ color: `${accent}99` }}
        onMouseEnter={e => e.currentTarget.style.color = accent}
        onMouseLeave={e => e.currentTarget.style.color = `${accent}99`}>
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
        Open in new tab
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border"
            style={{ background: `${accent}20`, borderColor: `${accent}40` }}>
            <svg className="w-10 h-10" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="font-display text-4xl font-black text-white mb-2">
            You're live, {name}! 🎉
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Your restaurant is set up and ready to take orders.
            Share your customer page link with your guests.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-3 mb-8">
          <LinkCard
            label="Customer Page"
            url={customerUrl}
            urlKey="customer"
            description="Share this with your customers — they browse the menu and place orders here."
            primary
          />
          <LinkCard
            label="Admin Dashboard"
            url={adminUrl}
            urlKey="admin"
            description="Your private dashboard to manage orders, menu, and analytics."
          />
        </div>

        {/* Next steps */}
        <div className="bg-[#111111] border border-white/5 p-5 mb-6">
          <p className="text-white font-bold text-sm mb-4">Next steps</p>
          <div className="space-y-3">
            {[
              { num: 1, text: "Add your menu items in the admin dashboard", link: `/${restaurantId}/admin`, linkText: "Go to Menu tab →" },
              { num: 2, text: "Download your QR code and place it on tables", link: `/${restaurantId}/admin`, linkText: "Go to QR Codes tab →" },
              { num: 3, text: "Share your customer page link with guests", link: null },
            ].map(({ num, text, link, linkText }) => (
              <div key={num} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: accent }}>
                  {num}
                </div>
                <div>
                  <p className="text-white/60 text-sm">{text}</p>
                  {link && (
                    <Link to={link} className="text-xs font-semibold no-underline mt-0.5 inline-block"
                      style={{ color: accent }}>
                      {linkText}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link to={`/${restaurantId}/admin`}
          className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-full no-underline transition-all hover:opacity-85"
          style={{ background: accent }}>
          Go to Dashboard
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
