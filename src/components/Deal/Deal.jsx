import React from "react";
import art from "../../assets/image/art.png";

const Deal = () => {
  return (
    <section id="About" className="bg-[#111111] py-28 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fa5631]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative flex justify-center order-2 lg:order-1">
            <div className="absolute w-80 h-80 rounded-full bg-[#fa5631]/15 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="relative">
              <div className="absolute -inset-6 rounded-full border border-[#fa5631]/20" />
              <div className="absolute -inset-12 rounded-full border border-white/5" />
              <img
                src={art}
                alt="Deal of the Day"
                loading="lazy"
                className="relative z-10 w-64 lg:w-80 drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                style={{
                  filter: "drop-shadow(0 20px 50px rgba(250,86,49,0.35))",
                }}
              />
              <div className="absolute -top-3 -right-3 z-20 bg-[#fa5631] text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
                NEW!
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-[#fa5631] text-xs font-semibold tracking-widest uppercase mb-5">
              <span className="w-8 h-px bg-[#fa5631]" />
              Limited Time
            </div>

            <h2 className="font-display text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              <span className="text-[#fa5631] italic">Deal</span>
              <br />
              Of The Day
            </h2>

            <h3 className="text-white/50 text-xl font-light mb-5">
              Why choose this?
            </h3>

            <p className="text-white/50 text-base leading-relaxed mb-8 max-w-lg">
              We're thrilled to introduce{" "}
              <strong className="text-white font-semibold">
                Ramen Noodles
              </strong>{" "}
              to our menu. Order the Ramen Noodles and get a{" "}
              <strong className="text-[#fa5631]">free Yogurt Smoothie</strong> —
              on us! Featuring rich broth, eggs, seasonal vegetables, and
              premium spices.
            </p>

            {/* Highlight card */}
            <div className="bg-white/5 border border-white/10 p-4 mb-8 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 bg-[#fa5631]/20 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-xl">
                <svg
                  className="w-5 h-5 text-[#fa5631]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold text-sm mb-0.5">
                  Free Yogurt Smoothie
                </div>
                <div className="text-white/40 text-sm">
                  With every Ramen Noodles order. Today only.
                </div>
              </div>
            </div>

            <a
              href="/menu"
              className="inline-flex items-center gap-3 bg-[#fa5631] hover:bg-[#e04420] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 no-underline group"
            >
              Order Now
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Deal;
