import React, { useState } from "react";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../firebase/config";
import { X } from "lucide-react";

let reauthCacheUntil = 0;

export const isReauthValid = () => Date.now() < reauthCacheUntil;
const setReauthCache = () => { reauthCacheUntil = Date.now() + 15 * 60 * 1000; };

const ReauthModal = ({ onSuccess, onCancel, accent = "#fa5631" }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password) return setError("Password required.");
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      setReauthCache();
      onSuccess();
    } catch (err) {
      const code = err.code || "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Incorrect password. Try again.");
      } else {
        setError("Verification failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 backdrop-blur-md bg-black/70">
      <div className="bg-[#111] border border-white/10 w-full max-w-sm p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: accent }} />
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black uppercase text-lg tracking-tighter">
            Confirm Identity
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/5 rounded-full bg-transparent border-none cursor-pointer text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-white/40 text-xs mb-6 leading-relaxed">
          Enter your admin password to authorise this action.
        </p>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            autoFocus
            className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/20 transition-all text-sm"
          />
          {error && (
            <p className="text-red-400 text-xs font-bold uppercase tracking-wide">{error}</p>
          )}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-sm text-white transition-all border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: accent }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReauthModal;
