import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useRestaurant } from "../context/RestaurantContext";
import {
  Search,
  Menu as MenuIcon,
  X,
  Moon,
  Sun,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackInput, setTrackInput] = useState("");
  const [trackError, setTrackError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantId } = useParams();
  const { profile, theme, toggleTheme } = useRestaurant();

  const isMenuPage = location.pathname === `/${restaurantId}/menu`;
  const accent = profile?.accentColor || "#fa5631";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAnchor = (href) => {
    setMenuOpen(false);
    if (isMenuPage) {
      navigate(`/${restaurantId}`);
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTrackSubmit = () => {
    const id = trackInput.trim();
    if (!id) return setTrackError("Order ID required.");
    setTrackError("");
    setShowTrackModal(false);
    setTrackInput("");
    navigate(`/${restaurantId}/track/${id}`);
  };

  return (
    <>
      {/* --- TRACK ORDER MODAL --- */}
      {showTrackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <div className="bg-[#111] border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: accent }}
            />

            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                Locate Order
              </h3>
              <button
                onClick={() => setShowTrackModal(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} className="text-white/40" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                  Unique Order ID
                </label>
                <input
                  type="text"
                  placeholder="SR-XXXXX"
                  value={trackInput}
                  onChange={(e) => {
                    setTrackInput(e.target.value);
                    setTrackError("");
                  }}
                  className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-white/20 transition-all font-mono"
                />
                {trackError && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-wider">
                    {trackError}
                  </p>
                )}
              </div>

              <button
                onClick={handleTrackSubmit}
                className="w-full py-5 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-transform active:scale-95"
                style={{ background: accent }}
              >
                Track Now <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN NAVIGATION --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-6 pointer-events-none">
        <nav
          className={`
            pointer-events-auto flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${
              scrolled
                ? "w-full max-w-2xl bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl"
                : "w-full max-w-7xl bg-transparent px-2 py-4"
            }
          `}
        >
          {/* Logo */}
          <Link
            to={`/${restaurantId}`}
            className="flex items-center gap-3 pl-4 group no-underline"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12"
              style={{ background: accent }}
            >
              <ShoppingBag size={18} className="text-black" strokeWidth={3} />
            </div>
            <span
              className={`font-black tracking-tighter uppercase italic text-xl ${scrolled ? "hidden sm:block" : "block"}`}
            >
              {profile?.name || "SERVRR"}
            </span>
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-1 list-none">
            {[
              { label: "Deals", onClick: () => handleAnchor("#About") },
              { label: "Track", onClick: () => setShowTrackModal(true) },
            ].map((link) => (
              <li key={link.label}>
                <button
                  onClick={link.onClick}
                  className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  {link.label}
                </button>
              </li>
            ))}

            <li>
              <Link
                to={`/${restaurantId}/menu`}
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-colors no-underline ${isMenuPage ? "text-white" : "text-white/40"}`}
                style={{ color: isMenuPage ? accent : "" }}
              >
                Menu
              </Link>
            </li>
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-white/40" />
              ) : (
                <Moon size={18} className="text-white/40" />
              )}
            </button>

            <Link
              to={`/${restaurantId}/menu`}
              className="px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 no-underline flex items-center gap-2"
              style={{
                background: scrolled ? "white" : accent,
                color: scrolled ? "black" : "white",
              }}
            >
              Order <span className="hidden sm:inline">Now</span>
            </Link>

            {/* Mobile Toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 cursor-pointer border-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      <div
        className={`
        fixed inset-0 z-40 bg-black transition-transform duration-500 md:hidden
        ${menuOpen ? "translate-y-0" : "-translate-y-full"}
      `}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {["Home", "Deals"].map((label) => (
            <button
              key={label}
              onClick={() =>
                handleAnchor(`#${label === "Home" ? "Home" : "About"}`)
              }
              className="text-4xl font-black uppercase italic tracking-tighter text-white/20 hover:text-white transition-colors bg-transparent border-none"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              setShowTrackModal(true);
            }}
            className="text-4xl font-black uppercase italic tracking-tighter text-white/20 hover:text-white transition-colors bg-transparent border-none"
          >
            Track
          </button>
          <Link
            to={`/${restaurantId}/menu`}
            onClick={() => setMenuOpen(false)}
            className="mt-8 px-10 py-5 rounded-full font-black uppercase tracking-widest no-underline"
            style={{ background: accent }}
          >
            View Menu
          </Link>
        </div>
      </div>
    </>
  );
};

export default NavBar;
