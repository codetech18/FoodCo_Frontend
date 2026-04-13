import React, { useState } from "react";
import orderImg from "../../assets/image/pg.png";
import axios from "axios";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate, useParams } from "react-router-dom";
import { useListItemsAndTotalPrice } from "../../Context";
import { useOrder } from "../../Context2";
import { saveOrderId } from "../../utils/orderCache";
import { useRestaurant } from "../../context/RestaurantContext";

// ─── Success Modal ─────────────────────────────────────────────────────────────
const SuccessModal = ({ name, orderId, onClose, accent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 bg-[#111111] border border-white/10 w-full max-w-md p-8 shadow-2xl animate-fadeIn">
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
          }}
        />

        {/* Check icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border"
            style={{ background: `${accent}26`, borderColor: `${accent}4d` }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: accent }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M20 6L9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h3 className="font-display text-3xl font-black text-white text-center mb-2">
          Order Placed!
        </h3>
        <p className="text-white/50 text-center text-sm leading-relaxed mb-1">
          Thank you, <span className="text-white font-semibold">{name}</span>!
          🎉
        </p>
        <p className="text-white/40 text-center text-sm leading-relaxed mb-6">
          Your order has been received. Save your Order ID to track it anytime.
        </p>

        {/* Order ID box */}
        <div className="bg-[#1a1a1a] border border-white/10 p-4 mb-6">
          <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-2">
            Your Order ID
          </p>
          <div className="flex items-center gap-3">
            <span className="text-white font-mono text-sm flex-1 truncate">
              {orderId}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border transition-all cursor-pointer ${
                copied
                  ? "bg-green-500/20 border-green-500/30 text-green-400"
                  : "bg-transparent border-white/15 text-white/60 hover:text-white hover:border-white/30"
              }`}
            >
              {copied ? (
                <>
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-white/20 text-[10px] mt-2">
            Save this ID — you'll need it to track your order.
          </p>
        </div>

        <div className="h-px bg-white/5 mb-6" />
        <div className="flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full text-white font-bold py-3.5 rounded-full transition-all duration-300 cursor-pointer border-none flex items-center justify-center gap-2"
            style={{ background: accent }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Track My Order
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <p className="text-white/25 text-xs text-center">
            A confirmation has been sent to your email.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Order Component ──────────────────────────────────────────────────────────
const Order = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState("");
  const [table, setTable] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const [orderId, setOrderId] = useState(null);

  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";

  const { listItemsAndTotalPrice } = useListItemsAndTotalPrice();
  const { orderItem, quantities, clearOrder } = useOrder();

  const formatOrderItems = () => {
    const grouped = {};
    orderItem.forEach((item) => {
      grouped[item.name] = (grouped[item.name] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(
        ([n, qty]) =>
          `${qty}x ${n}: ₦${parseFloat(quantities[n]?.price || 0) * qty}`,
      )
      .join("\n");
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(quantities).forEach(([, { price, qty }]) => {
      total += parseFloat(price) * qty;
    });
    return total;
  };

  const formattedItems = formatOrderItems();
  const totalValue = calculateTotal();
  const totalPrice = totalValue.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  });

  const saveOrderToFirestore = async () => {
    const items = Object.entries(quantities).map(([name, { price, qty }]) => ({
      name,
      price: parseFloat(price),
      qty,
    }));
    const docRef = await addDoc(
      collection(db, "restaurants", restaurantId, "orders"),
      {
        customerName: name,
        email,
        table,
        allergies,
        items,
        total: totalValue,
        status: "pending",
        createdAt: serverTimestamp(),
      },
    );
    return docRef.id;
  };

  const sendMail = () => {
    axios
      .get("https://foodco-backend.onrender.com", {
        params: {
          email,
          subject: name,
          message: `\n${formattedItems}\n\nTotal Price: ₦${totalPrice}`,
          order1: allergies,
          table,
        },
      })
      .catch((err) => console.error("Email error:", err));
  };

  const handleSubmit = async () => {
    if (!name) return window.alert("Please enter your name.");
    if (!email) return window.alert("Please enter your email.");
    if (!allergies)
      return window.alert("Please enter allergies or type 'none'.");
    if (!table) return window.alert("Please enter your table number.");
    if (orderItem.length === 0)
      return window.alert("Please add items to your order first.");
    try {
      const id = await saveOrderToFirestore();
      sendMail();
      setOrderId(id);
      saveOrderId(id);
      setConfirmedName(name);
      setName("");
      setEmail("");
      setAllergies("");
      setTable("");
      clearOrder();
      setShowModal(true);
    } catch (err) {
      console.error("Order save error:", err);
      window.alert("Something went wrong. Please try again.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (orderId) navigate(`/${restaurantId}/track/${orderId}`);
  };

  const inputCls =
    "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/25 text-sm px-4 py-3 focus:outline-none transition-colors";
  const labelCls =
    "block text-white/40 text-xs font-semibold tracking-widest uppercase mb-2";
  const totalCount = Object.values(quantities).reduce(
    (s, { qty }) => s + qty,
    0,
  );

  return (
    <>
      {showModal && (
        <SuccessModal
          name={confirmedName}
          orderId={orderId}
          onClose={handleModalClose}
          accent={accent}
        />
      )}

      <section
        id="Order"
        className="bg-[#111111] py-28 relative overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${accent}4d, transparent)`,
          }}
        />
        <div
          className="absolute top-1/2 right-0 w-96 h-96 blur-3xl pointer-events-none"
          style={{ background: `${accent}0a` }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="hidden lg:flex items-center justify-center">
              <img
                src={orderImg}
                alt="Order"
                loading="lazy"
                className="w-full max-w-md drop-shadow-2xl"
                style={{ filter: `drop-shadow(0 20px 60px ${accent}26)` }}
              />
            </div>

            {/* Form */}
            <div>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5"
                style={{ color: accent }}
              >
                <span className="w-8 h-px" style={{ background: accent }} />
                Place your order
              </div>
              <h2 className="font-display text-5xl lg:text-6xl font-black text-white leading-none mb-10">
                <span className="italic" style={{ color: accent }}>
                  Order
                </span>{" "}
                Now
              </h2>

              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className={inputCls}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={(e) =>
                      (e.target.style.borderColor = `${accent}99`)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className={inputCls}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) =>
                      (e.target.style.borderColor = `${accent}99`)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Table Number</label>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      className={inputCls}
                      value={table}
                      onChange={(e) => setTable(e.target.value)}
                      onFocus={(e) =>
                        (e.target.style.borderColor = `${accent}99`)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Allergies</label>
                    <input
                      type="text"
                      placeholder="None or specify"
                      className={inputCls}
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      onFocus={(e) =>
                        (e.target.style.borderColor = `${accent}99`)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                      }
                    />
                  </div>
                </div>

                {/* Order summary */}
                <div>
                  <label className={labelCls}>
                    Your Order{" "}
                    <span className="normal-case font-normal tracking-normal text-white/25">
                      ({totalCount} item{totalCount !== 1 ? "s" : ""})
                    </span>
                  </label>
                  {totalCount > 0 ? (
                    <div className="bg-[#1a1a1a] border border-white/10 p-4 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <span className="text-white/20 text-[10px] font-semibold tracking-widest uppercase flex-1">
                          Item
                        </span>
                        <span className="text-white/20 text-[10px] font-semibold tracking-widest uppercase w-20 text-center">
                          Rate
                        </span>
                        <span className="text-white/20 text-[10px] font-semibold tracking-widest uppercase w-8 text-center">
                          Qty
                        </span>
                        <span className="text-white/20 text-[10px] font-semibold tracking-widest uppercase w-20 text-right">
                          Amount
                        </span>
                      </div>
                      {Object.entries(quantities).map(
                        ([itemName, { price, qty }]) => (
                          <div
                            key={itemName}
                            className="flex items-center justify-between py-0.5"
                          >
                            <span className="text-white/70 text-xs flex-1 pr-2 truncate">
                              {itemName}
                            </span>
                            <span className="text-white/35 text-xs w-20 text-center">
                              ₦{parseFloat(price).toLocaleString()}
                            </span>
                            <span className="text-white/50 text-xs w-8 text-center">
                              ×{qty}
                            </span>
                            <span className="text-white/60 text-xs w-20 text-right font-medium">
                              ₦{(parseFloat(price) * qty).toLocaleString()}
                            </span>
                          </div>
                        ),
                      )}
                      <div className="pt-2 mt-1 border-t border-white/10 flex justify-between">
                        <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">
                          Total
                        </span>
                        <span
                          className="font-bold text-sm"
                          style={{ color: accent }}
                        >
                          ₦{totalPrice}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#1a1a1a] border border-white/10 p-4 text-white/25 text-sm text-center">
                      No items added yet — visit the menu above
                    </div>
                  )}
                </div>

                {totalCount === 0 && (
                  <div
                    className="p-4 text-sm border"
                    style={{
                      background: `${accent}1a`,
                      borderColor: `${accent}33`,
                      color: accent,
                    }}
                  >
                    Scroll up to the <strong>Menu</strong> section to add items
                    first.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full text-white font-bold py-4 rounded-full transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] tracking-wide cursor-pointer border-none"
                  style={{ background: accent }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Confirm Order
                  {totalCount > 0 && (
                    <span className="ml-2 bg-white/20 text-xs font-black px-2 py-0.5 rounded-full">
                      {totalCount} item{totalCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Order;
