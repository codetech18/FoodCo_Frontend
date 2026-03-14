import React, { useState } from "react";
import orderImg from "../../assets/image/pg.png";
import axios from "axios";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useListItemsAndTotalPrice } from "../../Context";
import { useOrder } from "../../Context2";

// ─── Success Modal ────────────────────────────────────────────────────────────
const SuccessModal = ({ name, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div
      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative z-10 bg-[#111111] border border-white/10 w-full max-w-md p-8 shadow-2xl animate-fadeIn">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#fa5631] to-transparent" />
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-[#fa5631]/15 border border-[#fa5631]/30 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#fa5631]"
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
        Thank you, <span className="text-white font-semibold">{name}</span>! 🎉
      </p>
      <p className="text-white/40 text-center text-sm leading-relaxed mb-8">
        Your order has been received and our team will attend to you shortly.
        Sit back and enjoy!
      </p>
      <div className="h-px bg-white/5 mb-6" />
      <div className="flex flex-col gap-3">
        <button
          onClick={onClose}
          className="w-full bg-[#fa5631] hover:bg-[#e04420] text-white font-bold py-3.5 transition-all duration-300 cursor-pointer border-none"
        >
          Done
        </button>
        <p className="text-white/25 text-xs text-center">
          A confirmation has been sent to your email.
        </p>
      </div>
    </div>
  </div>
);

// ─── Order Component ──────────────────────────────────────────────────────────
const Order = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState("");
  const [table, setTable] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");

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
    await addDoc(collection(db, "orders"), {
      customerName: name,
      email,
      table,
      allergies,
      items,
      total: totalValue,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  };

  const sendMail = () => {
    axios
      //https://food-order-zmpp.onrender.com
      .get("https://foodco-backend.onrender.com", {
        params: {
          email,
          subject: name,
          message: `\n${formattedItems}\n\nTotal Price: ₦${totalPrice}`,
          order1: allergies,
          table,
        },
      })
      .then(() => console.log("Email sent"))
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
      await saveOrderToFirestore();
      sendMail();
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

  const inputCls =
    "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/25 text-sm px-4 py-3 focus:outline-none focus:border-[#fa5631]/60 transition-colors";
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
          onClose={() => setShowModal(false)}
        />
      )}

      <section
        id="Order"
        className="bg-[#111111] py-28 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fa5631]/30 to-transparent" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#fa5631]/4 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="hidden lg:flex items-center justify-center">
              <img
                src={orderImg}
                alt="Order"
                loading="lazy"
                className="w-full max-w-md drop-shadow-2xl"
                style={{
                  filter: "drop-shadow(0 20px 60px rgba(250,86,49,0.15))",
                }}
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-[#fa5631] text-xs font-semibold tracking-widest uppercase mb-5">
                <span className="w-8 h-px bg-[#fa5631]" />
                Place your order
              </div>
              <h2 className="font-display text-5xl lg:text-6xl font-black text-white leading-none mb-10">
                <span className="text-[#fa5631] italic">Order</span> Now
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
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    Your Order{" "}
                    <span className="normal-case font-normal tracking-normal text-white/25">
                      ({totalCount} item{totalCount !== 1 ? "s" : ""})
                    </span>
                  </label>
                  {totalCount > 0 ? (
                    <div className="bg-[#1a1a1a] border border-white/10 p-4 space-y-2">
                      {/* Column headers */}
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

                      {/* Line items */}
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

                      {/* Total */}
                      <div className="pt-2 mt-1 border-t border-white/10 flex justify-between">
                        <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">
                          Total
                        </span>
                        <span className="text-[#fa5631] font-bold text-sm">
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
                  <div className="bg-[#fa5631]/10 border border-[#fa5631]/20 p-4 text-[#fa5631] text-sm">
                    Scroll up to the <strong>Menu</strong> section to add items
                    first.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-[#fa5631] hover:bg-[#e04420] text-white font-bold py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] tracking-wide cursor-pointer border-none"
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
