import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// --- Custom SVG Icons to keep zero dependencies ---
const Icons = {
  Menu: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  X: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  QR: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M6 6h1v1H6zM17 6h1v1h-1zM17 17h1v1h-1zM6 17h1v1H6z" />
    </svg>
  ),
  Dashboard: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
  Palette: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" />
      <circle cx="17.5" cy="10.5" r=".5" />
      <circle cx="8.5" cy="7.5" r=".5" />
      <circle cx="6.5" cy="12.5" r=".5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Chart: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#fa5631] selection:text-black overflow-x-hidden">
      {/* --- Ambient Background --- */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#fa5631] opacity-10 blur-[150px] rounded-full pointer-events-none" />

      {/* --- Navbar --- */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link
            to="/"
            className="font-display font-black text-2xl tracking-tight flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-[#fa5631] rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span className="text-[#0a0a0a] font-black text-lg">S</span>
            </div>
            SERVRR
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="/pricing"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Pricing
            </a>

            <Link
              to="/support"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Support
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/login"
              className="text-sm font-bold text-white hover:text-[#fa5631] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/support#contact"
              className="text-sm font-bold bg-white text-black px-6 py-2.5 rounded-full hover:bg-[#fa5631] hover:text-white transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Get Invite
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-white/5 overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-96 py-6" : "max-h-0"}`}
        >
          <div className="flex flex-col px-6 gap-6">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-white/80"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-white/80"
            >
              Pricing
            </a>
            <Link
              to="/billing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-white/80"
            >
              Billing Dashboard
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-white/80"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold bg-[#fa5631] text-white text-center py-3 rounded-xl mt-2"
            >
              Get Invite
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 pt-40 pb-20 lg:pt-52 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* Hero Copy */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 mb-8 uppercase tracking-widest backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#fa5631] animate-pulse" />
              Built for the African Table
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-[5rem] font-black leading-[1.05] tracking-tight mb-6">
              Your menu. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                Your brand.
              </span>
              <br />
              <span className="text-[#fa5631]">Online in minutes.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-lg mb-10 leading-relaxed font-light">
              The complete digital ordering system designed specifically for
              forward-thinking Nigerian restaurants. No apps. No friction. Just
              orders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/support#contact"
                className="group flex items-center justify-center gap-2 bg-[#fa5631] text-white font-bold text-lg px-8 py-4 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(250,86,49,0.3)]"
              >
                Request an Invite
                <Icons.ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center justify-center px-8 py-4 rounded-full bg-white/5 text-white font-bold text-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Hero Visual (CSS Abstract UI) */}
          <div className="relative h-[400px] md:h-[500px] w-full flex justify-center items-center perspective-1000">
            {/* Dashboard Mockup (Back) */}
            <div className="absolute right-0 top-10 w-3/4 h-[350px] bg-[#111] rounded-2xl border border-white/10 shadow-2xl p-6 transform rotate-y-[-10deg] rotate-x-[5deg] translate-x-4 opacity-80 transition-transform duration-700 hover:rotate-y-0">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="w-24 h-4 bg-white/10 rounded-full" />
                <div className="w-8 h-8 rounded-full bg-[#fa5631]/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#fa5631]" />
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded bg-white/10" />
                      <div className="space-y-2">
                        <div className="w-20 h-2.5 bg-white/20 rounded" />
                        <div className="w-12 h-2 bg-white/10 rounded" />
                      </div>
                    </div>
                    <div className="w-16 h-4 bg-[#fa5631]/50 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Mockup (Front) */}
            <div className="absolute left-4 sm:left-10 bottom-0 w-[240px] h-[480px] bg-black border-[6px] border-[#222] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transform rotate-y-[15deg] rotate-x-[5deg] transition-transform duration-700 hover:-translate-y-4">
              <div className="absolute top-0 inset-x-0 h-6 bg-black z-20 flex justify-center">
                <div className="w-20 h-4 bg-[#222] rounded-b-xl" />
              </div>
              <div className="w-full h-full bg-[#0a0a0a] relative p-4 pt-10">
                <div className="w-16 h-16 bg-[#fa5631] rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(250,86,49,0.4)]">
                  <span className="text-black font-black text-2xl">J</span>
                </div>
                <div className="w-32 h-4 bg-white/90 rounded mx-auto mb-6" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex justify-between items-end bg-[#111] p-3 rounded-xl border border-white/5"
                    >
                      <div className="space-y-2">
                        <div className="w-24 h-3 bg-white/60 rounded" />
                        <div className="w-16 h-2 bg-white/30 rounded" />
                      </div>
                      <div className="w-8 h-8 rounded-full border border-[#fa5631]/50 text-[#fa5631] flex items-center justify-center text-lg leading-none pb-1">
                        +
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-[#fa5631] text-black text-center py-3 font-bold rounded-xl">
                  View Cart
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Social Proof Strip --- */}
      <section className="border-y border-white/5 bg-[#050505] py-8 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10" />

        <p className="text-center text-xs font-bold text-white/30 uppercase tracking-widest mb-6">
          Trusted by Nigeria's most ambitious kitchens
        </p>

        <div className="flex w-full overflow-hidden">
          {/* CSS Marquee Setup */}
          <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap items-center justify-around min-w-full gap-16 px-8">
            {[
              "Iya Basira's",
              "The Yellow Chilli",
              "Danfo Bistro",
              "Suya Spot",
              "R.S.V.P",
              "Nok by Alara",
            ].map((name) => (
              <span
                key={name}
                className="font-display text-xl font-bold text-white/20 hover:text-white transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
          <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap items-center justify-around min-w-full gap-16 px-8">
            {[
              "Iya Basira's",
              "The Yellow Chilli",
              "Danfo Bistro",
              "Suya Spot",
              "R.S.V.P",
              "Nok by Alara",
            ].map((name) => (
              <span
                key={name + "-clone"}
                className="font-display text-xl font-bold text-white/20 hover:text-white transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
            Everything you need to scale.
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Stop paying 30% commissions to delivery apps. Own your customer
            relationship end-to-end.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="group bg-[#111] border border-white/5 rounded-[2rem] p-10 hover:border-[#fa5631]/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#fa5631]/5 blur-[80px] rounded-full group-hover:bg-[#fa5631]/10 transition-colors" />
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#fa5631] mb-8 group-hover:scale-110 transition-transform">
              <Icons.QR />
            </div>
            <h3 className="text-2xl font-bold mb-3 font-display">
              QR Code Ordering
            </h3>
            <p className="text-white/50 leading-relaxed">
              Customers scan the code on their table, browse the menu, and order
              directly from their phones. No app downloads required.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-[#111] border border-white/5 rounded-[2rem] p-10 hover:border-[#fa5631]/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#fa5631]/5 blur-[80px] rounded-full group-hover:bg-[#fa5631]/10 transition-colors" />
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#fa5631] mb-8 group-hover:scale-110 transition-transform">
              <Icons.Dashboard />
            </div>
            <h3 className="text-2xl font-bold mb-3 font-display">
              Real-Time Dashboard
            </h3>
            <p className="text-white/50 leading-relaxed">
              Hear that ping? See orders the second they are placed. Manage
              kitchen flow, print receipts, and track fulfillment in real time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-[#111] border border-white/5 rounded-[2rem] p-10 hover:border-[#fa5631]/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#fa5631]/5 blur-[80px] rounded-full group-hover:bg-[#fa5631]/10 transition-colors" />
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#fa5631] mb-8 group-hover:scale-110 transition-transform">
              <Icons.Palette />
            </div>
            <h3 className="text-2xl font-bold mb-3 font-display">
              Custom Brand Page
            </h3>
            <p className="text-white/50 leading-relaxed">
              Your colors, your logo, your vibe. Stand out from the generic
              aggregators with a storefront that actually looks like your
              restaurant.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group bg-[#111] border border-white/5 rounded-[2rem] p-10 hover:border-[#fa5631]/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#fa5631]/5 blur-[80px] rounded-full group-hover:bg-[#fa5631]/10 transition-colors" />
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#fa5631] mb-8 group-hover:scale-110 transition-transform">
              <Icons.Chart />
            </div>
            <h3 className="text-2xl font-bold mb-3 font-display">
              Actionable Analytics
            </h3>
            <p className="text-white/50 leading-relaxed">
              Know your peak hours, your top-selling items, and daily revenue at
              a glance. Data-driven decisions for your kitchen.
            </p>
          </div>
        </div>
      </section>

      {/* --- How It Works --- */}
      <section
        id="how-it-works"
        className="py-24 bg-[#050505] border-y border-white/5 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-black mb-16 text-center">
            From signup to first order in minutes.
          </h2>

          <div className="flex flex-col md:flex-row justify-between gap-10 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-white/10 z-0" />

            {/* Step 1 */}
            <div className="flex-1 relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-black border-2 border-white/10 rounded-full flex items-center justify-center text-2xl font-black text-white/40 mb-6 group-hover:border-[#fa5631] group-hover:text-[#fa5631] transition-colors bg-[#050505]">
                1
              </div>
              <h4 className="text-xl font-bold mb-2">Get Your Invite</h4>
              <p className="text-white/40 text-sm max-w-xs">
                Sign up for beta access and receive your unique restaurant setup
                code.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex-1 relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-black border-2 border-[#fa5631] rounded-full flex items-center justify-center text-2xl font-black text-[#fa5631] mb-6 shadow-[0_0_30px_rgba(250,86,49,0.2)] bg-[#050505]">
                2
              </div>
              <h4 className="text-xl font-bold mb-2">Set Up Your Brand</h4>
              <p className="text-white/40 text-sm max-w-xs">
                Add your logo, pick your brand colors, and upload your menu
                items instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex-1 relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-black border-2 border-white/10 rounded-full flex items-center justify-center text-2xl font-black text-white/40 mb-6 group-hover:border-[#fa5631] group-hover:text-[#fa5631] transition-colors bg-[#050505]">
                3
              </div>
              <h4 className="text-xl font-bold mb-2">Take Orders</h4>
              <p className="text-white/40 text-sm max-w-xs">
                Print your QR codes, place them on tables, and watch the
                dashboard light up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Testimonial --- */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center">
        <div className="text-[#fa5631] text-6xl font-serif leading-none mb-6">
          "
        </div>
        <h3 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-8">
          Since switching to SERVRR, our table turnover time dropped by half.
          Customers love the seamless ordering. It just works.
        </h3>
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full border border-white/20" />
          <div className="text-left">
            <p className="font-bold text-white">Adeola O.</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">
              Restaurant Owner, Lagos
            </p>
          </div>
        </div>
      </section>

      {/* --- Pricing Teaser --- */}
      <section id="pricing" className="px-6 mb-32 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-[2rem] p-12 text-center relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#fa5631]/20 blur-[100px] rounded-full pointer-events-none" />
          <h2 className="font-display text-4xl font-black mb-4 relative z-10">
            Zero upfront costs.
          </h2>
          <p className="text-xl text-white/60 mb-8 relative z-10 max-w-2xl">
            Free during fisrt 7 days of trial. Simple, transparent
            commission-based pricing only when you scale.
          </p>
          <Link
            to="/billing"
            className="inline-flex items-center gap-2 bg-white/5 text-[#fa5631] hover:bg-white/10 hover:text-[#fa5631]/90 font-bold px-8 py-3 rounded-full border border-[#fa5631]/30 relative z-10 transition-all duration-300"
          >
            View Pricing & Billing Dashboard <Icons.ArrowRight />
          </Link>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="py-32 px-6 bg-[#fa5631] text-black text-center relative overflow-hidden">
        {/* Subtle geometric pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-display text-5xl md:text-7xl font-black mb-8 leading-tight">
            Ready to take your restaurant digital?
          </h2>
          <Link
            to="/support"
            className="inline-flex items-center gap-2 bg-black text-white font-black text-xl px-12 py-5 rounded-full hover:scale-105 hover:bg-[#111] transition-all shadow-2xl"
          >
            Request Invite Now <Icons.ArrowRight />
          </Link>
          <p className="mt-6 text-black/60 font-bold uppercase tracking-widest text-sm">
            Setup takes 5 minutes.
          </p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link
              to="/"
              className="font-display font-black text-xl tracking-tight flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-[#fa5631] rounded-md flex items-center justify-center">
                <span className="text-[#0a0a0a] font-black text-sm">S</span>
              </div>
              SERVRR
            </Link>
            <p className="text-white/30 text-sm">
              Built for the future of African dining.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-white/50">
            <a
              href="#features"
              className="hover:text-[#fa5631] transition-colors"
            >
              Features
            </a>
            <a
              href="/pricing"
              className="hover:text-[#fa5631] transition-colors"
            >
              Pricing
            </a>
            <Link
              to="/support"
              className="hover:text-[#fa5631] transition-colors"
            >
              Support
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Login
            </Link>
          </div>

          <div className="text-white/30 text-sm flex gap-4">
            <a
              href="https://x.com/servrr_"
              className="hover:text-white transition-colors"
            >
              Twitter
            </a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">
              Instagram
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center md:text-left text-xs text-white/20">
          © {new Date().getFullYear()} SERVRR Technologies. All rights reserved.
        </div>
      </footer>

      {/* Tailwind specific custom animation setup */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `,
        }}
      />
    </div>
  );
};

export default Landing;
