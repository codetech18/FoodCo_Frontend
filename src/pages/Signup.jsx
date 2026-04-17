import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const Signup = () => {
  const navigate = useNavigate();
  // We now only have 3 steps: 1 (Account), 2 (Brand & Contact), 3 (Success)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
    .replace(/-+/g, "-");

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      return setError(
        "Image size exceeds the 2MB limit. Please choose a smaller file.",
      );
    }

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
    } catch (err) {
      setError("Logo upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password)
        return "All account fields are required.";
      if (formData.password !== formData.confirmPassword)
        return "Passwords do not match.";
      if (formData.password.length < 6)
        return "Password must be at least 6 characters.";
    }
    if (step === 2) {
      // Logo is optional, so we don't check it here.
      if (!formData.tagline || !formData.description)
        return "Please provide a tagline and description.";
      if (!formData.address || !formData.phone || !formData.contactEmail)
        return "Please provide your primary contact and location details.";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) return setError(err);
    setStep((prev) => prev + 1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (uploadingLogo) return;

    const err = validateStep();
    if (err) return setError(err);

    setLoading(true);
    setError("");

    try {
      // 1. Create Auth User
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      // 2. Send Verification
      await sendEmailVerification(user);

      // 3. Force sign out to prevent the "unverified limbo" trap
      await auth.signOut();

      // 4. Map User to Restaurant
      await setDoc(doc(db, "users", user.uid), {
        restaurantId: slug,
        email: formData.email,
        role: "owner",
      });

      // 5. Save Restaurant Profile
      await setDoc(doc(db, "restaurants", slug, "profile", "info"), {
        restaurantId: slug,
        ownerUid: user.uid,
        name: formData.name || "",
        email: formData.email || "",
        accentColor: formData.accentColor || "#fa5631",
        tagline: formData.tagline || "",
        description: formData.description || "",
        logoUrl: formData.logoUrl || "",
        address: formData.address || "",
        phone: formData.phone || "",
        contactEmail: formData.contactEmail || "",
        instagram: formData.instagram || "",
        twitter: formData.twitter || "",
        createdAt: serverTimestamp(),
      });

      setStep(3); // Move to Success Screen
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const accent = formData.accentColor;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row font-sans text-white">
      {/* LEFT PANEL */}
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
            {/* Now only 2 steps before success */}
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
                : "The Reach"}
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

      {/* RIGHT PANEL */}
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

                {/* STEP 1: ACCOUNT DETAILS */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                {/* STEP 2: BRANDING & CONTACT MERGED */}
                {step === 2 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Block A: Brand Identity */}
                    <div className="space-y-6">
                      <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">
                        1. Brand Identity
                      </h3>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                            Logo Upload
                          </label>
                          <label className="flex flex-col items-center justify-center w-full h-32 bg-[#1a1a1a] border border-white/5 border-dashed rounded-2xl cursor-pointer hover:border-white/20 relative overflow-hidden transition-all p-2">
                            {uploadingLogo ? (
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : formData.logoUrl ? (
                              <img
                                src={formData.logoUrl}
                                className="w-full h-full object-contain p-2"
                                alt="Logo preview"
                              />
                            ) : (
                              <div className="text-center flex flex-col items-center">
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1 text-white">
                                  Upload (Optional)
                                </span>
                                <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest text-white">
                                  500x500px • Max 2MB
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
                            Accent Theme
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
                          placeholder="Tell your customers a bit about your restaurant..."
                          className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all h-24 resize-none"
                        />
                      </div>
                    </div>

                    {/* Block B: Contact & Location */}
                    <div className="space-y-6">
                      <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">
                        2. Contact & Location
                      </h3>

                      <Input
                        label="Physical Address"
                        value={formData.address}
                        onChange={(v) => updateField("address", v)}
                        placeholder="123 Main St, City, State"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Business Phone"
                          value={formData.phone}
                          onChange={(v) => updateField("phone", v)}
                          placeholder="+1 (555) 000-0000"
                        />
                        <Input
                          label="Support Email"
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

                {/* Form Controls */}
                <div className="flex gap-4 pt-6 mt-8 border-t border-white/5">
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-white/5 transition-all text-white cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 py-5 rounded-full font-black uppercase tracking-widest text-[10px] cursor-pointer border-none text-white transition-all active:scale-95"
                      style={{ background: accent }}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || uploadingLogo}
                      className="flex-1 py-5 rounded-full font-black uppercase tracking-widest text-[10px] cursor-pointer border-none text-white transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: accent }}
                    >
                      {loading ? "Deploying System..." : "Launch Dashboard"}
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
            /* STEP 3: SUCCESS (Formally Step 4) */
            <div className="text-center animate-in zoom-in-95 duration-500">
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
                We've sent a secure verification link to <br />
                <span className="text-white font-bold">
                  {formData.email}
                </span>. <br />
                Please click the link to activate your dashboard.
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

// --- HELPER COMPONENT: INPUT ---
const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  showToggle,
  onToggle,
  isToggled,
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

export default Signup;
