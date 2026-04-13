import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useRestaurant } from "../context/RestaurantContext";

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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAnchor = (href) => {
    setMenuOpen(false);
    if (isMenuPage) {
      navigate(`/${restaurantId}`);
      setTimeout(
        () =>
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTrackSubmit = () => {
    const id = trackInput.trim();
    if (!id) return setTrackError("Please enter your Order ID.");
    setTrackError("");
    setShowTrackModal(false);
    setTrackInput("");
    navigate(`/${restaurantId}/track/${id}`);
  };

  const homeLinks = [
    { label: "Home", href: "#Home" },
    { label: "Deals", href: "#About" },
  ];

  return (
    <>
      {/* Track Order Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTrackModal(false)}
          />
          <div className="relative z-10 bg-[#111111] border border-white/10 w-full max-w-sm p-7 shadow-2xl">
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{
                background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
              }}
            />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">
                Track Your Order
              </h3>
              <button
                onClick={() => setShowTrackModal(false)}
                className="text-white/30 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-white/40 text-sm mb-4">
              Enter your Order ID to track your order.
            </p>
            <input
              type="text"
              placeholder="Paste your Order ID here"
              value={trackInput}
              onChange={(e) => {
                setTrackInput(e.target.value);
                setTrackError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleTrackSubmit()}
              className="w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/25 text-sm px-4 py-3 focus:outline-none transition-colors mb-2"
              style={{ outlineColor: accent }}
            />
            {trackError && (
              <p className="text-red-400 text-xs mb-3">{trackError}</p>
            )}
            <button
              onClick={handleTrackSubmit}
              className="w-full text-white font-bold py-3 rounded-full transition-all cursor-pointer border-none mt-3"
              style={{ background: accent }}
            >
              Track Order
            </button>
          </div>
        </div>
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            to={`/${restaurantId}`}
            className="flex items-center gap-2 no-underline group"
          >
            {profile?.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={profile.name}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span
                className="font-display text-2xl font-black text-white tracking-tight transition-colors"
                onMouseEnter={(e) => (e.target.style.color = accent)}
                onMouseLeave={(e) => (e.target.style.color = "white")}
              >
                {profile?.name || "FOODco"}
              </span>
            )}
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            {homeLinks.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleAnchor(link.href)}
                  className="relative text-sm font-medium text-white/60 hover:text-white transition-colors duration-300 group bg-transparent border-none cursor-pointer"
                >
                  {link.label}
                  <span
                    className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                    style={{ background: accent }}
                  />
                </button>
              </li>
            ))}
            <li>
              <Link
                to={`/${restaurantId}/menu`}
                className={`relative text-sm font-medium transition-colors duration-300 group no-underline`}
                style={{ color: isMenuPage ? accent : "r(255 255 255 / 0.6)" }}
                onMouseEnter={(e) => {
                  if (!isMenuPage) e.currentTarget.style.color = "black";
                }}
                onMouseLeave={(e) => {
                  if (!isMenuPage)
                    e.currentTarget.style.color = "(255 255 255 / 0.6)";
                }}
              >
                Menu
                <span
                  className={`absolute -bottom-1 left-0 h-px transition-all duration-300 ${isMenuPage ? "w-full" : "w-0 group-hover:w-full"}`}
                  style={{ background: accent }}
                />
              </Link>
            </li>
            <li>
              <button
                onClick={() => setShowTrackModal(true)}
                className="relative text-sm font-medium text-white/60 hover:text-white transition-colors duration-300 group bg-transparent border-none cursor-pointer"
              >
                Track Order
                <span
                  className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                  style={{ background: accent }}
                />
              </button>
            </li>
          </ul>

          {/* CTA */}
          <Link
            to={`/${restaurantId}/menu`}
            className="hidden md:inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 no-underline"
            style={{ background: accent }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Order Now
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="hidden md:flex w-9 h-9 items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all cursor-pointer bg-transparent rounded-full"
          >
            {theme === "dark" ? (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          {/* Mobile burger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer bg-transparent border-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span
              className={`w-6 h-0.5 bg-white block transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`w-6 h-0.5 bg-white block transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`w-6 h-0.5 bg-white block transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-80 border-b border-white/5" : "max-h-0"} bg-[#0a0a0a]/98 backdrop-blur-md`}
        >
          <ul className="px-6 py-4 flex flex-col gap-4 list-none">
            {homeLinks.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleAnchor(link.href)}
                  className="text-white/60 transition-colors font-medium text-sm bg-transparent border-none cursor-pointer"
                  onMouseEnter={(e) => (e.target.style.color = accent)}
                  onMouseLeave={(e) =>
                    (e.target.style.color = "rgba(255,255,255,0.6)")
                  }
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <Link
                to={`/${restaurantId}/menu`}
                className="text-white/60 transition-colors font-medium text-sm no-underline"
                onClick={() => setMenuOpen(false)}
                onMouseEnter={(e) => (e.target.style.color = accent)}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255,255,255,0.6)")
                }
              >
                Menu
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowTrackModal(true);
                }}
                className="text-white/60 transition-colors font-medium text-sm bg-transparent border-none cursor-pointer"
                onMouseEnter={(e) => (e.target.style.color = accent)}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255,255,255,0.6)")
                }
              >
                Track Order
              </button>
            </li>
            <li>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-white/60 transition-colors font-medium text-sm bg-transparent border-none cursor-pointer"
                onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
                }
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </li>
            <li>
              <Link
                to={`/${restaurantId}/menu`}
                className="inline-block text-white text-sm font-semibold px-5 py-2.5 rounded-full no-underline"
                onClick={() => setMenuOpen(false)}
                style={{ background: accent }}
              >
                Order Now
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
