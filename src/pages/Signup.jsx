import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

// ── Input helper ──────────────────────────────────────────────────────────────
const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  showToggle,
  onToggle,
  isToggled,
  mono,
}) => (
  <div className="space-y-2 relative">
    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder-white/10"
        style={mono ? { fontFamily: "monospace", letterSpacing: "0.08em" } : {}}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-[10px] font-black uppercase tracking-tighter text-white/20 hover:text-white cursor-pointer transition-all"
        >
          {isToggled ? "Hide" : "Show"}
        </button>
      )}
    </div>
  </div>
);

// ── Main Signup ───────────────────────────────────────────────────────────────
const Signup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [inviteDocId, setInviteDocId] = useState(null); // stores Firestore doc ID of valid code

  const [formData, setFormData] = useState({
    inviteCode: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accentColor: "#fa5631",
    tagline: "",
    description: "",
    logoUrl: "",
    address: "",
    phone: "",
    contactEmail: "",
    instagram: "",
    twitter: "",
  });

  const slug = formData.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return setError("Image exceeds 2MB. Please choose a smaller file.");
    setUploadingLogo(true);
    setError("");
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data },
      );
      const fileData = await res.json();
      updateField("logoUrl", fileData.secure_url || "");
    } catch {
      setError("Logo upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── Validate invite code against Firestore ──────────────────────────────────
  const validateInviteCode = async (code) => {
    if (!code.trim()) return "An invite code is required to sign up.";
    const snap = await getDocs(
      query(
        collection(db, "inviteCodes"),
        where("code", "==", code.trim().toUpperCase()),
        where("status", "==", "unused"),
      ),
    );
    if (snap.empty) return "Invalid or already used invite code.";
    const codeData = snap.docs[0].data();
    if (codeData.expiresAt) {
      const expiry = codeData.expiresAt.toDate
        ? codeData.expiresAt.toDate()
        : new Date(codeData.expiresAt);
      if (new Date() > expiry) return "This invite code has expired.";
    }
    setInviteDocId(snap.docs[0].id); // save for marking used later
    return null;
  };

  // ── Step 1 → Step 2 ─────────────────────────────────────────────────────────
  const nextStep = async () => {
    setError("");
    if (!formData.inviteCode.trim())
      return setError("An invite code is required to sign up.");
    if (!formData.name) return setError("Restaurant name is required.");
    if (!formData.email) return setError("Email is required.");
    if (!formData.password) return setError("Password is required.");
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    const codeError = await validateInviteCode(formData.inviteCode);
    setLoading(false);
    if (codeError) return setError(codeError);

    setStep(2);
  };

  // ── Final submit ─────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    if (uploadingLogo) return;
    if (!formData.address || !formData.phone || !formData.contactEmail) {
      return setError("Please provide your address, phone, and contact email.");
    }

    setLoading(true);
    setError("");
    try {
      // Create auth account
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      // Send verification email
      try {
        await sendEmailVerification(user);
      } catch {}

      // Sign out immediately to prevent unverified access
      await auth.signOut();

      // Create user record
      await setDoc(doc(db, "users", user.uid), {
        restaurantId: slug,
        email: formData.email,
        role: "owner",
        createdAt: serverTimestamp(),
      });

      // Create restaurant workspace
      await setDoc(doc(db, "restaurants", slug, "profile", "info"), {
        restaurantId: slug,
        ownerUid: user.uid,
        name: formData.name,
        email: formData.email,
        accentColor: formData.accentColor || "#fa5631",
        tagline: formData.tagline,
        description: formData.description,
        logoUrl: formData.logoUrl,
        address: formData.address,
        phone: formData.phone,
        contactEmail: formData.contactEmail,
        instagram: formData.instagram,
        twitter: formData.twitter,
        createdAt: serverTimestamp(),
      });

      // Mark invite code as used
      if (inviteDocId) {
        await updateDoc(doc(db, "inviteCodes", inviteDocId), {
          status: "used",
          usedBy: slug,
          usedAt: serverTimestamp(),
        });
      }

      setStep(3);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const accent = formData.accentColor;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row font-sans text-white">
      {/* Left panel */}
      <div className="lg:w-[35%] bg-[#111] p-12 border-r border-white/5 flex flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(45deg, ${accent} 0%, transparent 70%)`,
          }}
        />

        <Link
          to="/"
          className="relative z-10 font-display text-2xl font-black italic no-underline text-white"
        >
          SERVRR
        </Link>

        <div className="relative z-10">
          <div className="flex gap-2 mb-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{
                  backgroundColor:
                    step >= i ? accent : "rgba(255,255,255,0.05)",
                }}
              />
            ))}
          </div>
          <h1 className="font-display text-4xl font-black uppercase italic leading-none mb-4 tracking-tighter">
            {step === 1
              ? "The Build"
              : step === 2
                ? "The Details"
                : "You're In"}
          </h1>
          {step < 3 && (
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Step {step} of 2
            </p>
          )}
        </div>

        <div className="relative z-10 bg-white/5 border border-white/5 p-5 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
            Endpoint Preview
          </p>
          <p
            className="font-mono text-xs truncate m-0 transition-colors duration-300"
            style={{ color: accent }}
          >
            servrr.com/{slug || "..."}
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-xl">
          {step < 3 ? (
            <>
              <form
                onSubmit={step === 2 ? handleSignup : (e) => e.preventDefault()}
                className="space-y-8"
              >
                {error && (
                  <div className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center">
                    {error}
                  </div>
                )}

                {/* ── Step 1: Account ── */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Invite code — first and prominent */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                        Invite Code *
                      </label>
                      <input
                        type="text"
                        value={formData.inviteCode}
                        onChange={(e) =>
                          updateField(
                            "inviteCode",
                            e.target.value.toUpperCase(),
                          )
                        }
                        placeholder="SRV-XXXXX-XXXXX"
                        className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                        style={{
                          fontFamily: "monospace",
                          letterSpacing: "0.1em",
                        }}
                      />
                      <p className="text-white/20 text-[10px] ml-1">
                        Don't have a code? Contact us at hello@servrr.com
                      </p>
                    </div>

                    <div className="h-px bg-white/5" />

                    <Input
                      label="Restaurant Name"
                      value={formData.name}
                      onChange={(v) => updateField("name", v)}
                      placeholder="e.g. The Chopz"
                    />
                    <Input
                      label="Owner Email"
                      type="email"
                      value={formData.email}
                      onChange={(v) => updateField("email", v)}
                      placeholder="admin@restaurant.com"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(v) => updateField("password", v)}
                        showToggle
                        onToggle={() => setShowPassword(!showPassword)}
                        isToggled={showPassword}
                      />
                      <Input
                        label="Confirm Password"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(v) => updateField("confirmPassword", v)}
                      />
                    </div>
                  </div>
                )}

                {/* ── Step 2: Branding & Contact ── */}
                {step === 2 && (
                  <div className="space-y-10">
                    {/* Branding */}
                    <div className="space-y-6">
                      <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">
                        1. Brand Identity
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                            Logo Upload
                          </label>
                          <label className="flex flex-col items-center justify-center w-full h-32 bg-[#1a1a1a] border border-white/5 border-dashed rounded-2xl cursor-pointer hover:border-white/20 transition-all overflow-hidden">
                            {uploadingLogo ? (
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : formData.logoUrl ? (
                              <img
                                src={formData.logoUrl}
                                className="w-full h-full object-contain p-2"
                                alt="Logo"
                              />
                            ) : (
                              <div className="text-center flex flex-col items-center">
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1 text-white">
                                  Upload (Optional)
                                </span>
                                <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest text-white">
                                  500x500px · Max 2MB
                                </span>
                              </div>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleLogoUpload}
                            />
                          </label>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                            Accent Colour
                          </label>
                          <label
                            htmlFor="accent-picker"
                            className="flex flex-col items-center justify-center w-full h-32 bg-[#1a1a1a] border border-white/5 rounded-2xl cursor-pointer hover:border-white/20 transition-all"
                          >
                            <div
                              className="w-8 h-8 rounded-full shadow-2xl"
                              style={{ backgroundColor: accent }}
                            />
                            <span className="text-[10px] font-mono mt-3 opacity-40 uppercase">
                              {accent}
                            </span>
                            <input
                              id="accent-picker"
                              type="color"
                              className="hidden"
                              value={accent}
                              onChange={(e) =>
                                updateField("accentColor", e.target.value)
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <Input
                        label="One-line Tagline"
                        value={formData.tagline}
                        onChange={(v) => updateField("tagline", v)}
                        placeholder="e.g. The best steak in town."
                      />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            updateField("description", e.target.value)
                          }
                          placeholder="Tell your customers about your restaurant..."
                          className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all h-24 resize-none"
                        />
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                      <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">
                        2. Contact & Location
                      </h3>
                      <Input
                        label="Physical Address *"
                        value={formData.address}
                        onChange={(v) => updateField("address", v)}
                        placeholder="123 Main St, City, State"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Business Phone *"
                          value={formData.phone}
                          onChange={(v) => updateField("phone", v)}
                          placeholder="+234 800 000 0000"
                        />
                        <Input
                          label="Support Email *"
                          value={formData.contactEmail}
                          onChange={(v) => updateField("contactEmail", v)}
                          placeholder="hello@restaurant.com"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Instagram (Optional)"
                          value={formData.instagram}
                          onChange={(v) => updateField("instagram", v)}
                          placeholder="@username"
                        />
                        <Input
                          label="Twitter (Optional)"
                          value={formData.twitter}
                          onChange={(v) => updateField("twitter", v)}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-6 mt-8 border-t border-white/5">
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setError("");
                      }}
                      className="px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-white/5 transition-all text-white cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={loading}
                      className="flex-1 py-5 rounded-full font-black uppercase tracking-widest text-[10px] cursor-pointer border-none text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: accent }}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Validating Code...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || uploadingLogo}
                      className="flex-1 py-5 rounded-full font-black uppercase tracking-widest text-[10px] cursor-pointer border-none text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: accent }}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Deploying System...
                        </>
                      ) : (
                        "Launch Dashboard"
                      )}
                    </button>
                  )}
                </div>
              </form>

              {step === 1 && (
                <p className="mt-10 text-center text-white/30 text-[10px] font-black uppercase tracking-widest">
                  Already registered?{" "}
                  <Link
                    to="/login"
                    className="no-underline transition-colors hover:text-white"
                    style={{ color: accent }}
                  >
                    Sign in here
                  </Link>
                </p>
              )}
            </>
          ) : (
            /* Step 3: Success */
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center"
                style={{
                  background: `${accent}15`,
                  border: `1px solid ${accent}40`,
                }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: accent }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="font-display text-4xl font-black uppercase italic mb-4">
                Verify Your Identity
              </h2>
              <p className="text-white/40 text-sm mb-10 leading-relaxed max-w-sm mx-auto">
                We've sent a verification link to <br />
                <span className="text-white font-bold">{formData.email}</span>.
                <br />
                Click the link to activate your dashboard.
              </p>
              <Link
                to="/login"
                className="inline-block px-12 py-5 rounded-full bg-white text-black font-black uppercase tracking-widest text-[10px] no-underline hover:bg-white/90 transition-colors"
              >
                Proceed to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
