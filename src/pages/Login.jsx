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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [resentEmail, setResentEmail] = useState(false);

  // Default accent if not yet loaded from a profile
  const accent = "#fa5631";

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
      <div className="lg:w-[40%] bg-[#111] relative overflow-hidden flex flex-col justify-between p-12 border-r border-white/5">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <Link
          to="/"
          className="relative z-10 flex items-center gap-2 no-underline"
        >
          <span className="font-display text-2xl font-black tracking-tighter italic">
            SERVRR
          </span>
        </Link>

        <div className="relative z-10">
          <h1 className="font-display text-5xl font-black leading-none mb-6 uppercase italic">
            Command your <br /> <span style={{ color: accent }}>Kitchen.</span>
          </h1>
          <ul className="space-y-4 list-none p-0">
            {[
              "Zero-commission ordering",
              "Real-time dashboard",
              "Custom branding",
            ].map((f) => (
              <li
                key={f}
                className="flex items-center gap-3 text-white/50 text-sm font-medium"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />{" "}
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-white/20 text-xs uppercase tracking-widest font-bold">
          &copy; 2026 SERVRR Systems Inc.
        </p>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="font-display text-3xl font-black mb-2 uppercase italic">
              Welcome Back
            </h2>
            <p className="text-white/40 text-sm">
              Enter your credentials to access your restaurant admin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wide">
                {error}
                {unverifiedUser && !resentEmail && (
                  <button
                    onClick={handleResendVerification}
                    className="block mt-2 underline cursor-pointer bg-transparent border-none text-red-400 p-0 font-black"
                  >
                    Resend Link →
                  </button>
                )}
              </div>
            )}
            {resentEmail && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-xs font-bold uppercase tracking-wide">
                Verification sent. Check your inbox.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@restaurant.com"
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-transform active:scale-95"
              style={{ backgroundColor: accent }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-white/30 text-xs font-medium">
            New to SERVRR?{" "}
            <Link
              to="/signup"
              className="font-black no-underline transition-colors hover:text-white"
              style={{ color: accent }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
