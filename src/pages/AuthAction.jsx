import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthAction = () => {
  const [searchParams] = useSearchParams();
  const mode    = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!oobCode) { setStatus("error"); setError("Invalid or missing action code."); return; }

    if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => setStatus("success"))
        .catch((err) => {
          console.error(err);
          if (err.code === "auth/invalid-action-code") {
            setError("This verification link has already been used or has expired. Please log in to request a new one.");
          } else {
            setError(err.message || "Verification failed. Please try again.");
          }
          setStatus("error");
        });
    } else {
      setStatus("error");
      setError("Unknown action. Please use the link from your email.");
    }
  }, [mode, oobCode]);

  if (status === "loading") return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-[#fa5631] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/30 text-sm">Verifying your email...</p>
      </div>
    </div>
  );

  if (status === "error") return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 className="font-display text-2xl font-black text-white mb-3">Verification Failed</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">{error}</p>
        <Link to="/login"
          className="inline-flex items-center gap-2 bg-[#fa5631] text-white font-bold px-8 py-3.5 rounded-full no-underline hover:opacity-85 transition-all">
          Go to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#fa5631]/15 border border-[#fa5631]/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#fa5631]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="font-display text-3xl font-black text-white mb-3">Email Verified! 🎉</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Your email has been successfully verified. You can now log in to your restaurant dashboard.
        </p>
        <Link to="/login"
          className="inline-flex items-center gap-2 bg-[#fa5631] text-white font-bold px-8 py-3.5 rounded-full no-underline hover:opacity-85 transition-all">
          Log In to Dashboard
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default AuthAction;
