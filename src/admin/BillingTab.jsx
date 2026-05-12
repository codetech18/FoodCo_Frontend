import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { useRestaurant } from "../context/RestaurantContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
const toMillis = (ts) => {
  if (!ts) return null;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (ts.seconds) return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  return ts;
};

const daysLeft = (ts) => {
  const ms = toMillis(ts);
  if (!ms) return 0;
  return Math.max(0, Math.ceil((ms - Date.now()) / 86400000));
};

const fmtDate = (ts) => {
  const ms = toMillis(ts);
  if (!ms) return "N/A";
  return new Date(ms).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const PLAN_PRICES = { starter: 20000, pro: 40000 };
const PLAN_LABELS = { starter: "Starter", pro: "Pro" };

// ── Icons ─────────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const ReceiptIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const WarningIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const BillingTab = () => {
  const { profile, restaurantId, subscriptionStatus } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";

  const [billingHistory, setBillingHistory] = useState([]);

  useEffect(() => {
    if (!restaurantId) return;
    const unsub = onSnapshot(
      query(
        collection(db, "restaurants", restaurantId, "billing"),
        orderBy("date", "desc"),
      ),
      (snap) => setBillingHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return unsub;
  }, [restaurantId]);

  const isTrial   = subscriptionStatus === "trial";
  const isActive  = subscriptionStatus === "active";
  const isExpired = subscriptionStatus === "expired";

  const trialDaysLeft = daysLeft(profile?.trialEndsAt);
  const plan = profile?.plan || "starter";
  const monthlyFee = PLAN_PRICES[plan] || 20000;

  const pricingTiers = [
    {
      id: "free",
      name: "Free Trial",
      price: "₦0",
      features: [
        "7 days free — no card needed",
        "Full access to all features",
        "Menu management & QR codes",
        "Automatic on signup",
      ],
    },
    {
      id: "starter",
      name: "Starter",
      price: "₦20,000",
      features: [
        "Up to 300 orders/month",
        "Menu management",
        "QR code generation",
        "7-day & 30-day analytics",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "₦40,000",
      isPopular: true,
      features: [
        "Unlimited orders",
        "Full analytics + all-time view",
        "Table sessions & running bill",
        "Priority support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          Billing & Subscription
        </h1>

        {/* ── Current plan status ── */}
        <section
          className="relative overflow-hidden bg-[#111111] border rounded-[2rem] p-6 md:p-8"
          style={{
            borderColor: isActive ? `${accent}40` : isExpired ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.05)",
            boxShadow: isActive ? `0 0 40px ${accent}10` : "none",
          }}
        >
          {isActive && (
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] opacity-10 pointer-events-none"
              style={{ backgroundColor: accent }}
            />
          )}

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-white/50 uppercase tracking-widest">
                  Current Plan
                </span>
                <span
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border"
                  style={{ color: accent, background: `${accent}15`, borderColor: `${accent}30` }}
                >
                  {PLAN_LABELS[plan] || plan}
                </span>
              </div>

              <div className="space-y-1">
                {isTrial && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span className="font-display text-2xl font-black">
                      {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left
                    </span>
                    <span className="text-yellow-400/60 text-sm mt-1">on your free trial</span>
                  </div>
                )}
                {isActive && (
                  <div className="flex items-center gap-2" style={{ color: accent }}>
                    <CheckIcon />
                    <span className="font-display text-2xl font-black">Active</span>
                    <span className="text-white/50 text-sm mt-1 ml-2">
                      Renews on {fmtDate(profile?.subscriptionPaidUntil)}
                    </span>
                  </div>
                )}
                {isExpired && (
                  <div className="flex items-center gap-2 text-red-400">
                    <WarningIcon />
                    <span className="font-display text-2xl font-black">Expired</span>
                    <span className="text-red-400/60 text-sm mt-1 ml-2">
                      Your account has been restricted
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 min-w-[200px] space-y-3">
              <div>
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-1">
                  Payment Mode
                </span>
                <span className="text-sm font-semibold">
                  {profile?.paymentMode === "at_table" ? "Pay at Table" : "Pay Online"}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-1">
                  Monthly Fee
                </span>
                <span className="text-sm font-bold" style={{ color: accent }}>
                  ₦{monthlyFee.toLocaleString()}
                </span>
              </div>
              {isTrial && (
                <div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-1">
                    Trial Ends
                  </span>
                  <span className="text-sm">{fmtDate(profile?.trialEndsAt)}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Pricing cards ── */}
        <section>
          <h2 className="font-display text-2xl font-black mb-2">Subscription Plans</h2>
          <p className="text-white/30 text-sm mb-6">
            To switch plans, reach out via the contact options below.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => {
              const isCurrent =
                tier.id === "free" ? isTrial : plan === tier.id && !isTrial;
              return (
                <div
                  key={tier.id}
                  className={`relative flex flex-col bg-[#111111] rounded-[2rem] p-8 transition-all duration-300 ${tier.isPopular ? "md:-translate-y-2" : ""}`}
                  style={{
                    border: `1px solid ${isCurrent ? accent : "rgba(255,255,255,0.05)"}`,
                    boxShadow: isCurrent ? `0 0 20px ${accent}15` : "none",
                  }}
                >
                  {tier.isPopular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                      style={{ backgroundColor: accent, color: "#000" }}
                    >
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="font-display text-xl font-black uppercase tracking-tight mb-2">
                      {tier.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-sm font-medium text-white/40">
                        {tier.id === "free" ? " for 7 days" : "/month"}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                        <span style={{ color: accent }} className="mt-0.5 shrink-0">
                          <CheckIcon />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-center"
                    style={
                      isCurrent
                        ? { backgroundColor: accent, color: "#000" }
                        : { border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                    }
                  >
                    {isCurrent ? "Current Plan" : tier.name}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How to subscribe ── */}
        <section className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 md:p-10">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-black mb-2">
              How to subscribe or renew
            </h2>
            <p className="text-white/50 mb-8">
              We process payments manually to keep things simple and personal.
            </p>
            <ol className="space-y-6 mb-10">
              {[
                `Choose your plan and note the monthly amount (₦${monthlyFee.toLocaleString()} for ${PLAN_LABELS[plan]}).`,
                "Send your restaurant name and chosen plan to billing@servrr.ng — we'll reply with bank details within a few hours.",
                "Once payment is confirmed, your subscription will be activated within 2 hours.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-black"
                    style={{ backgroundColor: accent }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-white/80 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <a
                href={`mailto:billing@servrr.ng?subject=Subscription - ${profile?.name || ""}&body=Restaurant: ${profile?.name || ""}\nPlan: ${PLAN_LABELS[plan]}\nRestaurant ID: ${restaurantId}`}
                className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 transition-colors py-4 px-6 rounded-xl font-bold text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email billing@servrr.ng
              </a>
              <a
                href="https://wa.me/2349058977101"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] transition-colors py-4 px-6 rounded-xl font-bold text-sm text-black"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-start gap-3">
              <div className="text-yellow-500 shrink-0 mt-0.5">
                <WarningIcon />
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Please include your restaurant name (
                <strong className="text-white">{profile?.name}</strong>) and chosen plan in your message so we can process quickly.
              </p>
            </div>
          </div>
        </section>

        {/* ── Billing history ── */}
        <section>
          <h2 className="font-display text-2xl font-black mb-6">Billing History</h2>
          <div className="bg-[#111111] border border-white/5 rounded-[2rem] overflow-hidden">
            {billingHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="text-white/10 mb-4">
                  <ReceiptIcon />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">No payment history yet</h3>
                <p className="text-white/40 text-sm max-w-sm">
                  Your payments will appear here once confirmed by our team.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                <div className="hidden md:grid grid-cols-4 gap-4 p-6 bg-[#1a1a1a] text-xs font-bold uppercase tracking-widest text-white/40">
                  <div>Date</div><div>Plan</div><div>Amount</div><div>Status</div>
                </div>
                {billingHistory.map((inv) => (
                  <div
                    key={inv.id}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 items-center hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="text-sm font-medium">{fmtDate(inv.date)}</div>
                    <div className="text-sm capitalize">{PLAN_LABELS[inv.plan] || inv.plan}</div>
                    <div className="text-sm font-bold">₦{Number(inv.amount || 0).toLocaleString()}</div>
                    <div>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          inv.status === "paid"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : inv.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BillingTab;
