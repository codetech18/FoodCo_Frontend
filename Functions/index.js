const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp }  = require("firebase-admin/app");
const { getFirestore }   = require("firebase-admin/firestore");

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

      // Only manage subscriptions for pay-at-table restaurants
      if (profile.paymentMode !== "at_table") {
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
