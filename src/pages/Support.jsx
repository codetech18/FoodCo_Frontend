import React, { useState } from "react";
import { Link } from "react-router-dom";

// --- Custom SVGs ---
const Icons = {
  Search: () => (
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ChevronDown: ({ className }) => (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Rocket: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  Menu: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Orders: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  QR: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M6 6h1v1H6z" />
      <path d="M17 6h1v1h-1z" />
      <path d="M17 17h1v1h-1z" />
      <path d="M6 17h1v1H6z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  WhatsApp: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
};

// --- Data ---
const faqData = [
  {
    category: "Getting Started",
    icon: <Icons.Rocket />,
    description: "Setting up your restaurant for the first time",
    faqs: [
      {
        q: "How do I get an invite code?",
        a: "Currently, SERVRR is in exclusive beta. You can request an invite code from the homepage. Once approved, we will email your unique code to begin setup.",
      },
      {
        q: "What happens after I sign up?",
        a: "After creating your account, you'll be directed to your restaurant's dashboard where you can upload your logo, define your brand colors, and start adding your menu items.",
      },
      {
        q: "How do I verify my email?",
        a: "A verification link is sent automatically upon signup. Check your inbox (and spam folder). You won't be able to generate table QR codes until your email is verified.",
      },
    ],
  },
  {
    category: "Menu Management",
    icon: <Icons.Menu />,
    description: "Adding, editing, and hiding dishes",
    faqs: [
      {
        q: "How do I add items to my menu?",
        a: "Navigate to the 'Menu' tab in your dashboard. Click 'Add Item', upload a high-quality image, set the price, and assign it to a category like 'Mains' or 'Drinks'.",
      },
      {
        q: "Can I hide a dish without deleting it?",
        a: "Yes. In your Menu dashboard, simply toggle the 'Available' switch off next to the item. It will immediately disappear from the customer-facing digital menu.",
      },
      {
        q: "How do I change my menu categories?",
        a: "Go to 'Menu Settings' > 'Categories'. You can drag and drop to reorder how they appear to customers, or rename them to fit your specific cuisine.",
      },
    ],
  },
  {
    category: "Orders & Tables",
    icon: <Icons.Orders />,
    description: "Understanding the live order flow",
    faqs: [
      {
        q: "How does the table session work?",
        a: "When a customer scans a table's QR code, a session begins. All items ordered by anyone scanning that specific table code will be grouped into a single tab for the kitchen.",
      },
      {
        q: "What happens when a customer requests the bill?",
        a: "The session is locked, and a notification alerts your dashboard. You can then print the final receipt or process the digital payment to clear the table for the next guests.",
      },
      {
        q: "Can a customer place multiple orders at the same table?",
        a: "Yes. They can keep ordering rounds of drinks or desserts. The items simply append to the active table session on your Live Orders dashboard.",
      },
    ],
  },
  {
    category: "QR Codes & Payments",
    icon: <Icons.QR />,
    description: "Generating codes and table verification",
    faqs: [
      {
        q: "How do I generate QR codes for my tables?",
        a: "Go to 'Table Management' in your dashboard, enter your number of tables, and click 'Generate'. You can download a print-ready PDF containing all unique codes.",
      },
      {
        q: "What does the QR code link to?",
        a: "It links directly to your restaurant's custom SERVRR ordering page, automatically passing the specific table number so the kitchen knows exactly where the food goes.",
      },
      {
        q: "How often do QR tokens rotate?",
        a: "To prevent 'ghost ordering' from people who took a photo of the QR code, the digital tokens embedded in the codes refresh every 24 hours. The printed QR graphic itself never needs to be replaced.",
      },
    ],
  },
];

const Support = () => {
  const accent = "#fa5631";

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuestion, setActiveQuestion] = useState(null); // Using the question string as ID
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "Getting Started",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter Logic
  const filteredData = faqData
    .map((group) => {
      const filteredFaqs = group.faqs.filter(
        (faq) =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return { ...group, faqs: filteredFaqs };
    })
    .filter((group) => group.faqs.length > 0);

  // Handlers
  const toggleAccordion = (questionText) => {
    setActiveQuestion(activeQuestion === questionText ? null : questionText);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setFormState({
      name: "",
      email: "",
      subject: "Getting Started",
      message: "",
    });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const scrollToSection = (category) => {
    const element = document.getElementById(`faq-group-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#fa5631] selection:text-white">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-5 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#fa5631] opacity-10 blur-[150px] rounded-full pointer-events-none" />

      {/* --- Top Bar --- */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-black text-2xl tracking-tight text-white hover:text-[#fa5631] transition-colors"
        >
          SERVRR
        </Link>
        <Link
          to="/login"
          className="text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2"
        >
          Back to Dashboard
        </Link>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 pt-24 pb-16 px-6 text-center max-w-3xl mx-auto">
        <h1 className="font-display text-5xl md:text-6xl font-black mb-4 tracking-tight">
          How can we help?
        </h1>
        <p className="text-white/50 text-lg mb-10">
          Search our knowledge base or get in touch with our engineering team.
        </p>

        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#fa5631] transition-colors">
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder="Search for 'QR Codes', 'Menu', 'Tables'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-lg focus:outline-none focus:border-[#fa5631]/50 text-white placeholder:text-white/20 transition-all shadow-2xl"
          />
        </div>
      </section>

      {/* --- Quick Help Cards --- */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqData.map((category) => (
            <button
              key={category.category}
              onClick={() => scrollToSection(category.category)}
              className="text-left group bg-[#111111] border border-white/5 p-8 rounded-[2rem] hover:border-[#fa5631]/50 hover:bg-[#1a1a1a] transition-all duration-300"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#fa5631] mb-6 group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <h3 className="font-display text-xl font-bold mb-2">
                {category.category}
              </h3>
              <p className="text-white/40 text-sm">{category.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* --- FAQ Accordion --- */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        {filteredData.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Icons.Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No results found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-16">
            {filteredData.map((group) => (
              <div
                key={group.category}
                id={`faq-group-${group.category}`}
                className="scroll-mt-32"
              >
                <div className="mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="text-[#fa5631]">{group.icon}</div>
                  <h2 className="font-display text-2xl font-black">
                    {group.category}
                  </h2>
                </div>

                <div className="space-y-3">
                  {group.faqs.map((faq) => {
                    const isOpen = activeQuestion === faq.q;
                    return (
                      <div
                        key={faq.q}
                        className={`bg-[#111111] border rounded-2xl transition-colors duration-300 ${isOpen ? "border-[#fa5631]/30" : "border-white/5 hover:border-white/10"}`}
                      >
                        <button
                          onClick={() => toggleAccordion(faq.q)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                        >
                          <span className="font-bold text-white/90 pr-8">
                            {faq.q}
                          </span>
                          <Icons.ChevronDown
                            className={`text-white/30 transition-transform duration-300 min-w-[24px] ${isOpen ? "rotate-180 text-[#fa5631]" : ""}`}
                          />
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                        >
                          <div className="px-6 pb-6 pt-2 text-white/50 text-sm leading-relaxed border-t border-white/5">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Contact Section --- */}
      <section
        id="contact"
        className=" relative z-10 max-w-5xl mx-auto px-6 py-24 border-t border-white/5"
      >
        <div className="text-center mb-16">
          <span className="text-[#fa5631] text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">
            Still stuck?
          </span>
          <h2 className="font-display text-4xl font-black">Contact our team</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Email Form */}
          <div className="lg:col-span-3 bg-[#111111] border border-white/5 rounded-[2rem] p-8 md:p-10">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-[#fa5631]/10 text-[#fa5631] rounded-full flex items-center justify-center mb-6">
                  <Icons.CheckCircle />
                </div>
                <h3 className="font-display text-2xl font-black mb-2">
                  Message Sent
                </h3>
                <p className="text-white/50">
                  We've received your request and will get back to you shortly.
                  For urgent inquiries, please reach out to us on WhatsApp
                  <a
                    href="https://wa.me/2349058977101"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#fa5631] hover:underline"
                  >
                    click here
                  </a>
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 text-[#fa5631] text-sm font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">
                      Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#fa5631] text-white transition-colors"
                      placeholder="e.g. Adeola O."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#fa5631] text-white transition-colors"
                      placeholder="adeola@restaurant.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">
                    Topic
                  </label>
                  <select
                    required
                    value={formState.subject}
                    onChange={(e) =>
                      setFormState({ ...formState, subject: e.target.value })
                    }
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#fa5631] text-white transition-colors appearance-none cursor-pointer"
                  >
                    <option
                      value="Getting Started"
                      className="bg-[#1a1a1a] text-white"
                    >
                      Getting Started
                    </option>
                    <option
                      value="Menu Management"
                      className="bg-[#1a1a1a] text-white"
                    >
                      Menu Management
                    </option>
                    <option
                      value="Orders & Tables"
                      className="bg-[#1a1a1a] text-white"
                    >
                      Orders & Tables
                    </option>
                    <option
                      value="QR & Payments"
                      className="bg-[#1a1a1a] text-white"
                    >
                      QR Codes & Payments
                    </option>
                    <option value="Other" className="bg-[#1a1a1a] text-white">
                      Other Inquiry
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#fa5631] text-white transition-colors resize-none"
                    placeholder="How can we help?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#fa5631] text-black font-black text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-[#ff6b4a] transition-colors mt-2"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Direct Contact */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-[#111111] border border-white/5 hover:border-[#fa5631]/30 transition-colors rounded-[2rem] p-8 flex-1 flex flex-col justify-center">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white mb-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Email Us</h3>
              <p className="text-white/40 text-sm mb-6">
                Drop us a line directly. We aim to respond within 24 hours on
                business days.
              </p>
              <a
                href="mailto:support@servrr.ng"
                className="text-[#fa5631] font-bold hover:underline inline-flex items-center gap-2"
              >
                support@servrr.ng
              </a>
            </div>

            <div className="bg-[#111111] border border-white/5 hover:border-[#fa5631]/30 transition-colors rounded-[2rem] p-8 flex-1 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icons.WhatsApp />
              </div>
              <div className="w-12 h-12 bg-[#25D366]/10 rounded-xl flex items-center justify-center text-[#25D366] mb-6">
                <Icons.WhatsApp />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">
                Urgent Issue?
              </h3>
              <p className="text-white/40 text-sm mb-6">
                For live order disruptions, ping our emergency WhatsApp line.
              </p>
              <a
                href="https://wa.me/2349058977101"
                target="_blank"
                rel="noreferrer"
                className="text-white font-bold hover:text-[#25D366] transition-colors inline-flex items-center gap-2"
              >
                Chat on WhatsApp (click here)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer Strip --- */}
      <footer className="border-t border-white/5 py-8 text-center px-6">
        <p className="text-xs font-bold text-white/30">
          © {new Date().getFullYear()}{" "}
          <Link
            to="/"
            className="text-white/50 hover:text-white transition-colors"
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
