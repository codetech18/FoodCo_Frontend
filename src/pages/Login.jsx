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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedUser(null);
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (!user.emailVerified) {
        // Store the user so we can offer resend
        setUnverifiedUser(user);
        await auth.signOut();
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      // Super admin — skip restaurant lookup, go straight to /superadmin
      if (user.uid === SUPER_ADMIN_UID) {
        navigate("/superadmin");
        return;
      }

      // Regular restaurant owner — look up their restaurantId
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setError(
          "Account setup incomplete. Please sign up again or contact support.",
        );
        await auth.signOut();
        setLoading(false);
        return;
      }

      const { restaurantId } = userDoc.data();

      // Check if this is a first login (account created within last 10 minutes)
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
      console.error(err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again in a few minutes.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    try {
      // Need to sign in temporarily to send verification
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      await auth.signOut();
      setResentEmail(true);
      setError("");
    } catch (err) {
      setError("Failed to resend verification email. Try again.");
    }
  };

  const inputCls =
    "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 text-sm px-4 py-3 focus:outline-none focus:border-[#fa5631]/60 transition-colors";
  const labelCls =
    "block text-white/40 text-[10px] font-semibold tracking-widest uppercase mb-1.5";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-0.5 no-underline mb-8"
          >
            <span class="font-display text-2xl font-black text-white">
              SERVRR
            </span>
          </Link>
          <h1 className="font-display text-4xl font-black text-white mb-2">
            Welcome back
          </h1>
          <p className="text-white/40 text-sm">
            Log in to manage your restaurant.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-white/5 p-8 relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#fa5631] to-transparent" />

          {/* Resent confirmation */}
          {resentEmail && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 mb-6">
              Verification email resent — check your inbox (and spam folder).
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 mb-4">
              {error}
              {unverifiedUser && !resentEmail && (
                <button
                  onClick={handleResendVerification}
                  className="block mt-2 text-[#fa5631] text-xs font-semibold underline cursor-pointer bg-transparent border-none text-left"
                >
                  Resend verification email →
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={labelCls}>Email Address</label>
              <input
                type="email"
                required
                placeholder="owner@restaurant.com"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                required
                placeholder="Your password"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fa5631] hover:opacity-85 disabled:opacity-50 text-white font-bold py-4 rounded-full transition-all cursor-pointer border-none flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In to Dashboard"
              )}
            </button>
          </form>

          <p className="text-white/30 text-xs text-center mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#fa5631] hover:text-white transition-colors no-underline font-semibold"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Help text */}
        <p className="text-white/20 text-xs text-center mt-4 leading-relaxed">
          Didn't receive a verification email? Try signing up again or check
          your spam folder.
        </p>
      </div>
    </div>
  );
};

export default Login;
