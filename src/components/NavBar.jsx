import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const homeLinks = [
    { label: "Home", href: "#Home" },
    { label: "Deals", href: "#About" },
    { label: "Team", href: "#Team" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-0.5 group no-underline">
          <span className="font-display text-2xl font-black text-white tracking-tight group-hover:text-[#fa5631] transition-colors duration-300">FOOD</span>
          <span className="font-display text-2xl font-black text-[#fa5631] italic">co.</span>
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
              <span className={`absolute -bottom-1 left-0 h-px bg-[#fa5631] transition-all duration-300 ${isMenuPage ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          </li>
        </ul>

        <Link
          to="/menu"
          className="hidden md:inline-flex items-center gap-2 bg-[#fa5631] hover:bg-[#e04420] text-white text-sm font-semibold px-5 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95 no-underline"
        >
          Order Now
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        <button className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer bg-transparent border-none" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`w-6 h-0.5 bg-white block transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-6 h-0.5 bg-white block transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 bg-white block transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-72 border-b border-white/5" : "max-h-0"} bg-[#0a0a0a]/98 backdrop-blur-md`}>
        <ul className="px-6 py-4 flex flex-col gap-4 list-none">
          {homeLinks.map((link) => (
            <li key={link.label}>
              <button onClick={() => handleAnchor(link.href)} className="text-white/60 hover:text-[#fa5631] transition-colors font-medium text-sm bg-transparent border-none cursor-pointer">
                {link.label}
              </button>
            </li>
          ))}
          <li>
            <Link to="/menu" className="text-white/60 hover:text-[#fa5631] transition-colors font-medium text-sm no-underline" onClick={() => setMenuOpen(false)}>
              Menu & Order
            </Link>
          </li>
          <li>
            <Link to="/menu" className="inline-block bg-[#fa5631] text-white text-sm font-semibold px-5 py-2.5 no-underline" onClick={() => setMenuOpen(false)}>
              Order Now
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
