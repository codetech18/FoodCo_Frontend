import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { getOrderId, clearOrderId } from "../utils/orderCache";

const STATUS_LABELS = {
  pending: {
    color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
    dot: "bg-yellow-400 animate-pulse",
  },
  in_progress: {
    color: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    dot: "bg-blue-400 animate-pulse",
  },
  ready: {
    color: "bg-[#fa5631]/20 border-[#fa5631]/30 text-[#fa5631]",
    dot: "bg-[#fa5631] animate-pulse",
  },
  completed: {
    color: "bg-green-500/20 border-green-500/30 text-green-400",
    dot: "bg-green-400",
  },
};

const ActiveOrderBanner = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = getOrderId();
    if (!id) return;
    setOrderId(id);

    const unsub = onSnapshot(
      doc(db, "restaurants", restaurantId, "orders", id),
      (snap) => {
        if (!snap.exists()) {
          clearOrderId();
          setVisible(false);
          return;
        }
        const data = snap.data();
        setStatus(data.status);
        setCustomerName(data.customerName || "");

        if (data.status === "completed") {
          setVisible(true);
          setTimeout(() => {
            clearOrderId();
            setVisible(false);
          }, 10000);
        } else {
          setVisible(true);
        }
      },
    );

    return unsub;
  }, []);

  if (!visible || !orderId || !status) return null;

  const cfg = STATUS_LABELS[status] || STATUS_LABELS.pending;

  const message =
    status === "completed"
      ? `Your order has been served. Enjoy your meal, ${customerName}! 🎉`
      : status === "ready"
        ? `Your order is ready! A waiter is bringing it to your table.`
        : status === "in_progress"
          ? `Your order is being prepared right now...`
          : `Your order is pending — waiting to be prepared.`;

  return (
    <>
      {/* Fixed banner just below the navbar */}
      <div
        className={`fixed top-20 left-0 right-0 z-[55] border-b px-6 py-3 flex items-center justify-between gap-4 ${cfg.color}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <p className="text-sm font-semibold truncate">{message}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {status !== "completed" && (
            <button
              onClick={() => navigate(`/${restaurantId}/track/${orderId}`)}
              className="text-xs font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer rounded-full"
            >
              Track Order →
            </button>
          )}
        </div>
      </div>

      {/* Spacer so page content doesn't hide under the fixed banner */}
      <div className="h-12" />
    </>
  );
};

export default ActiveOrderBanner;
