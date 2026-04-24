import React, { useState, useEffect } from "react";
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
    paymentMode: profile?.paymentMode || "at_table",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [banks, setBanks] = useState([
    { name: "Access Bank", code: "044" },
    { name: "Ecobank", code: "050" },
    { name: "Fidelity Bank", code: "070" },
    { name: "First Bank", code: "011" },
    { name: "FCMB", code: "214" },
    { name: "GTBank", code: "058" },
    { name: "Heritage Bank", code: "030" },
    { name: "Keystone Bank", code: "082" },
    { name: "Kuda Bank", code: "50211" },
    { name: "Moniepoint MFB", code: "50515" },
    { name: "Polaris Bank", code: "076" },
    { name: "Providus Bank", code: "101" },
    { name: "Stanbic IBTC Bank", code: "039" },
    { name: "Sterling Bank", code: "232" },
    { name: "UBA", code: "033" },
    { name: "Union Bank", code: "032" },
    { name: "Unity Bank", code: "215" },
    { name: "Wema Bank", code: "035" },
    { name: "Zenith Bank", code: "057" },
  ]);

  useEffect(() => {
    fetch("https://foodco-backend.onrender.com/banks")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && data.length > 0 && setBanks(data))
      .catch(() => {});
  }, []);

  // ── Bank account setup state (separate from main form) ──
  const [bankForm, setBankForm] = useState({ bankCode: "", accountNumber: "" });
  const [resolvedName, setResolvedName] = useState(null);
  const [bankVerifying, setBankVerifying] = useState(false);
  const [bankConnecting, setBankConnecting] = useState(false);
  const [bankError, setBankError] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);

  const isConnected = !!profile?.paystackSubaccountCode;

  const handleVerifyAccount = async () => {
    if (!bankForm.bankCode || bankForm.accountNumber.length < 10) {
      return setBankError("Select a bank and enter a 10-digit account number.");
    }
    setBankVerifying(true);
    setBankError(null);
    setResolvedName(null);
    try {
      const res = await fetch(
        `https://foodco-backend.onrender.com/resolve-account?account_number=${bankForm.accountNumber}&bank_code=${bankForm.bankCode}`,
      );
      const data = await res.json();
      if (data.accountName) {
        setResolvedName(data.accountName);
      } else {
        setBankError(data.error || "Account not found. Check the number and bank.");
      }
    } catch {
      setBankError("Could not reach server. Try again.");
    } finally {
      setBankVerifying(false);
    }
  };

  const handleConnectAccount = async () => {
    if (!resolvedName) return;
    setBankConnecting(true);
    setBankError(null);
    try {
      const res = await fetch("https://foodco-backend.onrender.com/create-subaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: profile?.name || resolvedName,
          bankCode: bankForm.bankCode,
          accountNumber: bankForm.accountNumber,
        }),
      });
      const data = await res.json();
      if (data.subaccountCode) {
        const bankLabel = banks.find((b) => b.code === bankForm.bankCode)?.name || bankForm.bankCode;
        await setDoc(
          doc(db, "restaurants", restaurantId, "profile", "info"),
          {
            paystackSubaccountCode: data.subaccountCode,
            bankName: bankLabel,
            accountName: resolvedName,
            accountNumberLast4: bankForm.accountNumber.slice(-4),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        setShowBankForm(false);
        setBankForm({ bankCode: "", accountNumber: "" });
        setResolvedName(null);
      } else {
        setBankError(data.error || "Failed to connect account. Try again.");
      }
    } catch {
      setBankError("Could not reach server. Try again.");
    } finally {
      setBankConnecting(false);
    }
  };

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

      {/* ── Payment Settings ── */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-1">Payment Settings</h3>
        <p className="text-white/30 text-xs mb-5">
          Choose how customers pay for their orders.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {[
            {
              value: "at_table",
              title: "Pay at Table",
              desc: "Customers order first, staff collects payment in person.",
            },
            {
              value: "pay_online",
              title: "Pay Before Order",
              desc: "Customers pay via Paystack before order is confirmed.",
            },
          ].map((opt) => {
            const selected = form.paymentMode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, paymentMode: opt.value }))
                }
                className="text-left p-4 border transition-all cursor-pointer bg-transparent"
                style={{
                  borderColor: selected ? `${accent}60` : "rgba(255,255,255,0.08)",
                  background: selected ? `${accent}10` : "transparent",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: selected ? accent : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {selected && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: accent }}
                      />
                    )}
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: selected ? accent : "rgba(255,255,255,0.7)" }}
                  >
                    {opt.title}
                  </span>
                </div>
                <p className="text-white/30 text-xs pl-5">{opt.desc}</p>
              </button>
            );
          })}
        </div>

        {form.paymentMode === "pay_online" && (
          <div className="mt-2">
            <p className="text-white/40 text-xs mb-4">
              Connect your bank account so customers can pay online and funds are deposited directly into your account.
            </p>

            {isConnected && !showBankForm ? (
              <div
                className="p-4 border flex items-start justify-between gap-4"
                style={{ borderColor: `${accent}33`, background: `${accent}0a` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}20` }}
                  >
                    <svg className="w-4 h-4" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{profile?.accountName}</p>
                    <p className="text-white/40 text-xs">{profile?.bankName} · ****{profile?.accountNumberLast4}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBankForm(true)}
                  className="text-white/30 hover:text-white/70 text-xs transition-colors cursor-pointer bg-transparent border-none flex-shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Bank</label>
                  <select
                    className={inputCls + " cursor-pointer"}
                    value={bankForm.bankCode}
                    onChange={(e) => {
                      setBankForm((p) => ({ ...p, bankCode: e.target.value }));
                      setResolvedName(null);
                      setBankError(null);
                    }}
                    onFocus={(e) => (e.target.style.borderColor = `${accent}99`)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    style={{ appearance: "none" }}
                  >
                    <option value="">Select your bank</option>
                    {banks.map((b) => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Account Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="0000000000"
                      className={inputCls}
                      value={bankForm.accountNumber}
                      onChange={(e) => {
                        setBankForm((p) => ({ ...p, accountNumber: e.target.value.replace(/\D/g, "") }));
                        setResolvedName(null);
                        setBankError(null);
                      }}
                      onFocus={(e) => (e.target.style.borderColor = `${accent}99`)}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAccount}
                      disabled={bankVerifying}
                      className="px-4 text-sm font-semibold border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all cursor-pointer bg-transparent disabled:opacity-40 flex-shrink-0"
                    >
                      {bankVerifying ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                      ) : "Verify"}
                    </button>
                  </div>
                </div>

                {bankError && (
                  <p className="text-red-400 text-xs">{bankError}</p>
                )}

                {resolvedName && (
                  <div className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.03]">
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Account Name</p>
                      <p className="text-white text-sm font-semibold">{resolvedName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleConnectAccount}
                      disabled={bankConnecting}
                      className="px-4 py-2 text-sm font-bold text-white transition-all cursor-pointer border-none disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                      style={{ background: accent }}
                    >
                      {bankConnecting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : "Connect Account"}
                    </button>
                  </div>
                )}

                {isConnected && (
                  <button
                    type="button"
                    onClick={() => { setShowBankForm(false); setBankForm({ bankCode: "", accountNumber: "" }); setResolvedName(null); setBankError(null); }}
                    className="text-white/30 hover:text-white/60 text-xs transition-colors cursor-pointer bg-transparent border-none"
                  >
                    ← Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        )}
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
