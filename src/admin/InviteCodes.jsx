import React, { useEffect, useState } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query,
} from "firebase/firestore";
import { db } from "../firebase/config";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars
  const segment = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `SRV-${segment()}-${segment()}`;
};

const formatDate = (ts) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

const InviteCodes = ({ accent }) => {
  const [codes, setCodes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [note, setNote]         = useState("");
  const [expiry, setExpiry]     = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied]     = useState("");

  useEffect(() => {
    const q = query(collection(db, "inviteCodes"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setCodes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const code = generateCode();
      await addDoc(collection(db, "inviteCodes"), {
        code,
        note:      note.trim(),
        status:    "unused",
        expiresAt: expiry ? new Date(expiry) : null,
        createdAt: serverTimestamp(),
        usedBy:    null,
        usedAt:    null,
      });
      setNote("");
      setExpiry("");
    } catch (err) {
      console.error(err);
      alert("Failed to create code.");
    }
    setCreating(false);
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Revoke this invite code? It will no longer work for signup.")) return;
    await updateDoc(doc(db, "inviteCodes", id), { status: "revoked" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this code permanently?")) return;
    await deleteDoc(doc(db, "inviteCodes", id));
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 text-sm px-4 py-2.5 focus:outline-none transition-colors";
  const labelCls = "block text-white/40 text-[10px] font-semibold tracking-widest uppercase mb-1.5";

  const unused  = codes.filter(c => c.status === "unused").length;
  const used    = codes.filter(c => c.status === "used").length;
  const revoked = codes.filter(c => c.status === "revoked").length;

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Unused",  count: unused,  color: "#22c55e" },
          { label: "Used",    count: used,    color: accent },
          { label: "Revoked", count: revoked, color: "#ef4444" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-[#111111] border border-white/5 px-4 py-3 text-center">
            <p className="font-black text-2xl" style={{ color }}>{count}</p>
            <p className="text-white/30 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Generate new code */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Generate New Invite Code
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Note (optional)</label>
              <input type="text" placeholder="e.g. Club 701 - Abuja" className={inputCls}
                value={note} onChange={e => setNote(e.target.value)}
                onFocus={e => e.target.style.borderColor = `${accent}99`}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>
            <div>
              <label className={labelCls}>Expiry Date (optional)</label>
              <input type="date" className={inputCls}
                value={expiry} onChange={e => setExpiry(e.target.value)}
                onFocus={e => e.target.style.borderColor = `${accent}99`}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                style={{ colorScheme: "dark" }} />
            </div>
          </div>
          <button type="submit" disabled={creating}
            className="flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 transition-all cursor-pointer border-none disabled:opacity-50"
            style={{ background: accent }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            {creating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            )}
            Generate Code
          </button>
        </form>
      </div>

      {/* Codes list */}
      <div>
        <h3 className="text-white font-bold text-sm mb-4">All Codes</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-white/10 rounded-full animate-spin"
              style={{ borderTopColor: accent }} />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16 text-white/20 text-sm">
            No invite codes yet. Generate one above.
          </div>
        ) : (
          <div className="space-y-2">
            {codes.map(c => {
              const isExpired = c.expiresAt && new Date() > (c.expiresAt.toDate ? c.expiresAt.toDate() : new Date(c.expiresAt));
              const effectiveStatus = isExpired && c.status === "unused" ? "expired" : c.status;
              const statusConfig = {
                unused:  { label: "Unused",  color: "bg-green-500/15 text-green-400 border-green-500/30" },
                used:    { label: "Used",    color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
                revoked: { label: "Revoked", color: "bg-red-500/15 text-red-400 border-red-500/30" },
                expired: { label: "Expired", color: "bg-white/5 text-white/30 border-white/10" },
              };
              const cfg = statusConfig[effectiveStatus] || statusConfig.unused;

              return (
                <div key={c.id} className="bg-[#111111] border border-white/5 px-4 py-3 flex items-center gap-4 flex-wrap">
                  {/* Code */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-mono text-white font-bold text-sm tracking-wider">{c.code}</span>
                    <button onClick={() => handleCopy(c.code)}
                      className="text-[10px] font-semibold px-2 py-0.5 border transition-all cursor-pointer"
                      style={copied === c.code
                        ? { background: "rgba(34,197,94,0.15)", borderColor: "rgba(34,197,94,0.3)", color: "#4ade80" }
                        : { background: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}>
                      {copied === c.code ? "✓" : "Copy"}
                    </button>
                  </div>

                  {/* Note */}
                  <span className="text-white/30 text-xs flex-1 truncate">
                    {c.note || "—"}
                  </span>

                  {/* Status */}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 border flex-shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </span>

                  {/* Usage info */}
                  <div className="text-white/20 text-xs flex-shrink-0">
                    {c.status === "used" ? (
                      <span>Used by <span className="text-white/40">{c.usedBy || "—"}</span> · {formatDate(c.usedAt)}</span>
                    ) : c.expiresAt ? (
                      <span>Expires {formatDate(c.expiresAt)}</span>
                    ) : (
                      <span>Created {formatDate(c.createdAt)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.status === "unused" && !isExpired && (
                      <button onClick={() => handleRevoke(c.id)}
                        className="text-[10px] font-semibold px-2.5 py-1 border border-yellow-500/20 text-yellow-400/60 hover:text-yellow-400 hover:border-yellow-500/40 transition-all cursor-pointer bg-transparent">
                        Revoke
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.id)}
                      className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer bg-transparent border-none">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteCodes;
