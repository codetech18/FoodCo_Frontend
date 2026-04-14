import React from "react";
import { Link, useParams } from "react-router-dom";
import { useRestaurant } from "../../context/RestaurantContext";

const Footer = () => {
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();

  const name = profile?.name || "FOODco";
  const accent = profile?.accentColor || "#fa5631";
  const address = profile?.address || "";
  const phone = profile?.phone || "";
  const email = profile?.contactEmail || "";
  const tagline = profile?.tagline || "Culinary delights, delivered.";
  const logoUrl = profile?.logoUrl || null;

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={name}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="font-display text-xl font-black text-white">
                  {name}
                </span>
              )}
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs mb-4">
              {tagline}
            </p>
            {address && <p className="text-white/20 text-xs mb-1">{address}</p>}
            {phone && <p className="text-white/20 text-xs mb-1">{phone}</p>}
            {email && <p className="text-white/20 text-xs">{email}</p>}
          </div>

          {/* Quick links */}
          <div>
            <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-4">
              Quick Links
            </p>
            <ul className="space-y-3 list-none p-0">
              {[
                { label: "Home", to: `/${restaurantId}` },
                { label: "Menu", to: `/${restaurantId}/menu` },
                { label: "Order", to: `/${restaurantId}/order` },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-white/40 hover:text-white text-sm transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-4">
              Follow Us
            </p>
            <div className="flex items-center gap-3">
              {profile?.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all no-underline"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {profile?.twitter && (
                <a
                  href={profile.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all no-underline"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <p className="text-white/10 text-xs">
            Powered by{" "}
            <a
              href="/"
              className="text-white/20 hover:text-white transition-colors no-underline"
            >
              SERVRR
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
