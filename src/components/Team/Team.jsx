import React from "react";
import chef1 from "../../assets/image/chef1.png";
import chef2 from "../../assets/image/chef2.png";
import chef3 from "../../assets/image/chef3.jpg";
import chef4 from "../../assets/image/chef4.jpg";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";

const chefs = [
  { name: "Chef Emeka", role: "Head Chef", specialty: "West African Cuisine", bio: "Award-winning culinary artist with 15+ years crafting West African and continental fusion dishes.", img: chef1 },
  { name: "Chef Adaeze", role: "Pastry Chef", specialty: "Pastry & Desserts", bio: "Trained in Paris and Lagos, Adaeze brings artisanal precision to every dessert and breakfast creation.", img: chef2 },
  { name: "Chef Tunde", role: "Grill Master", specialty: "Grills & BBQ", bio: "Master of flame and smoke, Tunde elevates every protein to an unforgettable dining experience.", img: chef3 },
  { name: "Chef Ngozi", role: "Sous Chef", specialty: "Continental Dishes", bio: "Creative force behind our daily specials, blending tradition with modern culinary techniques.", img: chef4 },
];

const Team = () => {
  return (
    <section id="Team" className="bg-[#0a0a0a] py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(250,86,49,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(250,86,49,0.03) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 text-[#fa5631] text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-8 h-px bg-[#fa5631]" />
            The people behind the magic
            <span className="w-8 h-px bg-[#fa5631]" />
          </div>
          <h2 className="font-display text-5xl lg:text-7xl font-black text-white">
            Our <span className="text-[#fa5631] italic">Chefs</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefs.map((chef, i) => (
            <div
              key={chef.name}
              className="group relative bg-[#111111] border border-white/5 hover:border-[#fa5631]/30 overflow-hidden transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-72 overflow-hidden bg-[#1a1a1a]">
                <img
                  src={chef.img}
                  alt={chef.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/10 to-transparent" />
                <div className="absolute top-4 left-4 font-display text-6xl font-black text-white/5 leading-none select-none">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-[#fa5631]/20 border border-[#fa5631]/30 text-[#fa5631] text-[10px] font-semibold tracking-widest uppercase px-2 py-1">
                    {chef.specialty}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="text-white/35 text-[10px] font-semibold tracking-widest uppercase mb-1">{chef.role}</div>
                <h3 className="text-white font-bold text-lg mb-2">{chef.name}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{chef.bio}</p>

                <div className="h-px bg-white/5 my-4" />

                {/* Social */}
                <div className="flex items-center gap-2">
                  {[CiFacebook, FaXTwitter, FaInstagram].map((Icon, idx) => (
                    <button
                      key={idx}
                      className="w-7 h-7 border border-white/10 hover:border-[#fa5631] flex items-center justify-center text-white/30 hover:text-[#fa5631] transition-all duration-200 cursor-pointer bg-transparent"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fa5631] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
