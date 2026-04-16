import React, { useState, useEffect } from "react";
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
  const [error, setError] = useState("");

  // Form State
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

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password)
        return "All fields are required";
      if (formData.password !== formData.confirmPassword)
        return "Passwords do not match";
    }
    if (step === 2) {
      if (!formData.tagline || !formData.description)
        return "Please add branding details";
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
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      await sendEmailVerification(user);

      // Save User Doc
      await setDoc(doc(db, "users", user.uid), {
        restaurantId: slug,
        email: formData.email,
        role: "owner",
      });

      // Save Restaurant Profile
      await setDoc(doc(db, "restaurants", slug, "profile", "info"), {
        ...formData,
        restaurantId: slug,
        ownerUid: user.uid,
        createdAt: serverTimestamp(),
      });

      setStep(4);
    } catch (err) {
      setError(err.message);
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
          className="relative z-10 font-display text-2xl font-black italic"
        >
          SERVRR
        </Link>

        <div className="relative z-10">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((i) => (
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
          <h1 className="font-display text-4xl font-black uppercase italic leading-none mb-4">
            {step === 1
              ? "The Foundation"
              : step === 2
                ? "The Identity"
                : "The Connection"}
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            {step === 1
              ? "Set up your secure owner account and claim your custom restaurant URL."
              : step === 2
                ? "Choose your colors and upload your logo to make the system truly yours."
                : "Add your contact details so customers know where to find you."}
          </p>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/5 p-4 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
            Live URL Preview
          </p>
          <p className="font-mono text-xs truncate" style={{ color: accent }}>
            servrr.com/{slug || "your-restaurant"}
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg py-12">
          {step < 4 ? (
            <form onSubmit={handleSignup} className="space-y-8 transition-all">
              {error && (
                <div className="text-red-500 text-[10px] font-black uppercase tracking-widest">
                  {error}
                </div>
              )}

              {/* STEP 1: ACCOUNT */}
              {step === 1 && (
                <div className="space-y-6">
                  <Input
                    label="Restaurant Name"
                    value={formData.name}
                    onChange={(v) => updateField("name", v)}
                    placeholder="Big Belly Burger"
                  />
                  <Input
                    label="Business Email"
                    type="email"
                    value={formData.email}
                    onChange={(v) => updateField("email", v)}
                    placeholder="hello@burger.com"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={(v) => updateField("password", v)}
                    />
                    <Input
                      label="Confirm"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(v) => updateField("confirmPassword", v)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: BRANDING */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden bg-[#1a1a1a]">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) =>
                          updateField("accentColor", e.target.value)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div
                        className="w-10 h-10 rounded-full shadow-lg"
                        style={{ backgroundColor: accent }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Accent Color</p>
                      <p className="text-xs text-white/30">
                        Click swatch to pick your brand color.
                      </p>
                    </div>
                  </div>
                  <Input
                    label="One-line Tagline"
                    value={formData.tagline}
                    onChange={(v) => updateField("tagline", v)}
                    placeholder="The best burgers in Brooklyn."
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm h-32"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: CONTACT */}
              {step === 3 && (
                <div className="space-y-6">
                  <Input
                    label="Physical Address"
                    value={formData.address}
                    onChange={(v) => updateField("address", v)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
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

              <div className="flex gap-4 pt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-8 py-5 rounded-full font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-white/5"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-5 rounded-full font-black uppercase tracking-widest text-[10px]"
                    style={{ backgroundColor: accent }}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-5 rounded-full font-black uppercase tracking-widest text-[10px]"
                    style={{ backgroundColor: accent }}
                  >
                    {loading ? "Creating..." : "Launch Restaurant"}
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* STEP 4: SUCCESS */
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10"
                style={{
                  backgroundColor: `${accent}20`,
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
              <h2 className="font-display text-4xl font-black italic uppercase tracking-tighter">
                Check your Email
              </h2>
              <p className="text-white/40 text-sm max-w-sm mx-auto">
                We've sent a verification link to{" "}
                <span className="text-white font-bold">{formData.email}</span>.
                Please verify to activate your dashboard.
              </p>
              <div className="pt-10">
                <Link
                  to="/login"
                  className="px-10 py-5 rounded-full bg-white text-black font-black uppercase tracking-widest text-[10px] no-underline"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all"
    />
  </div>
);

export default Signup;
