import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRestaurant } from "../context/RestaurantContext";
import QRCode from "qrcode";

const QRTab = () => {
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";
  const name = profile?.name || restaurantId;

  const [dataUrl, setDataUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const menuUrl = `${baseUrl}/${restaurantId}/menu`;

  useEffect(() => {
    QRCode.toDataURL(menuUrl, {
      width: 500,
      margin: 3,
      color: { dark: accent, light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).then((url) => {
      setDataUrl(url);
      setLoading(false);
    });
  }, [menuUrl, accent]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${restaurantId}-menu-qr.png`;
    a.click();
  };

  return (
    <div className="max-w-md">
      <div className="bg-[#111111] border border-white/5 p-8 flex flex-col items-center gap-6">
        {/* Accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 hidden" />

        <div className="text-center">
          <h3 className="text-white font-bold text-base mb-1">
            {name} — Menu QR Code
          </h3>
          <p className="text-white/30 text-xs">
            Place this on your tables. Customers scan to view the menu and place
            their order. They'll enter their table number manually on the order
            form.
          </p>
        </div>

        {/* QR code */}
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          {loading ? (
            <div className="w-48 h-48 flex items-center justify-center">
              <div
                className="w-8 h-8 border-2 border-white/20 rounded-full animate-spin"
                style={{ borderTopColor: accent }}
              />
            </div>
          ) : (
            <img
              src={dataUrl}
              alt="Menu QR Code"
              className="w-48 h-48 object-contain"
            />
          )}
        </div>

        {/* URL label */}
        <p
          className="font-mono text-xs text-center break-all px-2"
          style={{ color: accent }}
        >
          {menuUrl}
        </p>

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3.5 rounded-full transition-all cursor-pointer border-none disabled:opacity-40"
          style={{ background: accent }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
              strokeLinecap="round"
            />
          </svg>
          Download PNG
        </button>

        {/* Print tip */}
        <p className="text-white/20 text-[10px] text-center leading-relaxed">
          Print at 5×5cm or larger for best scan results. Laminate and place on
          each table.
        </p>
      </div>
    </div>
  );
};

export default QRTab;
