import React from "react";
import chef from "../../assets/image/chef.png";
import { FaAngleRight } from "react-icons/fa";

const Hero = () => {
  return (
    <section
      id="Home"
      className="relative min-h-screen bg-[#0a0a0a] flex items-center overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#fa5631]/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#fa5631]/5 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-16 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#fa5631] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fa5631] animate-pulse" />
            Now Accepting Orders
          </div>

          <h1 className="font-display text-6xl lg:text-8xl font-black leading-none tracking-tight text-white mb-6">
            Get fresh
            <br />
            <span className="text-[#fa5631] italic">Food</span>
            <br />
            an easy way
          </h1>

          <p className="text-white/50 text-lg leading-relaxed max-w-lg mb-10 font-light">
            Welcome to FOODco — culinary delights, delivered. Browse our
            mouthwatering menu, place your order effortlessly, and experience a
            world of creativity without compromising on flavor.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="/menu"
              className="group inline-flex items-center gap-3 bg-[#fa5631] hover:bg-[#e04420] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 no-underline"
            >
              Explore Menu
              <FaAngleRight className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-14 pt-10 border-t border-white/10">
            {[
              { value: "200+", label: "Menu Items" },
              { value: "5K+", label: "Happy Customers" },
              { value: "4.9★", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-white/40 text-xs tracking-wide mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chef image */}
        <div className="relative hidden lg:flex items-end justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="absolute -inset-8 rounded-full bg-[#fa5631]/10 blur-3xl" />
          <img
            src={chef}
            alt="Chef"
            loading="lazy"
            className="relative z-20 w-auto max-h-[600px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
            style={{ filter: "drop-shadow(0 20px 60px rgba(250,86,49,0.25))" }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
