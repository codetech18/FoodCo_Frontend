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
    // Session only — clears when browser/tab closes
    setPersistence(auth, browserSessionPersistence).catch(console.error);

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        // Super admin has no users doc — skip the lookup
        if (user.uid !== SUPER_ADMIN_UID) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setRestaurantId(userDoc.data().restaurantId);
            }
          } catch (err) {
            console.error("Failed to fetch user doc:", err);
          }
        }
        setAdmin(user);
      } else {
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
