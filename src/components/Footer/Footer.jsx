import React from "react";
import { CiFacebook, CiLinkedin } from "react-icons/ci";
import { FaXTwitter, FaInstagram } from "react-icons/fa6";

const Footer = () => {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: "Locations",
      items: ["Ajah", "Abule-Egba", "Lekki", "Yaba", "Ikeja"],
    },
    {
      title: "Quick Links",
      items: ["Home", "Deals", "Menu", "Order", "Team"],
      hrefs: ["#Home", "#About", "#Menu", "#Order", "#Team"],
    },
    {
      title: "Contact",
      items: ["+234 905 897 7101", "+234 905 897 7101", "food@gmail.com", "foodshop@gmail.com"],
    },
    {
      title: "Services",
      items: ["Fast Delivery", "Easy Payments", "24 × 7 Support", "Dine In"],
    },
  ];

  return (
    <footer className="bg-[#080808] border-t border-white/5 pt-20 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fa5631]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-14">

          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-flex items-center gap-0.5 mb-5 no-underline">
              <span className="font-display text-3xl font-black text-white">FOOD</span>
              <span className="font-display text-3xl font-black text-[#fa5631] italic">co.</span>
            </a>
            <p className="text-white/35 text-sm leading-relaxed mb-8 max-w-xs">
              Experience culinary excellence at FOODco. From farm-fresh ingredients to
              perfectly crafted dishes — we bring the restaurant to you.
            </p>
            <div className="flex items-center gap-3">
              {[CiFacebook, FaXTwitter, FaInstagram, CiLinkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 border border-white/10 hover:border-[#fa5631] hover:bg-[#fa5631]/10 flex items-center justify-center text-white/35 hover:text-[#fa5631] transition-all duration-200 cursor-pointer bg-transparent"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {cols.map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold text-sm mb-5 tracking-wide">{col.title}</h4>
                <ul className="space-y-3 list-none">
                  {col.items.map((item, i) => (
                    <li key={item}>
                      {col.hrefs ? (
                        <a href={col.hrefs[i]} className="text-white/35 hover:text-[#fa5631] text-sm transition-colors duration-200 no-underline">
                          {item}
                        </a>
                      ) : (
                        <span className="text-white/35 text-sm">{item}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/5 mb-7" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">© {year} FOODco. All rights reserved.</p>
          <p className="text-white/20 text-xs flex items-center gap-1">
            Designed by
            <span className="text-[#fa5631] font-semibold ml-1">Co</span>
            <span className="text-white/20 mx-0.5">☺</span>
            <span className="text-[#fa5631] font-semibold">detech</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
