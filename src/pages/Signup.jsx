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
  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data },
      );
      const fileData = await res.json();
      updateField("logoUrl", fileData.secure_url);
    } catch (err) {
      setError("Logo upload failed.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password)
        return "All fields required.";
      if (formData.password !== formData.confirmPassword)
        return "Passwords do not match.";
    }
    if (step === 2) {
      if (!formData.tagline || !formData.description)
        return "Branding details required.";
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
    setLoading(true);
    setError("");
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      await sendEmailVerification(user);
      await setDoc(doc(db, "users", user.uid), {
        restaurantId: slug,
        email: formData.email,
        role: "owner",
      });
      await setDoc(doc(db, "restaurants", slug, "profile", "info"), {
        ...formData,
        restaurantId: slug,
        ownerUid: user.uid,
        createdAt: serverTimestamp(),
      });
      setStep(4);
    } catch (err) {
      if (err.code === "auth/email-already-in-use")
        setError("Email already exists.");
      else setError(err.message);
    }
    setLoading(false);
  };

  const accent = formData.accentColor;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row font-sans text-white">
      {/* Brand Panel */}
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
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    step >= i ? accent : "rgba(255,255,255,0.05)",
                }}
              />
            ))}
          </div>
          <h1 className="font-display text-4xl font-black uppercase italic leading-none mb-4 tracking-tighter">
            {step === 1 ? "The Build" : step === 2 ? "The Look" : "The Reach"}
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Step {step} of 3
          </p>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/5 p-5 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
            Endpoint Preview
          </p>
          <p
            className="font-mono text-xs truncate m-0"
            style={{ color: accent }}
          >
            servrr.com/{slug || "..."}
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          {step < 4 ? (
            <>
              <form onSubmit={handleSignup} className="space-y-8">
                {error && (
                  <div className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <Input
                      label="Restaurant Name"
                      value={formData.name}
                      onChange={(v) => updateField("name", v)}
                    />
                    <Input
                      label="Owner Email"
                      type="email"
                      value={formData.email}
                      onChange={(v) => updateField("email", v)}
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
                        label="Confirm"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(v) => updateField("confirmPassword", v)}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                          Identity Logo
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-32 bg-[#1a1a1a] border border-white/5 border-dashed rounded-2xl cursor-pointer hover:border-white/20 relative overflow-hidden transition-all">
                          {uploadingLogo ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : formData.logoUrl ? (
                            <img
                              src={formData.logoUrl}
                              className="w-full h-full object-contain p-4"
                            />
                          ) : (
                            <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">
                              Select File
                            </span>
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
                      label="Tagline"
                      value={formData.tagline}
                      onChange={(v) => updateField("tagline", v)}
                      placeholder="Best burgers in town."
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
                        className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all h-24"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <Input
                      label="Address"
                      value={formData.address}
                      onChange={(v) => updateField("address", v)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Phone"
                        value={formData.phone}
                        onChange={(v) => updateField("phone", v)}
                      />
                      <Input
                        label="Support Email"
                        value={formData.contactEmail}
                        onChange={(v) => updateField("contactEmail", v)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Instagram"
                        value={formData.instagram}
                        onChange={(v) => updateField("instagram", v)}
                        placeholder="@username"
                      />
                      <Input
                        label="Twitter"
                        value={formData.twitter}
                        onChange={(v) => updateField("twitter", v)}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] border border-white/5 hover:bg-white/5 transition-all text-white cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={uploadingLogo}
                      className="flex-1 py-5 rounded-full font-black uppercase tracking-widest text-[10px] cursor-pointer border-none text-white transition-all active:scale-95"
                      style={{ background: accent }}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-5 rounded-full font-black uppercase tracking-widest text-[10px] cursor-pointer border-none text-white transition-all active:scale-95"
                      style={{ background: accent }}
                    >
                      {loading ? "Launching..." : "Deploy System"}
                    </button>
                  )}
                </div>
              </form>
              <p className="mt-10 text-center text-white/30 text-[10px] font-black uppercase tracking-widest">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="no-underline"
                  style={{ color: accent }}
                >
                  Login here
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center"
                style={{
                  background: `${accent}20`,
                  border: `1px solid ${accent}40`,
                }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: accent }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="font-display text-4xl font-black uppercase italic italic mb-4">
                Verification Sent
              </h2>
              <p className="text-white/40 text-sm mb-10">
                Check your email to verify your restaurant account.
              </p>
              <Link
                to="/login"
                className="px-12 py-5 rounded-full bg-white text-black font-black uppercase tracking-widest text-[10px] no-underline"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
