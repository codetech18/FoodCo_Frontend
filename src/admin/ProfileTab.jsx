import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useRestaurant } from "../context/RestaurantContext";
import { useParams } from "react-router-dom";

const ProfileTab = () => {
  const { restaurantId } = useParams();
  const { profile, theme, toggleTheme } = useRestaurant();

  const accent = profile?.accentColor || "#fa5631";
  const inputCls =
    "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 text-sm px-3 py-2.5 focus:outline-none transition-colors";
  const labelCls =
    "block text-white/40 text-[10px] font-semibold tracking-widets uppercase mb-1.5";

  const [form, setForm] = useState({
    dealTitle: profile?.dealTitle || "Deal Of The Day",
    dealItem: profile?.dealItem || "",
    dealFreeItem: profile?.dealFreeItem || "",
    dealDesc: profile?.dealDesc || "",
    dealBadge: profile?.dealBadge || "NEW!",
    dealTag: profile?.dealTag || "Limited Time",
    stat1Value: profile?.stat1Value || "200+",
    stat1Label: profile?.stat1Label || "Menu Items",
    stat2Value: profile?.stat2Value || "5K+",
    stat2Label: profile?.stat2Label || "Happy Customers",
    stat3Value: profile?.stat3Value || "4.9★",
    stat3Label: profile?.stat3Label || "Rating",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(
        doc(db, "restaurants", restaurantId, "profile", "info"),
        {
          ...form,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to save. Try again.");
    }
    setSaving(false);
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
    onFocus: (e) => (e.target.style.borderColor = `${accent}99`),
    onBlur: (e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)"),
  });

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-8">
      {/* ── Restaurant info (read-only) ── */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-1">Restaurant Info</h3>
        <p className="text-white/30 text-xs mb-5">
          Branding, contact details and location were set during signup. Contact
          support to change these.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Restaurant Name</label>
            <div className="bg-[#1a1a1a] border border-white/5 px-3 py-2.5 text-white/40 text-sm">
              {profile?.name || "—"}
            </div>
          </div>
          <div>
            <label className={labelCls}>Slug / URL</label>
            <div className="bg-[#1a1a1a] border border-white/5 px-3 py-2.5 text-white/40 text-sm font-mono">
              /{restaurantId}
            </div>
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <div className="bg-[#1a1a1a] border border-white/5 px-3 py-2.5 text-white/40 text-sm">
              {profile?.contactEmail || "—"}
            </div>
          </div>
          <div>
            <label className={labelCls}>Brand Colour</label>
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/5 px-3 py-2.5">
              <div
                className="w-4 h-4 rounded-full border border-white/10"
                style={{ background: accent }}
              />
              <span className="text-white/40 text-sm font-mono">{accent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Deal of the Day ── */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Deal of the Day
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Deal Section Title</label>
            <input
              type="text"
              placeholder="Deal Of The Day"
              className={inputCls}
              {...f("dealTitle")}
            />
          </div>
          <div>
            <label className={labelCls}>Badge Text</label>
            <input
              type="text"
              placeholder="NEW!"
              className={inputCls}
              {...f("dealBadge")}
            />
          </div>
          <div>
            <label className={labelCls}>Featured Item</label>
            <input
              type="text"
              placeholder="e.g. Ramen Noodles"
              className={inputCls}
              {...f("dealItem")}
            />
          </div>
          <div>
            <label className={labelCls}>Free Item with Deal</label>
            <input
              type="text"
              placeholder="e.g. Yogurt Smoothie"
              className={inputCls}
              {...f("dealFreeItem")}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Deal Description</label>
            <textarea
              rows={3}
              placeholder="Describe this deal..."
              className={inputCls + " resize-none"}
              {...f("dealDesc")}
            />
          </div>
          <div>
            <label className={labelCls}>Tag Label</label>
            <input
              type="text"
              placeholder="Limited Time"
              className={inputCls}
              {...f("dealTag")}
            />
          </div>
        </div>
      </div>

      {/* ── Hero Stats ── */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Hero Stats
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-2">
              <div>
                <label className={labelCls}>Stat {n} Value</label>
                <input
                  type="text"
                  placeholder="e.g. 200+"
                  className={inputCls}
                  {...f(`stat${n}Value`)}
                />
              </div>
              <div>
                <label className={labelCls}>Stat {n} Label</label>
                <input
                  type="text"
                  placeholder="e.g. Menu Items"
                  className={inputCls}
                  {...f(`stat${n}Label`)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Theme ── */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Display Theme
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium mb-1">
              {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </p>
            <p className="text-white/30 text-xs">
              {theme === "dark"
                ? "Dark background — easier on the eyes at night."
                : "Light background — bright and clean."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-all cursor-pointer border-none flex-shrink-0"
            style={{
              background: theme === "light" ? accent : "rgba(255,255,255,0.15)",
            }}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
                theme === "light" ? "left-7" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save */}
      <button
        type="submit"
        disabled={saving}
        className="w-full disabled:opacity-50 text-white font-bold py-4 rounded-full transition-all cursor-pointer border-none flex items-center justify-center gap-2"
        style={{ background: accent }}
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
            </svg>
            Saved!
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
};

export default ProfileTab;
