import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 lg:px-16 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-0.5">
          <span className="font-display text-2xl font-black text-white">
            TABLE
          </span>
          <span className="font-display text-2xl font-black text-[#fa5631] italic">
            flow.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="mailto:hello@tableflow.com"
            className="text-white/50 hover:text-white text-sm transition-colors no-underline"
          >
            Contact
          </a>
          <a
            href="/login"
            className="text-white/50 hover:text-white text-sm transition-colors no-underline"
          >
            Log In
          </a>
          <a
            href="/signup"
            className="bg-[#fa5631] hover:bg-[#e04420] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all no-underline"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#fa5631]/8 blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#fa5631] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#fa5631] animate-pulse" />
          Now onboarding restaurants
        </div>

        <h1 className="font-display text-6xl lg:text-8xl font-black leading-none text-white mb-6 max-w-4xl">
          The smarter way to
          <span className="text-[#fa5631] italic"> run your restaurant</span>
        </h1>

        <p className="text-white/50 text-lg leading-relaxed max-w-2xl mb-10">
          Tableflow gives your restaurant a digital ordering system, live order
          tracking, and a real-time admin dashboard — all under your own brand.
          No app download. No technical setup.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <a
            href="/signup"
            className="inline-flex items-center gap-3 bg-[#fa5631] hover:bg-[#e04420] text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 no-underline"
          >
            Get your restaurant onboarded
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 max-w-4xl w-full text-left">
          {[
            {
              icon: (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
              ),
              title: "Digital Ordering",
              desc: "Customers browse your menu and order from their table. No app, no login required.",
            },
            {
              icon: (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
              title: "Live Order Tracking",
              desc: "Customers track their order in real time — from pending to served.",
            },
            {
              icon: (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              ),
              title: "Admin Dashboard",
              desc: "Manage orders, update your menu, and track daily revenue — all in one place.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-[#111111] border border-white/5 p-6 hover:border-[#fa5631]/20 transition-all"
            >
              <div className="text-[#fa5631] mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Demo link */}
        <div className="mt-16 text-center">
          <p className="text-white/30 text-sm mb-3">
            Want to see it in action?
          </p>
          <Link
            to="/foodco"
            className="text-[#fa5631] hover:text-white text-sm font-semibold underline transition-colors"
          >
            View the FOODco demo restaurant →
          </Link>
        </div>
      </div>

      <footer className="px-6 py-6 border-t border-white/5 text-center text-white/20 text-xs">
        © {new Date().getFullYear()} Tableflow. Built for restaurants that mean
        business.
      </footer>
    </div>
  );
};

export default Landing;
