import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRestaurant } from "../context/RestaurantContext";
import { useAuth } from "./AuthContext";
import QRCode from "qrcode";

const BASE_URL = import.meta.env.VITE_APP_URL || window.location.origin;
const API_BASE =
  import.meta.env.VITE_BACKEND_URL || "https://foodco-backend.onrender.com";

const QRTab = () => {
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();
  const { admin } = useAuth();
  const accent = profile?.accentColor || "#fa5631";

  const [tableCount, setTableCount] = useState(10);
  const [tokens, setTokens] = useState({}); // { tableNum: token }
  const [dataUrls, setDataUrls] = useState({}); // { tableNum: dataUrl }
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Fetch (and cache) the permanent token for any table not already known
  useEffect(() => {
    if (!restaurantId || !admin) return;
    const missing = [];
    for (let t = 1; t <= tableCount; t++) {
      if (!tokens[t]) missing.push(t);
    }
    if (missing.length === 0) return;

    let cancelled = false;
    setLoadingTokens(true);
    (async () => {
      const idToken = await admin.getIdToken();
      const results = {};
      for (const t of missing) {
        try {
          const res = await fetch(
            `${API_BASE}/table-token?restaurantId=${encodeURIComponent(restaurantId)}&table=${encodeURIComponent(t)}`,
            { headers: { Authorization: `Bearer ${idToken}` } },
          );
          const data = await res.json();
          if (res.ok) results[t] = data.token;
        } catch {
          // leave missing — grid will show a spinner for this table
        }
      }
      if (!cancelled) {
        setTokens((prev) => ({ ...prev, ...results }));
        setLoadingTokens(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, admin, tableCount, tokens]);

  // Re-render QR images whenever tokens or the accent color change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = {};
      for (let t = 1; t <= tableCount; t++) {
        if (!tokens[t]) continue;
        const url = `${BASE_URL}/${restaurantId}/menu?table=${t}&token=${tokens[t]}`;
        results[t] = await QRCode.toDataURL(url, {
          width: 500,
          margin: 3,
          color: { dark: accent, light: "#ffffff" },
          errorCorrectionLevel: "H",
        });
      }
      if (!cancelled) setDataUrls(results);
    })();
    return () => {
      cancelled = true;
    };
  }, [tokens, accent, tableCount, restaurantId]);

  const download = (tableNum) => {
    const a = document.createElement("a");
    a.href = dataUrls[tableNum];
    a.download = `${restaurantId}-table-${tableNum}-qr.png`;
    a.click();
  };

  const downloadAll = () => {
    Object.keys(dataUrls).forEach((t, i) => {
      setTimeout(() => download(Number(t)), i * 150);
    });
  };

  const generating = loadingTokens || Object.keys(dataUrls).length === 0;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Info banner */}
      <div className="bg-[#111111] border border-white/5 p-5 flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}20` }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: accent }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm mb-1">
            Verified Table QR Codes
          </p>
          <p className="text-white/40 text-xs leading-relaxed">
            Each QR code contains a permanent, secure table token. Customers
            can only place orders after scanning a valid QR code at your
            restaurant — print these once, they never expire or need
            reprinting.
          </p>
        </div>
      </div>

      {/* Table count + actions */}
      <div className="bg-[#111111] border border-white/5 p-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[140px] max-w-[200px]">
            <label className="block text-white/40 text-[10px] font-semibold tracking-widest uppercase mb-1.5">
              Number of Tables
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={tableCount}
              onChange={(e) =>
                setTableCount(
                  Math.min(100, Math.max(1, Number(e.target.value))),
                )
              }
              className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm px-4 py-2.5 focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = `${accent}99`)}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.1)")
              }
            />
          </div>
          <button
            onClick={downloadAll}
            disabled={generating || Object.keys(dataUrls).length === 0}
            className="flex items-center gap-2 text-white text-xs font-bold px-5 py-2.5 transition-all cursor-pointer border-none disabled:opacity-40"
            style={{ background: accent }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <svg
              className="w-3.5 h-3.5"
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
            Download All ({tableCount})
          </button>
        </div>
        <p className="text-white/20 text-[10px] mt-3">
          Each table's QR code is permanent — print once and reuse indefinitely.
        </p>
      </div>

      {/* QR Grid */}
      {generating ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <div
            className="w-5 h-5 border-2 border-white/10 rounded-full animate-spin"
            style={{ borderTopColor: accent }}
          />
          <span className="text-white/30 text-sm">Generating QR codes...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: tableCount }, (_, i) => i + 1).map(
            (tableNum) => (
              <div
                key={tableNum}
                className="bg-[#111111] border border-white/5 p-4 flex flex-col items-center gap-3"
              >
                <p className="text-white font-bold text-xs">Table {tableNum}</p>
                <div className="bg-white p-2.5 rounded-xl">
                  {dataUrls[tableNum] ? (
                    <img
                      src={dataUrls[tableNum]}
                      alt={`Table ${tableNum}`}
                      className="w-28 h-28 object-contain"
                    />
                  ) : (
                    <div className="w-28 h-28 flex items-center justify-center">
                      <div
                        className="w-5 h-5 border-2 border-white/20 rounded-full animate-spin"
                        style={{ borderTopColor: accent }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => download(tableNum)}
                  disabled={!dataUrls[tableNum]}
                  className="w-full text-white text-[10px] font-bold py-2 transition-all cursor-pointer border-none disabled:opacity-40 rounded-full"
                  style={{ background: accent }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Download
                </button>
              </div>
            ),
          )}
        </div>
      )}

      {/* Print tip */}
      <div className="bg-[#111111] border border-white/5 p-5 flex items-start gap-3">
        <svg
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: accent }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-white/30 text-xs leading-relaxed">
          Print at 5×5cm or larger. Laminate and place one on each table. Each
          code is unique to its table number so orders are always correctly
          attributed.
        </p>
      </div>
    </div>
  );
};

export default QRTab;
