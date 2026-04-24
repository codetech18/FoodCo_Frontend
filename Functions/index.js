const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp }  = require("firebase-admin/app");
const { getFirestore, Timestamp }   = require("firebase-admin/firestore");

initializeApp();

/**
 * Runs every day at midnight Lagos time (UTC+1).
 * Checks all restaurants on at_table paymentMode and suspends
 * any whose subscriptionPaidUntil has passed and trial has ended.
 */
exports.checkSubscriptions = onSchedule(
  {
    schedule:  "0 0 * * *",   // midnight every day
    timeZone:  "Africa/Lagos",
    region:    "us-central1",
  },
  async () => {
    const db  = getFirestore();
    const now = new Date();

    console.log(`[checkSubscriptions] Running at ${now.toISOString()}`);

    // Get all restaurant profile docs
    // We query the restaurants collection and check each profile subcollection
    const usersSnap = await db.collection("users").get();

    let suspended = 0;
    let reactivated = 0;
    let skipped = 0;

    for (const userDoc of usersSnap.docs) {
      const { restaurantId } = userDoc.data();
      if (!restaurantId) continue;

      const profileRef  = db.doc(`restaurants/${restaurantId}/profile/info`);
      const profileSnap = await profileRef.get();
      if (!profileSnap.exists) continue;

      const profile = profileSnap.data();

      // Legacy merchants (no subscription fields) — grandfather as active, skip
      const isLegacy = !profile.trialEndsAt && !profile.subscriptionPaidUntil && !profile.plan;
      if (isLegacy) {
        skipped++;
        continue;
      }

      // Already manually suspended — leave it alone
      if (profile.suspended === true && profile.suspendedReason === "manual") {
        skipped++;
        continue;
      }

      const trialEndsAt = profile.trialEndsAt?.toDate?.() || null;
      const paidUntil   = profile.subscriptionPaidUntil?.toDate?.() || null;

      const inTrial = trialEndsAt && now < trialEndsAt;
      const isPaid  = paidUntil   && now < paidUntil;

      if (!inTrial && !isPaid) {
        // Subscription lapsed — suspend if not already
        if (!profile.suspended) {
          await profileRef.update({
            suspended:          true,
            suspendedReason:    "subscription_expired",
            suspendedAt:        now,
            subscriptionStatus: "expired",
          });
          console.log(`[SUSPENDED] ${restaurantId} — trial: ${trialEndsAt}, paid until: ${paidUntil}`);
          suspended++;
        }
      } else {
        // Active — reactivate if was auto-suspended
        if (profile.suspended && profile.suspendedReason === "subscription_expired") {
          await profileRef.update({
            suspended:          false,
            suspendedReason:    null,
            subscriptionStatus: isPaid ? "active" : "trial",
          });
          console.log(`[REACTIVATED] ${restaurantId}`);
          reactivated++;
        }
      }
    }

    console.log(`[checkSubscriptions] Done. Suspended: ${suspended}, Reactivated: ${reactivated}, Skipped: ${skipped}`);
  }
);

/**
 * Enforces the 20-item menu cap for Starter plan merchants.
 * Runs on every new menu document — deletes it if Starter plan already has 20+ items.
 */
exports.enforceMenuCap = onDocumentCreated(
  "restaurants/{restaurantId}/menu/{menuId}",
  async (event) => {
    const { restaurantId, menuId } = event.params;
    const db = getFirestore();

    const profileSnap = await db.doc(`restaurants/${restaurantId}/profile/info`).get();
    if (!profileSnap.exists) return;
    if (profileSnap.data().plan !== "starter") return;

    const menuSnap = await db.collection(`restaurants/${restaurantId}/menu`).get();
    if (menuSnap.size <= 20) return;

    await db.doc(`restaurants/${restaurantId}/menu/${menuId}`).delete();
    console.log(`[enforceMenuCap] Deleted ${menuId} for ${restaurantId} — exceeded 20-item cap (had ${menuSnap.size})`);
  }
);

/**
 * Enforces the 300 orders/month cap for Starter plan merchants.
 * Runs on every new order document — deletes it if cap is exceeded.
 */
exports.enforceOrderCap = onDocumentCreated(
  "restaurants/{restaurantId}/orders/{orderId}",
  async (event) => {
    const { restaurantId, orderId } = event.params;
    const db = getFirestore();

    const profileSnap = await db.doc(`restaurants/${restaurantId}/profile/info`).get();
    if (!profileSnap.exists) return;
    if (profileSnap.data().plan !== "starter") return;

    const now = new Date();
    const startOfMonth = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const ordersSnap = await db
      .collection(`restaurants/${restaurantId}/orders`)
      .where("createdAt", ">=", startOfMonth)
      .get();

    if (ordersSnap.size <= 300) return;

    await db.doc(`restaurants/${restaurantId}/orders/${orderId}`).delete();
    console.log(`[enforceOrderCap] Deleted ${orderId} for ${restaurantId} — exceeded 300/month cap (had ${ordersSnap.size})`);
  }
);
