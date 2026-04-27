import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const SUPER_ADMIN_UID = import.meta.env.VITE_SUPER_ADMIN_UID;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [resentEmail, setResentEmail] = useState(false);

  const accent = "#fa5631"; // Brand default

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedUser(null);
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (!user.emailVerified) {
        setUnverifiedUser(user);
        await auth.signOut();
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      if (user.uid === SUPER_ADMIN_UID) {
        navigate("/superadmin");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setError("Account setup incomplete. Please contact support.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      const { restaurantId } = userDoc.data();
      const profileSnap = await getDoc(
        doc(db, "restaurants", restaurantId, "profile", "info"),
      );
      const profile = profileSnap.exists() ? profileSnap.data() : {};
      const createdAt = profile.createdAt?.toDate?.() || null;
      const isFirstLogin =
        createdAt && Date.now() - createdAt.getTime() < 10 * 60 * 1000;

      if (isFirstLogin) {
        navigate(`/welcome`);
      } else {
        navigate(`/${restaurantId}/admin`);
      }
    } catch (err) {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      await auth.signOut();
      setResentEmail(true);
    } catch (err) {
      setError("Failed to resend. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row font-sans text-white">
      {/* Brand Panel */}
      <div className="lg:w-[45%] bg-[#111] relative overflow-hidden flex flex-col justify-between p-12 border-r border-white/5">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <Link
          to="/"
          className="relative z-10 font-display text-2xl font-black tracking-tighter italic no-underline text-white"
        >
          SERVRR
        </Link>

        <div className="relative z-10">
          <h1 className="font-display text-6xl font-black leading-none mb-6 uppercase italic tracking-tighter">
            Automate <br /> <span style={{ color: accent }}>The Table.</span>
          </h1>
          <div className="space-y-4">
            {[
              "Instant Digital Menu",
              "Zero-Fee Transactions",
              "Direct Customer Insights",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-white/40 text-xs font-black uppercase tracking-widest"
              >
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: accent }}
                />{" "}
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-[10px] uppercase tracking-[0.3em] font-black">
          © 2026 SERVRR SYSTEMS
        </p>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="font-display text-4xl font-black mb-2 uppercase italic tracking-tight">
              Login
            </h2>
            <p className="text-white/40 text-sm">
              Welcome back to your kitchen dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                {error}
                {unverifiedUser && !resentEmail && (
                  <button
                    onClick={handleResendVerification}
                    className="block mt-2 underline cursor-pointer bg-transparent border-none text-red-400 p-0 font-black"
                  >
                    Resend Verification Link →
                  </button>
                )}
              </div>
            )}
            {resentEmail && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-green-400 text-[10px] font-black uppercase tracking-widest">
                Check your inbox. Email sent.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@restaurant.com"
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-white/20 hover:text-white cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 border-none cursor-pointer text-white mt-4"
              style={{ backgroundColor: accent }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Enter Dashboard"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-white/30 text-xs font-medium">
            Don't have a system?{" "}
            <Link
              to="/signup"
              className="font-black no-underline transition-colors hover:text-white"
              style={{ color: accent }}
            >
              Get Started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
