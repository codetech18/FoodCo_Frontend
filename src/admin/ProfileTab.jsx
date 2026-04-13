import React, { useState, useRef } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
// CHANGED: removed firebase/storage imports, no longer needed
import { db } from "../firebase/config";
import { useRestaurant } from "../context/RestaurantContext";
import { useParams } from "react-router-dom";

// CHANGED: new Cloudinary upload helper (replaces uploadImage function)
const uploadToCloudinary = (file, key, onProgress) => {
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
        onProgress(key, Math.round((e.loaded / e.total) * 100));
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

const ProfileTab = () => {
  const { restaurantId } = useParams();
  const { profile, theme, toggleTheme } = useRestaurant();

  const [form, setForm] = useState({
    name: profile?.name || "",
    tagline: profile?.tagline || "",
    description: profile?.description || "",
    accentColor: profile?.accentColor || "#fa5631",
    address: profile?.address || "",
    phone: profile?.phone || "",
    contactEmail: profile?.contactEmail || "",
    instagram: profile?.instagram || "",
    twitter: profile?.twitter || "",
    dealTitle: profile?.dealTitle || "Deal Of The Day",
    dealItem: profile?.dealItem || "",
    dealFreeItem: profile?.dealFreeItem || "",
    dealDesc: profile?.dealDesc || "",
    dealBadge: profile?.dealBadge || "NEW!",
    dealTag: profile?.dealTag || "Limited Time",
    stat1Value: profile?.stat1Value || "200+",
    stat1Label: profile?.stat1Label || "Menu Items",
    stat2Value: profile?.stat2Value || "5K+",
    stat2Label: profile?.stat2Label || "Happy Customers",
    stat3Value: profile?.stat3Value || "4.9★",
    stat3Label: profile?.stat3Label || "Rating",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(profile?.logoUrl || "");
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(profile?.heroImageUrl || "");
  const [dealFile, setDealFile] = useState(null);
  const [dealPreview, setDealPreview] = useState(profile?.dealImageUrl || "");
  const [uploadProgress, setUploadProgress] = useState({});

  const logoRef = useRef();
  const heroRef = useRef();
  const dealRef = useRef();

  // CHANGED: helper now updates progress by key
  const onProgress = (key, pct) =>
    setUploadProgress((prev) => ({ ...prev, [key]: pct }));

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return alert("Please select an image.");
    if (file.size > 5 * 1024 * 1024) return alert("Image must be under 5MB.");
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let logoUrl = profile?.logoUrl || "";
      let heroImageUrl = profile?.heroImageUrl || "";
      let dealImageUrl = profile?.dealImageUrl || "";

      // CHANGED: upload via Cloudinary instead of Firebase Storage
      if (logoFile)
        logoUrl = await uploadToCloudinary(logoFile, "logo", onProgress);
      if (heroFile)
        heroImageUrl = await uploadToCloudinary(heroFile, "hero", onProgress);
      if (dealFile)
        dealImageUrl = await uploadToCloudinary(dealFile, "deal", onProgress);

      await setDoc(
        doc(db, "restaurants", restaurantId, "profile", "info"),
        {
          ...form,
          accentColor: form.accentColor,
          logoUrl,
          heroImageUrl,
          dealImageUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile: " + err.message);
    }
    setSaving(false);
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const inputCls =
    "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 text-sm px-3 py-2.5 focus:outline-none focus:border-[#fa5631]/60 transition-colors";
  const labelCls =
    "block text-white/40 text-[10px] font-semibold tracking-widest uppercase mb-1.5";

  const ImageUpload = ({
    label,
    file,
    preview,
    inputRef,
    onFileChange,
    progressKey,
  }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-white/15 hover:border-[#fa5631]/50 bg-[#1a1a1a] p-4 text-center cursor-pointer transition-all"
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="mx-auto max-h-24 object-contain mb-1"
          />
        ) : (
          <div className="text-white/20 text-xs py-2">Click to upload</div>
        )}
        {file && (
          <p className="text-[#fa5631] text-[10px] truncate mt-1">
            {file.name}
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      {/* CHANGED: progress bar now reads from uploadProgress[progressKey] fed by Cloudinary XHR */}
      {uploadProgress[progressKey] > 0 && uploadProgress[progressKey] < 100 && (
        <div className="mt-1 h-1 bg-white/10">
          <div
            className="h-1 bg-[#fa5631] transition-all"
            style={{ width: `${uploadProgress[progressKey]}%` }}
          />
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-8">
      {/* Branding */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Branding
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Restaurant Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Club701"
              className={inputCls}
              {...f("name")}
            />
          </div>
          <div>
            <label className={labelCls}>Accent Colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accentColor: e.target.value }))
                }
                className="w-10 h-10 bg-transparent border border-white/10 cursor-pointer rounded"
              />
              <input
                type="text"
                placeholder="#fa5631"
                className={inputCls}
                {...f("accentColor")}
              />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className={labelCls}>Tagline</label>
          <input
            type="text"
            placeholder="e.g. Fine dining in Abuja"
            className={inputCls}
            {...f("tagline")}
          />
        </div>
        <div className="mb-4">
          <label className={labelCls}>Description (shown on hero)</label>
          <textarea
            rows={3}
            placeholder="Describe your restaurant..."
            className={inputCls + " resize-none"}
            {...f("description")}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ImageUpload
            label="Logo"
            file={logoFile}
            preview={logoPreview}
            inputRef={logoRef}
            onFileChange={(e) =>
              handleFileChange(e, setLogoFile, setLogoPreview)
            }
            progressKey="logo"
          />
          <ImageUpload
            label="Hero Image (chef/food)"
            file={heroFile}
            preview={heroPreview}
            inputRef={heroRef}
            onFileChange={(e) =>
              handleFileChange(e, setHeroFile, setHeroPreview)
            }
            progressKey="hero"
          />
          <ImageUpload
            label="Deal Image"
            file={dealFile}
            preview={dealPreview}
            inputRef={dealRef}
            onFileChange={(e) =>
              handleFileChange(e, setDealFile, setDealPreview)
            }
            progressKey="deal"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Contact & Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Address</label>
            <input
              type="text"
              placeholder="e.g. 12 Wuse 2, Abuja"
              className={inputCls}
              {...f("address")}
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input
              type="text"
              placeholder="+234 800 000 0000"
              className={inputCls}
              {...f("phone")}
            />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input
              type="email"
              placeholder="info@restaurant.com"
              className={inputCls}
              {...f("contactEmail")}
            />
          </div>
          <div>
            <label className={labelCls}>Instagram URL</label>
            <input
              type="url"
              placeholder="https://instagram.com/..."
              className={inputCls}
              {...f("instagram")}
            />
          </div>
        </div>
      </div>

      {/* Deal of the Day */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Deal of the Day
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Deal Section Title</label>
            <input
              type="text"
              placeholder="Deal Of The Day"
              className={inputCls}
              {...f("dealTitle")}
            />
          </div>
          <div>
            <label className={labelCls}>Badge Text</label>
            <input
              type="text"
              placeholder="NEW!"
              className={inputCls}
              {...f("dealBadge")}
            />
          </div>
          <div>
            <label className={labelCls}>Featured Item</label>
            <input
              type="text"
              placeholder="e.g. Ramen Noodles"
              className={inputCls}
              {...f("dealItem")}
            />
          </div>
          <div>
            <label className={labelCls}>Free Item with Deal</label>
            <input
              type="text"
              placeholder="e.g. Yogurt Smoothie"
              className={inputCls}
              {...f("dealFreeItem")}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Deal Description</label>
            <textarea
              rows={3}
              placeholder="Describe this deal..."
              className={inputCls + " resize-none"}
              {...f("dealDesc")}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Hero Stats
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-2">
              <div>
                <label className={labelCls}>Stat {n} Value</label>
                <input
                  type="text"
                  placeholder="e.g. 200+"
                  className={inputCls}
                  {...f(`stat${n}Value`)}
                />
              </div>
              <div>
                <label className={labelCls}>Stat {n} Label</label>
                <input
                  type="text"
                  placeholder="e.g. Menu Items"
                  className={inputCls}
                  {...f(`stat${n}Label`)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Theme ── */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <h3 className="text-white font-bold text-sm mb-5 pb-3 border-b border-white/5">
          Display Theme
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium mb-1">
              {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </p>
            <p className="text-white/30 text-xs">
              {theme === "dark"
                ? "Dark background — easier on the eyes at night."
                : "Light background — bright and clean."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-all cursor-pointer border-none flex-shrink-0"
            style={{
              background:
                theme === "light" ? form.accentColor : "rgba(255,255,255,0.15)",
            }}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${theme === "light" ? "left-7" : "left-0.5"}`}
            />
          </button>
        </div>
      </div>

      {/* Save */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#fa5631] hover:bg-[#e04420] disabled:opacity-50 text-white font-bold py-4 rounded-full transition-all cursor-pointer border-none flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
            </svg>
            Saved!
          </>
        ) : (
          "Save Profile"
        )}
      </button>
    </form>
  );
};

export default ProfileTab;
