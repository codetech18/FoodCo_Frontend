import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const SUPER_ADMIN_UID = import.meta.env.VITE_SUPER_ADMIN_UID;

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch(console.error);

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdmin(null);
        setRestaurantId(null);
        setAuthLoading(false);
        return;
      }

      // Super admin — set directly, no Firestore lookup needed
      if (user.uid === SUPER_ADMIN_UID) {
        setAdmin(user);
        setRestaurantId(null);
        setAuthLoading(false);
        return;
      }

      // Regular restaurant owner — look up their restaurantId
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setAdmin(user);
          setRestaurantId(userDoc.data().restaurantId);
        } else {
          // Auth account exists but no Firestore record — treat as logged out
          setAdmin(null);
          setRestaurantId(null);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setAdmin(null);
        setRestaurantId(null);
      }

      setAuthLoading(false);
    });

    return unsub;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ admin, restaurantId, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
