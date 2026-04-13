import { useEffect } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase/config";

const RESTAURANT_ID = "foodco";

const Migrate = () => {
  useEffect(() => {
    const run = async () => {
      console.log("Starting migration...");

      // 1. Create restaurant profile
      await setDoc(doc(db, "restaurants", RESTAURANT_ID, "profile", "info"), {
        name: "FOODco",
        tagline: "Culinary delights, delivered.",
        accentColor: "#fa5631",
        logoUrl: "",
        address: "Abuja, Nigeria",
        createdAt: serverTimestamp(),
      });
      console.log("✅ Profile created");

      // 2. Migrate menu
      const menuSnap = await getDocs(collection(db, "menu"));
      for (const d of menuSnap.docs) {
        await setDoc(
          doc(db, "restaurants", RESTAURANT_ID, "menu", d.id),
          d.data(),
        );
      }
      console.log(`✅ Migrated ${menuSnap.size} menu items`);

      // 3. Migrate orders
      const ordersSnap = await getDocs(collection(db, "orders"));
      for (const d of ordersSnap.docs) {
        await setDoc(
          doc(db, "restaurants", RESTAURANT_ID, "orders", d.id),
          d.data(),
        );
      }
      console.log(`✅ Migrated ${ordersSnap.size} orders`);

      console.log("🎉 Done! Check your Firebase console.");
    };

    run();
  }, []);

  return (
    <div
      style={{
        padding: 40,
        color: "white",
        background: "#0a0a0a",
        minHeight: "100vh",
      }}
    >
      <h2>Running migration... check the browser console for progress.</h2>
    </div>
  );
};

export default Migrate;
