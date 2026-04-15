import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .slice(0, 20);

const uploadToCloudinary = (file, onProgress) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      if (res.secure_url) resolve(res.secure_url);
      else reject(new Error(res.error?.message || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
};

const STEP_LABELS = ["Account", "Branding", "Contact", "Done"];

const Steps = ({ current, accent }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEP_LABELS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all"
              style={
                done || active
                  ? { background: accent, borderColor: accent, color: "white" }
                  : {
                      background: "transparent",
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.2)",
                    }
              }
            >
              {done ? (
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className="text-[10px] font-semibold tracking-wide hidden sm:block"
              style={{
                color: active
                  ? accent
                  : done
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(255,255,255,0.2)",
              }}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className="w-12 h-0.5 mb-5 transition-all"
              style={{ background: done ? accent : "rgba(255,255,255,0.1)" }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 0 — Account
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [slug, setSlug] = useState("");

  // Step 1 — Branding
  const [accentColor, setAccentColor] = useState("#fa5631");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoProgress, setLogoProgress] = useState(0);
  const logoRef = useRef();

  // Step 2 — Contact
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputCls =
    "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 text-sm px-4 py-3 focus:outline-none transition-colors";
  const labelCls =
    "block text-white/40 text-[10px] font-semibold tracking-widest uppercase mb-1.5";

  const focusAccent = (e) => (e.target.style.borderColor = `${accentColor}99`);
  const blurReset = (e) =>
    (e.target.style.borderColor = "rgba(255,255,255,0.1)");

  const handleNameChange = (e) => {
    const val = e.target.value;
    setRestaurantName(val);
    setSlug(generateSlug(val));
    if (!contactEmail) setContactEmail(email);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return alert("Please select an image.");
    if (file.size > 5 * 1024 * 1024) return alert("Image must be under 5MB.");
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleStep0 = (e) => {
    e.preventDefault();
    setError("");
    if (!restaurantName.trim()) return setError("Restaurant name is required.");
    if (slug.length < 2) return setError("Restaurant name is too short.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    if (!contactEmail) setContactEmail(email);
    setStep(1);
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Check email uniqueness
      const emailCheck = await getDocs(
        query(collection(db, "users"), where("email", "==", email)),
      );
      if (!emailCheck.empty) {
        setError(
          "An account with this email already exists. Please log in instead.",
        );
        setLoading(false);
        return;
      }

      // Check slug availability
      const existingDoc = await getDoc(doc(db, "restaurants", slug));
      if (existingDoc.exists()) {
        setError(
          `The name "${restaurantName}" is already taken. Go back and try a different name.`,
        );
        setLoading(false);
        return;
      }

      // Upload logo
      let logoUrl = "";
      if (logoFile) {
        try {
          logoUrl = await uploadToCloudinary(logoFile, setLogoProgress);
        } catch (err) {
          console.warn("Logo upload failed:", err);
        }
      }

      // Create auth account
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Send verification email
      try {
        await sendEmailVerification(user);
      } catch (err) {
        console.warn("Verification email failed:", err);
      }

      // Create user record
      await setDoc(doc(db, "users", user.uid), {
        restaurantId: slug,
        email,
        createdAt: serverTimestamp(),
      });

      // Create restaurant workspace
      await setDoc(doc(db, "restaurants", slug, "profile", "info"), {
        name: restaurantName.trim(),
        slug,
        accentColor,
        tagline: tagline.trim(),
        description: description.trim(),
        logoUrl,
        heroImageUrl: "",
        dealImageUrl: "",
        address: address.trim(),
        phone: phone.trim(),
        contactEmail: contactEmail.trim() || email,
        instagram: instagram.trim(),
        twitter: twitter.trim(),
        createdAt: serverTimestamp(),
        ownerUid: user.uid,
      });

      setStep(3); // verify screen
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    }
    setLoading(false);
  };

  // ── Verify screen ──────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border"
            style={{
              background: `${accentColor}26`,
              borderColor: `${accentColor}4d`,
            }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: accentColor }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-black text-white mb-3">
            Check your email
          </h1>
          <p className="text-white/40 text-sm leading-relaxed mb-2">
            We sent a verification link to
          </p>
          <p className="text-white font-semibold text-sm mb-6">{email}</p>
          <p className="text-white/30 text-xs leading-relaxed mb-8">
            Click the link to verify your account, then log in to access your
            dashboard.
          </p>
          <div className="bg-[#111111] border border-white/5 p-4 mb-6 text-left">
            <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-2">
              Your restaurant URL
            </p>
            <p className="font-mono text-sm" style={{ color: accentColor }}>
              {import.meta.env.VITE_APP_URL || window.location.origin}/{slug}
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-full no-underline transition-all hover:opacity-85"
            style={{ background: accentColor }}
          >
            Go to Login
          </Link>
          <p className="text-white/20 text-xs mt-6">
            Didn't receive it? Check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-0.5 no-underline mb-6"
          >
            <span className="font-display text-2xl font-black text-white">
              SERVRR
            </span>
          </Link>
          <h1 className="font-display text-3xl font-black text-white mb-1">
            {step === 0
              ? "Create your account"
              : step === 1
                ? "Brand your restaurant"
                : "Contact & Location"}
          </h1>
          <p className="text-white/40 text-sm">
            {step === 0
              ? "Set up your digital ordering system in minutes."
              : step === 1
                ? "How your restaurant looks to customers."
                : "Help customers find and contact you."}
          </p>
        </div>

        <Steps current={step} accent={accentColor} />

        <div className="bg-[#111111] border border-white/5 p-8 relative">
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
            }}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* ── Step 0: Account ── */}
          {step === 0 && (
            <form onSubmit={handleStep0} className="space-y-5">
              <div>
                <label className={labelCls}>Restaurant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Club 701"
                  className={inputCls}
                  value={restaurantName}
                  onChange={handleNameChange}
                  onFocus={focusAccent}
                  onBlur={blurReset}
                />
                {slug && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-white/20 text-[10px]">Your URL:</span>
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: accentColor }}
                    >
                      servrr.com/<strong>{slug}</strong>
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className={labelCls}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="owner@restaurant.com"
                  className={inputCls}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={focusAccent}
                  onBlur={blurReset}
                />
              </div>
              <div>
                <label className={labelCls}>Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className={inputCls}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={focusAccent}
                  onBlur={blurReset}
                />
              </div>
              <div>
                <label className={labelCls}>Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  className={inputCls}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={focusAccent}
                  onBlur={blurReset}
                />
              </div>
              <button
                type="submit"
                className="w-full text-white font-bold py-4 rounded-full transition-all cursor-pointer border-none"
                style={{ background: accentColor }}
              >
                Continue →
              </button>
            </form>
          )}

          {/* ── Step 1: Branding ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <label className={labelCls}>Brand Colour</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-12 bg-transparent border border-white/10 cursor-pointer rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="#fa5631"
                      className={inputCls}
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      onFocus={focusAccent}
                      onBlur={blurReset}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 p-3 bg-[#1a1a1a] border border-white/5">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ background: accentColor }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: accentColor }}
                  >
                    Preview — this is your accent colour
                  </span>
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className={labelCls}>Logo (optional)</label>
                <div
                  onClick={() => logoRef.current?.click()}
                  className="border border-dashed border-white/15 bg-[#1a1a1a] p-5 text-center cursor-pointer transition-all"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = `${accentColor}66`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.15)")
                  }
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="logo preview"
                      className="mx-auto max-h-20 object-contain"
                    />
                  ) : (
                    <div className="text-white/20 text-xs">
                      <svg
                        className="w-6 h-6 mx-auto mb-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Click to upload your logo
                    </div>
                  )}
                  {logoFile && (
                    <p
                      className="text-xs mt-1 truncate"
                      style={{ color: accentColor }}
                    >
                      {logoFile.name}
                    </p>
                  )}
                </div>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                {logoProgress > 0 && logoProgress < 100 && (
                  <div className="mt-1 h-1 bg-white/10">
                    <div
                      className="h-1 transition-all"
                      style={{
                        width: `${logoProgress}%`,
                        background: accentColor,
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Tagline (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Fine dining in Abuja"
                  className={inputCls}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  onFocus={focusAccent}
                  onBlur={blurReset}
                />
              </div>
              <div>
                <label className={labelCls}>Description (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Tell customers what makes your restaurant special..."
                  className={inputCls + " resize-none"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={focusAccent}
                  onBlur={blurReset}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setError("");
                  }}
                  className="flex-1 bg-transparent border border-white/10 text-white/50 hover:text-white text-sm font-semibold py-3 rounded-full transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white font-bold py-3 rounded-full transition-all cursor-pointer border-none"
                  style={{ background: accentColor }}
                >
                  Continue →
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: Contact & Location ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelCls}>Address (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 12 Wuse 2, Abuja"
                  className={inputCls}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={focusAccent}
                  onBlur={blurReset}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Phone (optional)</label>
                  <input
                    type="text"
                    placeholder="+234 800 000 0000"
                    className={inputCls}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={focusAccent}
                    onBlur={blurReset}
                  />
                </div>
                <div>
                  <label className={labelCls}>Contact Email</label>
                  <input
                    type="email"
                    placeholder="info@restaurant.com"
                    className={inputCls}
                    value={contactEmail || email}
                    onChange={(e) => setContactEmail(e.target.value)}
                    onFocus={focusAccent}
                    onBlur={blurReset}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Instagram URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourrestaurant"
                  className={inputCls}
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  onFocus={focusAccent}
                  onBlur={blurReset}
                />
              </div>
              <div>
                <label className={labelCls}>Twitter / X URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/yourrestaurant"
                  className={inputCls}
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  onFocus={focusAccent}
                  onBlur={blurReset}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="flex-1 bg-transparent border border-white/10 text-white/50 hover:text-white text-sm font-semibold py-3 rounded-full transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 text-white font-bold py-3 rounded-full transition-all cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: accentColor }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Restaurant 🎉"
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="text-white/30 text-xs text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="hover:text-white transition-colors no-underline font-semibold"
              style={{ color: accentColor }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
