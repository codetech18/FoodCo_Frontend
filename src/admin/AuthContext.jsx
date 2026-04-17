import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch(console.error);

    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        // We fetch the ID from Firestore, NOT the URL, to prevent spoofing
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Loophole Fix: If user isn't verified, we still let context know who they are
            // so the UI can show a "Verify your Email" screen instead of just a blank login.
            setAdmin(user);
            setRestaurantId(data.restaurantId);
          }
        } catch (err) {
          console.error("Auth sync error", err);
        }
      } else {
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
