import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  MousePointerClick,
  ArrowRight,
  Smartphone,
  Globe,
  UtensilsCrossed,
} from "lucide-react";

// --- Upgraded Typewriter with "Designer" Styling ---
const Typewriter = ({ text, delay = 0.1 }) => {
  const [displayText, setDisplayText] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, delay * 1000);
    return () => clearInterval(interval);
  }, [text, delay]);

  // Logic to split the text for different styling
  // We want "Kill the" to be solid and "Friction." to be outlined
  const words = displayText.split(" ");
  const firstPart = words.slice(0, 2).join(" ");
  const secondPart = words.slice(2).join(" ");

  return (
    <span className="relative">
      <span className="text-white">{firstPart} </span>
      <span
        className="text-transparent"
        style={{
          WebkitTextStroke: "2px #fa5631",
          filter: "drop-shadow(0 0 15px rgba(250, 86, 49, 0.3))",
        }}
      >
        {secondPart}
      </span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[8px] h-[0.8em] bg-[#fa5631] ml-2 align-middle"
      />
    </span>
  );
};

const Landing = () => {
  const containerVars = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVars = {
    initial: { opacity: 0, y: 40, filter: "blur(10px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#fa5631] selection:text-white font-sans overflow-x-hidden">
      {/* GRID LAYER */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-[#fa5631]/20 blur-[140px] rounded-full animate-pulse" />
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-[100] px-6 lg:px-16 h-24 flex items-center justify-between backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#fa5631] rounded-lg shadow-[0_0_20px_rgba(250,86,49,0.4)]">
            <UtensilsCrossed size={24} className="text-black" strokeWidth={3} />
          </div>
          <span className="font-black text-3xl tracking-tighter uppercase italic">
            SERVRR
          </span>
        </div>

        <div className="flex items-center gap-8">
          <Link
            to="/login"
            className="text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="group relative bg-white text-black text-[11px] font-black px-8 py-4 rounded-full tracking-widest uppercase overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-[#fa5631] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <motion.section
        variants={containerVars}
        initial="initial"
        animate="animate"
        className="relative z-10 pt-32 pb-40 px-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            variants={itemVars}
            className="mb-8 px-4 py-1 border border-[#fa5631]/40 bg-[#fa5631]/5 text-[#fa5631] text-[10px] font-black tracking-[0.5em] uppercase rounded-sm"
          >
            Operational Excellence
          </motion.div>

          <motion.h1
            variants={itemVars}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black leading-[0.8] tracking-[-0.05em] uppercase mb-12 min-h-[1.2em]"
          >
            <Typewriter text="Kill the Friction." delay={0.1} />
          </motion.h1>

          <motion.p
            variants={itemVars}
            className="text-white/40 text-lg md:text-2xl max-w-3xl mb-16 font-light leading-snug"
          >
            Traditional menus are dead. SERVRR is the high-velocity engine
            powering the world's most efficient restaurants.
          </motion.p>

          <motion.div
            variants={itemVars}
            className="flex flex-col md:flex-row gap-8 w-full justify-center px-4"
          >
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md flex-1 max-w-xs text-left group hover:border-[#fa5631]/50 transition-all">
              <div className="text-[#fa5631] text-4xl font-black mb-2">
                0.0s
              </div>
              <div className="text-white/60 font-bold uppercase tracking-widest text-xs">
                Customer Wait Time
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md flex-1 max-w-xs text-left group hover:border-[#fa5631]/50 transition-all">
              <div className="text-[#fa5631] text-4xl font-black mb-2">
                +42%
              </div>
              <div className="text-white/60 font-bold uppercase tracking-widest text-xs">
                Average Order Value
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* BENTO GRID */}
      <section className="py-40 px-6 lg:px-16 bg-[#0a0a0a] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">
              The <br />
              <span className="italic text-white/10">Arsenal</span>
            </h2>
            <Link
              to="/signup"
              className="flex items-center gap-4 text-[#fa5631] font-black uppercase tracking-widest group text-sm"
            >
              View full capabilities{" "}
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <motion.div
              whileHover={{ y: -10 }}
              className="md:col-span-8 bg-[#111] border border-white/10 rounded-[2.5rem] p-12 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <Globe size={48} className="text-[#fa5631] mb-8" />
                <h3 className="text-4xl font-black mb-6 uppercase italic">
                  Global Sync
                </h3>
                <p className="text-white/40 text-xl max-w-md leading-relaxed">
                  Update a price in London, watch it reflect in Tokyo instantly.
                  Your entire empire, one dashboard.
                </p>
              </div>
              <div className="absolute right-[-10%] bottom-[-10%] opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe size={400} />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-[#fa5631] rounded-[2.5rem] p-12 text-black"
            >
              <Zap size={48} fill="black" className="mb-8" />
              <h3 className="text-4xl font-black mb-6 uppercase leading-none">
                Instant <br /> Deployment
              </h3>
              <p className="font-bold text-black/60">
                No hardware. No headache. Sign up at noon, take orders by lunch.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="md:col-span-6 bg-white/5 border border-white/10 rounded-[2.5rem] p-12"
            >
              <ShieldCheck size={32} className="text-[#fa5631] mb-6" />
              <h3 className="text-2xl font-black mb-4 uppercase">
                Ironclad Security
              </h3>
              <p className="text-white/40">
                Enterprise-level encryption for every transaction and guest
                interaction.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="md:col-span-6 bg-white/5 border border-white/10 rounded-[2.5rem] p-12"
            >
              <MousePointerClick size={32} className="text-[#fa5631] mb-6" />
              <h3 className="text-2xl font-black mb-4 uppercase">
                Frictionless UX
              </h3>
              <p className="text-white/40">
                Tested by millions. Designed to be so fast, customers don't even
                realize they're "ordering."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CALL */}
      <section className="py-40 px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-16 tracking-tighter leading-none uppercase">
            Start <span className="text-white/10">Winning.</span>
          </h2>
          <Link
            to="/signup"
            className="inline-block bg-[#fa5631] text-white font-black text-2xl px-20 py-10 rounded-full hover:shadow-[0_0_60px_rgba(250,86,49,0.5)] transition-all transform hover:-rotate-2 active:scale-95 uppercase italic"
          >
            Claim Your Spot Now
          </Link>
        </motion.div>
      </section>

      <footer className="py-20 px-6 lg:px-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 bg-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
            <UtensilsCrossed size={16} className="text-white" />
          </div>
          <span className="font-black tracking-tighter uppercase italic text-white">
            SERVRR
          </span>
        </div>

        <div className="flex gap-16 text-[10px] font-black tracking-[0.4em] uppercase text-white/20">
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Legal
          </Link>
          <a
            href="mailto:hi@servrr.com"
            className="hover:text-white transition-colors"
          >
            Support
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
