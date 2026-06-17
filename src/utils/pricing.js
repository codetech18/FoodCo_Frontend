export const PRICING = {
  growth: { monthly: 20000, yearly: 18000 },
  pro:    { monthly: 40000, yearly: 36000 },
};

export const PLAN_LABELS = { growth: "Growth", pro: "Pro" };

// "starter" was the old key for the growth plan; normalize it everywhere.
export const normalizePlan = (plan) =>
  plan === "starter" ? "growth" : (plan || "growth");

export const getBillingDetails = (plan, cycle) => {
  const p = normalizePlan(plan);
  const c = cycle === "yearly" ? "yearly" : "monthly";
  const monthlyFee = PRICING[p]?.[c] ?? PRICING.growth.monthly;
  const billingAmountPaid = c === "yearly" ? monthlyFee * 12 : monthlyFee;
  return { monthlyFee, billingAmountPaid };
};
