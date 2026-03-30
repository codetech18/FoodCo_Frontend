import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackInput, setTrackInput] = useState("");
  const [trackError, setTrackError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isMenuPage = location.pathname === "/menu";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAnchor = (href) => {
    setMenuOpen(false);
    if (isMenuPage) {
      navigate("/");
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
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
    navigate(`/track/${id}`);
  };

  const homeLinks = [
    { label: "Home", href: "#Home" },
    { label: "Deals", href: "#About" },
    { label: "Team", href: "#Team" },
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
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#fa5631] to-transparent" />
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
              Enter the Order ID you received after placing your order.
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
              className="w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/25 text-sm px-4 py-3 focus:outline-none focus:border-[#fa5631]/60 transition-colors mb-2"
            />
            {trackError && (
              <p className="text-red-400 text-xs mb-3">{trackError}</p>
            )}
            <button
              onClick={handleTrackSubmit}
              className="w-full bg-[#fa5631] hover:bg-[#e04420] text-white font-bold py-3 rounded-full transition-all cursor-pointer border-none mt-3"
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
          <Link to="/" className="flex items-center gap-0.5 group no-underline">
            <span className="font-display text-2xl font-black text-white tracking-tight group-hover:text-[#fa5631] transition-colors duration-300">
              FOOD
            </span>
            <span className="font-display text-2xl font-black text-[#fa5631] italic">
              co.
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-8 list-none">
            {homeLinks.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleAnchor(link.href)}
                  className="relative text-sm font-medium text-white/60 hover:text-white transition-colors duration-300 group bg-transparent border-none cursor-pointer"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#fa5631] group-hover:w-full transition-all duration-300" />
                </button>
              </li>
            ))}
            <li>
              <Link
                to="/menu"
                className={`relative text-sm font-medium transition-colors duration-300 group no-underline ${isMenuPage ? "text-[#fa5631]" : "text-white/60 hover:text-white"}`}
              >
                Menu
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-[#fa5631] transition-all duration-300 ${isMenuPage ? "w-full" : "w-0 group-hover:w-full"}`}
                />
              </Link>
            </li>
            <li>
              <button
                onClick={() => setShowTrackModal(true)}
                className="relative text-sm font-medium text-white/60 hover:text-white transition-colors duration-300 group bg-transparent border-none cursor-pointer"
              >
                Track Order
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#fa5631] group-hover:w-full transition-all duration-300" />
              </button>
            </li>
          </ul>

          <Link
            to="/menu"
            className="hidden md:inline-flex items-center gap-2 bg-[#fa5631] hover:bg-[#e04420] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 no-underline"
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

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-80 border-b border-white/5" : "max-h-0"} bg-[#0a0a0a]/98 backdrop-blur-md`}
        >
          <ul className="px-6 py-4 flex flex-col gap-4 list-none">
            {homeLinks.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleAnchor(link.href)}
                  className="text-white/60 hover:text-[#fa5631] transition-colors font-medium text-sm bg-transparent border-none cursor-pointer"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <Link
                to="/menu"
                className="text-white/60 hover:text-[#fa5631] transition-colors font-medium text-sm no-underline"
                onClick={() => setMenuOpen(false)}
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
                className="text-white/60 hover:text-[#fa5631] transition-colors font-medium text-sm bg-transparent border-none cursor-pointer"
              >
                Track Order
              </button>
            </li>
            <li>
              <Link
                to="/menu"
                className="inline-block bg-[#fa5631] text-white text-sm font-semibold px-5 py-2.5 rounded-full no-underline"
                onClick={() => setMenuOpen(false)}
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
