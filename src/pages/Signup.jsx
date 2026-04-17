import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase"; // Adjust path to your firebase config

const Signup = () => {
  const navigate = useNavigate();
  const accent = "#fa5631";

  // --- State ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    tagline: "",
    accentColor: "#fa5631",
    logoUrl: "",
  });

  // --- Helper: Slug Generation ---
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const slug = generateSlug(formData.name);

  // --- Logic: Handle Logo Upload (Cloudinary Example) ---
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "your_preset"); // Replace with your preset

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
        {
          method: "POST",
          body: data,
        },
      );
      const fileData = await res.json();
      setFormData({ ...formData, logoUrl: fileData.secure_url });
    } catch (err) {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  // --- Logic: Main Signup & Database Sync ---
  const handleSignup = async (e) => {
    e.preventDefault();
    if (uploadingLogo) return;
    setLoading(true);
    setError("");

    try {
      // 1. Check for Slug Collision (Does restaurant already exist?)
      const slugRef = doc(db, "restaurants", slug);
      const slugSnap = await getDoc(slugRef);

      if (slugSnap.exists()) {
        setLoading(false);
        return setError(
          "This restaurant name is already taken. Please try a different name.",
        );
      }

      // 2. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const newUser = userCredential.user;

      // 3. Nested Try-Catch for Firestore (The Rollback Logic)
      try {
        await sendEmailVerification(newUser);

        // Map UID to Restaurant Slug
        await setDoc(doc(db, "users", newUser.uid), {
          restaurantId: slug,
          email: formData.email,
          role: "owner",
          createdAt: serverTimestamp(),
        });

        // Initialize Restaurant Profile
        await setDoc(doc(db, "restaurants", slug, "profile", "info"), {
          restaurantId: slug,
          ownerUid: newUser.uid,
          name: formData.name,
          email: formData.email,
          tagline: formData.tagline,
          accentColor: formData.accentColor,
          logoUrl: formData.logoUrl,
          status: "active",
          createdAt: serverTimestamp(),
        });

        setStep(4); // Move to success step
      } catch (firestoreErr) {
        // ROLLBACK: If DB fails, delete the newly created Auth user
        if (newUser) await deleteUser(newUser);
        throw new Error("Account synchronization failed. Please try again.");
      }
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
      {/* Top Bar */}
      <nav className="p-6">
        <span className="font-display text-2xl font-black text-white italic">
          SERVRR
        </span>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Progress Indicator */}
          {step < 4 && (
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-[#fa5631]" : "bg-white/10"}`}
                />
              ))}
            </div>
          )}

          {step === 1 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="font-display text-4xl font-black uppercase italic tracking-tighter mb-2">
                Create Account
              </h1>
              <p className="text-white/40 text-sm mb-8">
                Start your 14-day free trial. No credit card required.
              </p>

              <div className="space-y-4">
                <Input
                  label="Restaurant Name"
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  placeholder="e.g. The Golden Grill"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(v) => setFormData({ ...formData, email: v })}
                  placeholder="owner@restaurant.com"
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(v) => setFormData({ ...formData, password: v })}
                  placeholder="••••••••"
                />
                <button
                  disabled={
                    !formData.name ||
                    !formData.email ||
                    formData.password.length < 6
                  }
                  onClick={() => setStep(2)}
                  className="w-full py-4 mt-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-white/90 transition-all disabled:opacity-20"
                >
                  Continue to Branding
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="font-display text-4xl font-black uppercase italic tracking-tighter mb-2">
                Your Brand
              </h1>
              <p className="text-white/40 text-sm mb-8">
                Customize how customers see your digital menu.
              </p>

              <div className="space-y-4">
                <Input
                  label="Tagline"
                  value={formData.tagline}
                  onChange={(v) => setFormData({ ...formData, tagline: v })}
                  placeholder="e.g. Authentic Italian Cuisine"
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                    Accent Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accentColor: e.target.value,
                        })
                      }
                      className="w-12 h-12 bg-transparent border-none cursor-pointer"
                    />
                    <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl flex items-center px-4 text-xs font-mono text-white/60">
                      {formData.accentColor.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                    Restaurant Logo
                  </label>
                  <label className="block w-full cursor-pointer group">
                    <div className="w-full bg-[#1a1a1a] border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center group-hover:border-white/20 transition-all">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo"
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <>
                          <svg
                            className="w-6 h-6 text-white/20 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                            {uploadingLogo ? "Uploading..." : "Upload PNG/JPG"}
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleLogoUpload}
                      accept="image/*"
                    />
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-[2] py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px]"
                  >
                    Review
                  </button>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="animate-in fade-in zoom-in-95 duration-500">
              <h1 className="font-display text-4xl font-black uppercase italic tracking-tighter mb-2">
                Confirm
              </h1>
              <p className="text-white/40 text-sm mb-8">
                Ready to launch {formData.name}?
              </p>

              <div className="bg-[#111] border border-white/5 rounded-3xl p-6 mb-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-white/20">
                    URL
                  </span>
                  <span className="text-xs font-mono text-[#fa5631]">
                    servrr.com/{slug}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-white/20">
                    Email
                  </span>
                  <span className="text-xs text-white/60">
                    {formData.email}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-[10px] font-bold uppercase text-center mb-4 italic">
                  {error}
                </p>
              )}

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full py-5 rounded-full bg-[#fa5631] text-white font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Launch My Restaurant"
                )}
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 text-[10px] font-black text-white/20 uppercase tracking-widest"
              >
                Edit Details
              </button>
            </section>
          )}

          {step === 4 && (
            <section className="text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-5xl font-black uppercase italic tracking-tighter mb-4">
                You're In.
              </h1>
              <p className="text-white/40 text-sm mb-10 leading-relaxed">
                Account created successfully. Check your email for a
                verification link to activate your dashboard.
              </p>
              <button
                onClick={() => navigate("/admin")}
                className="w-full py-5 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-xs"
              >
                Go to Dashboard
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Reusable Input Component ---
const Input = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:border-white/20 text-white placeholder:text-white/10 transition-all"
    />
  </div>
);

export default Signup;
