import React, { useState } from "react";
import { Link } from "react-router-dom";

const Support = () => {
  // --- Configuration ---
  const accent = "#fa5631";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // --- Handlers ---
  const handleFaqToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
    setFormData({ name: "", email: "", message: "" });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("support@servrr.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Data ---
  const quickLinks = [
    {
      title: "Getting Started",
      desc: "Set up your restaurant profile in minutes.",
      icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    },
    {
      title: "Managing Your Menu",
      desc: "Add items, categories, and dynamic pricing.",
      icon: (
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      ),
    },
    {
      title: "Orders & Tracking",
      desc: "Real-time kitchen display and order flows.",
      // Wrapped in Fragment <> </> to fix the "Adjacent JSX elements" error
      icon: (
        <>
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </>
      ),
    },
    {
      title: "Billing & Account",
      desc: "Manage subscriptions and payment payouts.",
      icon: (
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      ),
    },
  ];

  const faqs = [
    {
      q: "How do I sign up?",
      a: "Simply click 'Get Started' on our homepage. You'll need your restaurant name, business email, and basic branding details to launch your digital menu instantly.",
    },
    {
      q: "How do customers place an order?",
      a: "Customers scan a unique QR code at their table, browse your digital menu on their own mobile browser, and hit checkout. No app download required.",
    },
    {
      q: "Can I use SERVRR on multiple devices?",
      a: "Yes. SERVRR is cloud-based. You can have the kitchen dashboard open on a tablet, while managing settings from your laptop or phone simultaneously.",
    },
    {
      q: "How do I add items to my menu?",
      a: "In your admin dashboard, go to the 'Menu' tab. You can create categories, upload high-quality photos, and set availability or dietary labels with one click.",
    },
    {
      q: "What happens when a customer scans the QR code?",
      a: "They are instantly taken to your restaurant's hosted SERVRR page. The URL automatically identifies their table number for seamless service.",
    },
    {
      q: "How do I track orders in real time?",
      a: "The 'Live Orders' panel updates instantly. You'll hear a notification sound for new orders, and you can move them through 'Preparing', 'Ready', and 'Served' states.",
    },
    {
      q: "Can I change my brand color after signup?",
      a: "Absolutely. Head to 'Settings > Branding' at any time to update your logo, tagline, or accent colors to match your seasonal theme.",
    },
    {
      q: "How do I contact support?",
      a: "You can use the contact form below or email us directly at support@servrr.com. Our team usually responds within 2 hours during business windows.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/10 overflow-x-hidden">
      {/* --- TOP BAR --- */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="no-underline">
          <span className="font-display text-2xl font-black text-white italic">
            SERVRR
          </span>
        </Link>
        <Link
          to="/admin"
          className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors no-underline border border-white/10 px-5 py-2.5 rounded-full"
        >
          Back to App
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 lg:py-32 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] blur-[120px] rounded-full opacity-10 pointer-events-none"
          style={{ background: accent }}
        />

        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none mb-6">
            How can we <span style={{ color: accent }}>Help?</span>
          </h1>
          <p className="text-white/40 text-sm lg:text-base font-medium max-w-lg mx-auto mb-10 leading-relaxed">
            Everything you need to master your digital ordering system. Search
            our documentation or browse topics below.
          </p>

          <div className="relative max-w-lg mx-auto group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-white/20 group-focus-within:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for articles, features, or guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10"
            />
          </div>
        </div>
      </section>

      {/* --- QUICK LINKS --- */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, i) => (
            <div
              key={i}
              className="group bg-[#111] border border-white/5 p-8 rounded-3xl hover:border-white/20 transition-all cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-[#1a1a1a] group-hover:scale-110 transition-transform"
                style={{ color: accent }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  {link.icon}
                </svg>
              </div>
              <h3 className="font-display text-lg font-black uppercase italic mb-2">
                {link.title}
              </h3>
              <p className="text-white/30 text-xs leading-relaxed mb-6">
                {link.desc}
              </p>
              <div
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                style={{ color: accent }}
              >
                View Guide
                <svg
                  className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="max-w-3xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <p
            className="text-[10px] font-black uppercase tracking-[0.3em] mb-4"
            style={{ color: accent }}
          >
            Knowledge Base
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">
            Common Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-white/5 rounded-2xl overflow-hidden bg-[#111]/50"
            >
              <button
                onClick={() => handleFaqToggle(i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors bg-transparent border-none cursor-pointer"
              >
                <span className="text-sm font-bold text-white/80 pr-8">
                  {faq.q}
                </span>
                <svg
                  className={`w-4 h-4 text-white/20 transition-transform duration-300 ${activeIndex === i ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${activeIndex === i ? "max-h-48" : "max-h-0"}`}
              >
                <div className="p-6 pt-0 text-xs leading-relaxed text-white/40 border-t border-white/5 mt-[-1px]">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Email Form */}
          <div>
            <div className="mb-10">
              <p
                className="text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                style={{ color: accent }}
              >
                Direct Support
              </p>
              <h2 className="font-display text-4xl font-black uppercase italic tracking-tighter mb-4">
                Send a Message
              </h2>
              <p className="text-white/40 text-sm">
                Need technical help? Our engineers are on standby.
              </p>
            </div>

            {formSubmitted ? (
              <div className="bg-[#111] border border-green-500/20 p-10 rounded-3xl text-center">
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-black uppercase italic mb-2">
                  Message Sent
                </h3>
                <p className="text-white/40 text-xs">
                  We'll get back to you at {formData.email || "your email"}{" "}
                  shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:border-white/20 text-white"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:border-white/20 text-white"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows="5"
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:border-white/20 text-white resize-none"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] border-none text-white cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ background: accent }}
                >
                  Send Support Ticket
                </button>
              </form>
            )}
          </div>

          {/* Direct Card */}
          <div className="lg:pt-24">
            <div className="bg-[#111] border border-white/5 p-12 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg
                  className="w-32 h-32"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>

              <h3 className="font-display text-2xl font-black uppercase italic mb-6">
                Drop us a line
              </h3>
              <p className="text-white/40 text-sm leading-relaxed mb-10">
                Prefer your own mail client? Send us an email directly and we'll
                route it to the right department.
              </p>

              <div className="flex flex-col gap-4">
                <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
                  <span className="font-mono text-sm text-white/60">
                    support@servrr.com
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="bg-transparent border-none cursor-pointer p-2 transition-transform active:scale-90"
                  >
                    {copied ? (
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                        Copied
                      </span>
                    ) : (
                      <svg
                        className="w-5 h-5 text-white/20 hover:text-white transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER STRIP --- */}
      <footer className="py-12 border-t border-white/5 text-center px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          © 2025{" "}
          <Link
            to="/"
            className="text-white/20 no-underline hover:text-white transition-colors"
          >
            SERVRR
          </Link>
          . Built for restaurants that mean business.
        </p>
      </footer>
    </div>
  );
};

export default Support;
