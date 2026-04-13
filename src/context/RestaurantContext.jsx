import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

const RestaurantContext = createContext(null);

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ restaurantId, children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [suspended, setSuspended] = useState(false);

  // ── Theme state — persisted in localStorage ──
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("tableflow_theme") || "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("tableflow_theme", next);
      return next;
    });
  };

  // Apply theme class to body
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, [theme]);

  // Set CSS variable for accent color
  useEffect(() => {
    if (profile?.accentColor) {
      document.documentElement.style.setProperty(
        "--accent",
        profile.accentColor,
      );
    }
  }, [profile?.accentColor]);

  useEffect(() => {
    if (!restaurantId) return;
    const unsub = onSnapshot(
      doc(db, "restaurants", restaurantId, "profile", "info"),
      (snap) => {
        if (!snap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = snap.data();
        setSuspended(data.suspended || false);
        setProfile({ id: restaurantId, ...data });
        setLoading(false);
      },
    );
    return unsub;
  }, [restaurantId]);

  return (
    <RestaurantContext.Provider
      value={{
        profile,
        loading,
        notFound,
        suspended,
        restaurantId,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};
