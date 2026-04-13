import { useParams } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/config";

const CATEGORIES = ["Mains", "Drinks", "Breakfast"];
const EMPTY_FORM = {
  name: "",
  price: "",
  description: "",
  category: "Mains",
  imageUrl: "",
  available: true,
};

const labelCls =
  "block text-white/40 text-[10px] font-semibold tracking-widest uppercase mb-1.5";
const inputCls =
  "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 text-sm px-3 py-2.5 focus:outline-none focus:border-[#fa5631]/60 transition-colors";

const uploadToCloudinary = async (file, onProgress) => {
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

const MenuTab = () => {
  const { restaurantId } = useParams();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imageMode, setImageMode] = useState("upload");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(
      collection(db, "restaurants", restaurantId, "menu"),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setDishes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Menu fetch error:", err);
        setLoading(false);
      },
    );
    return unsub;
  }, [restaurantId]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setImageMode("upload");
    setUploadProgress(0);
    setShowForm(true);
  };

  const openEdit = (dish) => {
    setForm({
      name: dish.name || "",
      price: dish.price || "",
      description: dish.description || "",
      category: dish.category || "Mains",
      imageUrl: dish.imageUrl || "",
      available: dish.available !== false,
    });
    setEditingId(dish.id);
    setImageFile(null);
    setImagePreview(dish.imageUrl || "");
    setImageMode(dish.imageUrl ? "url" : "upload");
    setUploadProgress(0);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setUploadProgress(0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return alert("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return alert("Image must be under 5MB.");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      let finalImageUrl = form.imageUrl;
      if (imageMode === "upload" && imageFile) {
        setUploading(true);
        finalImageUrl = await uploadToCloudinary(imageFile, setUploadProgress);
        setUploading(false);
      }
      const data = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        description: form.description.trim(),
        category: form.category,
        imageUrl: finalImageUrl || "",
        available: form.available,
      };
      if (editingId) {
        await updateDoc(
          doc(db, "restaurants", restaurantId, "menu", editingId),
          data,
        );
      } else {
        await addDoc(collection(db, "restaurants", restaurantId, "menu"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      closeForm();
    } catch (err) {
      console.error(err);
      alert("Error saving dish: " + err.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const toggleAvailable = async (dish) => {
    await updateDoc(doc(db, "restaurants", restaurantId, "menu", dish.id), {
      available: !dish.available,
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "restaurants", restaurantId, "menu", id));
    setDeleteConfirm(null);
  };

  const filtered = dishes
    .filter((d) => filterCat === "All" || d.category === filterCat)
    .filter((d) => d.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#fa5631] rounded-full animate-spin" />
      </div>
    );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                filterCat === cat
                  ? "bg-[#fa5631] border-[#fa5631] text-white"
                  : "bg-transparent border-white/10 text-white/40 hover:text-white hover:border-white/30"
              }`}
            >
              {cat}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 text-xs px-3 py-1.5 focus:outline-none focus:border-[#fa5631]/40 transition-colors w-40"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#fa5631] hover:bg-[#e04420] text-white text-xs font-bold px-4 py-2.5 transition-all cursor-pointer border-none"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add Dish
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Dishes", val: dishes.length },
          {
            label: "Available",
            val: dishes.filter((d) => d.available !== false).length,
          },
          {
            label: "Hidden",
            val: dishes.filter((d) => d.available === false).length,
          },
        ].map(({ label, val }) => (
          <div
            key={label}
            className="bg-[#111111] border border-white/5 px-4 py-3"
          >
            <p className="text-[#fa5631] font-black text-xl">{val}</p>
            <p className="text-white/30 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Dishes list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/20 text-sm">
          {dishes.length === 0
            ? "No dishes yet — add your first dish!"
            : "No dishes match your search."}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-white/25 text-[10px] font-semibold tracking-widest uppercase">
            <div className="col-span-1">IMG</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map((dish) => (
            <div
              key={dish.id}
              className={`bg-[#111111] border transition-all duration-200 ${
                dish.available === false
                  ? "border-white/5 opacity-60"
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              <div className="grid grid-cols-2 md:grid-cols-12 gap-3 items-center px-4 py-3">
                <div className="md:col-span-1">
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      loading="lazy"
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center text-white/20">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="md:col-span-3">
                  <p className="text-white text-sm font-semibold">
                    {dish.name}
                  </p>
                  <p className="text-white/30 text-xs truncate max-w-[180px]">
                    {dish.description}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5">
                    {dish.category}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[#fa5631] font-bold text-sm">
                    ₦{Number(dish.price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={() => toggleAvailable(dish)}
                    className={`text-xs font-semibold px-2.5 py-1 border transition-all cursor-pointer ${
                      dish.available === false
                        ? "bg-white/5 border-white/10 text-white/30 hover:text-white hover:border-white/30"
                        : "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                    }`}
                  >
                    {dish.available === false ? "Hidden" : "Available"}
                  </button>
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEdit(dish)}
                    className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-[#fa5631] hover:bg-[#fa5631]/10 transition-all cursor-pointer bg-transparent border-none"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(dish.id)}
                    className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer bg-transparent border-none"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeForm}
          />
          <div className="relative z-10 bg-[#111111] border border-white/10 w-full max-w-lg p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#fa5631] to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-base">
                {editingId ? "Edit Dish" : "Add New Dish"}
              </h3>
              <button
                onClick={closeForm}
                className="text-white/30 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={labelCls}>Dish Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  placeholder="e.g. Jollof Rice"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Price (₦) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.price}
                    placeholder="5000"
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, category: e.target.value }))
                    }
                    className={inputCls + " cursor-pointer"}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  placeholder="Brief description of the dish..."
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className={inputCls + " resize-none"}
                />
              </div>
              <div>
                <label className={labelCls}>Dish Image</label>
                <div className="flex gap-2 mb-3">
                  {["upload", "url"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setImageMode(mode);
                        setImageFile(null);
                        setImagePreview(mode === "url" ? form.imageUrl : "");
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                        imageMode === mode
                          ? "bg-[#fa5631] border-[#fa5631] text-white"
                          : "bg-transparent border-white/10 text-white/40 hover:text-white"
                      }`}
                    >
                      {mode === "upload" ? "⬆ Upload File" : "🔗 Image URL"}
                    </button>
                  ))}
                </div>
                {imageMode === "upload" ? (
                  <div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-white/15 hover:border-[#fa5631]/50 bg-[#1a1a1a] p-6 text-center cursor-pointer transition-all"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="mx-auto max-h-32 object-contain mb-2"
                        />
                      ) : (
                        <div className="text-white/20">
                          <svg
                            className="w-8 h-8 mx-auto mb-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <p className="text-xs">Click to choose an image</p>
                          <p className="text-[10px] mt-1 text-white/10">
                            JPG, PNG, WEBP — max 5MB
                          </p>
                        </div>
                      )}
                      {imageFile && (
                        <p className="text-[#fa5631] text-xs mt-2 truncate">
                          {imageFile.name}
                        </p>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {uploading && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-white/40 mb-1">
                          <span>Uploading to Cloudinary...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1 bg-white/10">
                          <div
                            className="h-1 bg-[#fa5631] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={form.imageUrl}
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => {
                        setForm((p) => ({ ...p, imageUrl: e.target.value }));
                        setImagePreview(e.target.value);
                      }}
                      className={inputCls}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="preview"
                        onError={() => setImagePreview("")}
                        className="mt-2 h-24 w-full object-cover opacity-70"
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, available: !p.available }))
                  }
                  className={`relative w-10 h-5 rounded-full transition-all cursor-pointer border-none ${form.available ? "bg-[#fa5631]" : "bg-white/10"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.available ? "left-5" : "left-0.5"}`}
                  />
                </button>
                <span className="text-white/50 text-sm">
                  {form.available ? "Available on menu" : "Hidden from menu"}
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 bg-transparent border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-sm font-semibold py-3 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-[#fa5631] hover:bg-[#e04420] disabled:opacity-50 text-white text-sm font-bold py-3 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {saving || uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "Add Dish"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative z-10 bg-[#111111] border border-white/10 w-full max-w-sm p-7">
            <h3 className="text-white font-bold text-base mb-2">
              Delete dish?
            </h3>
            <p className="text-white/40 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-transparent border border-white/10 text-white/50 hover:text-white text-sm font-semibold py-2.5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2.5 transition-all cursor-pointer border-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuTab;
