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
    // Keep session active only while the tab/browser is open
    setPersistence(auth, browserSessionPersistence).catch(console.error);

    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true); // Re-enter loading state on change

      if (user && user.emailVerified) {
        // 1. Handle Super Admin (No Firestore doc needed)
        if (user.uid === SUPER_ADMIN_UID) {
          setAdmin(user);
          setRestaurantId("superadmin");
        } else {
          // 2. Handle Regular Owner (Must fetch Restaurant ID)
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setRestaurantId(userDoc.data().restaurantId);
              setAdmin(user);
            } else {
              // User exists in Auth but not in Firestore 'users'
              setAdmin(null);
              setRestaurantId(null);
            }
          } catch (err) {
            console.error("AuthContext Error:", err);
            setAdmin(null);
            setRestaurantId(null);
          }
        }
      } else {
        // 3. Logged out or unverified
        setAdmin(null);
        setRestaurantId(null);
      }

      setAuthLoading(false);
    });

    return unsub;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setAdmin(null);
    setRestaurantId(null);
  };

  return (
    <AuthContext.Provider value={{ admin, restaurantId, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
