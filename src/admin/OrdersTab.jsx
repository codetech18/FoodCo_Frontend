import React, { useState, useEffect, useRef } from "react";
import orderImg from "../../assets/image/pg.png";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useListItemsAndTotalPrice } from "../../Context";
import { useOrder } from "../../Context2";
import { saveOrderId } from "../../utils/orderCache";
import { useRestaurant } from "../../context/RestaurantContext";
import { getTableSession } from "../../utils/tableToken";
import {
  getSession,
  saveSession,
  updateSession,
  clearSession,
} from "../../utils/tableSession";

// ─── Success Modal (unchanged, keep as is) ────────────────────────────────────
const SuccessModal = ({
  name,
  orderId,
  sessionId,
  onClose,
  onRequestBill,
  accent,
  showBillOption,
}) => {
  // ... (copy your existing SuccessModal code – no changes needed)
};

// ─── Bill Requested Screen (unchanged) ───────────────────────────────────────
const BillRequestedBanner = ({ accent, totalBill }) => {
  // ... (copy your existing BillRequestedBanner)
};

// ─── Order Component ──────────────────────────────────────────────────────────
const Order = () => {
  const { restaurantId } = useParams();
  const { profile } = useRestaurant();
  const accent = profile?.accentColor || "#fa5631";
  const paymentMode = profile?.paymentMode || "at_table";

  const tableToken = getTableSession(restaurantId);
  const tableSessionLocal = getSession(restaurantId);

  const isNewTable =
    tableToken &&
    tableSessionLocal &&
    tableToken.table !== tableSessionLocal.table;
  const activeSession = isNewTable ? null : tableSessionLocal;

  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState("");
  const [table, setTable] = useState(
    tableToken?.table ||
      activeSession?.table ||
      searchParams.get("table") ||
      "",
  );
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestingBill, setRequestingBill] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [sessionId, setSessionId] = useState(
    activeSession?.firestoreId || null,
  );
  const [sessionTotal, setSessionTotal] = useState(
    activeSession?.totalBill || 0,
  );
  const [billRequested, setBillRequested] = useState(
    activeSession?.status === "awaiting_payment",
  );
  const [sessionStatus, setSessionStatus] = useState(
    tableSessionLocal?.status || "open",
  );
  const [paymentError, setPaymentError] = useState(null);
  const [visibleError, setVisibleError] = useState("");
  const [monthOrderCount, setMonthOrderCount] = useState(null);
  const paymentSuccessRef = useRef(false);
  const paymentTimeoutRef = useRef(null);
  const isPayingRef = useRef(false);

  // (Keep all useEffect hooks exactly as in your original – just remove debug bypass ones)

  // Pre-load month order count for Starter plan
  useEffect(() => {
    if (!restaurantId || profile?.plan !== "starter") return;
    const now = new Date();
    const startOfMonth = Timestamp.fromDate(
      new Date(now.getFullYear(), now.getMonth(), 1),
    );
    getDocs(
      query(
        collection(db, "restaurants", restaurantId, "orders"),
        where("createdAt", ">=", startOfMonth),
      ),
    )
      .then((snap) => setMonthOrderCount(snap.size))
      .catch(() => {});
  }, [restaurantId, profile?.plan]);

  // Reset session when new table scanned
  useEffect(() => {
    if ((!tableSessionLocal && tableToken) || isNewTable) {
      setSessionStatus("open");
      setSessionId(null);
      setSessionTotal(0);
      setBillRequested(false);
    }
  }, [tableSessionLocal, tableToken, isNewTable]);

  // Live Firestore listener
  useEffect(() => {
    const sid = activeSession?.firestoreId || sessionId;
    if (!sid || !restaurantId) return;
    const unsub = onSnapshot(
      doc(db, "restaurants", restaurantId, "tableSessions", sid),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        setSessionStatus(data.status);
        setSessionTotal(data.totalBill || 0);
        if (data.status === "awaiting_payment") setBillRequested(true);
        if (data.status === "paid" || data.status === "closed") {
          clearSession();
          setBillRequested(false);
          setSessionStatus(data.status);
        }
      },
    );
    return unsub;
  }, [sessionId, restaurantId, activeSession]);

  const navigate = useNavigate();
  const { listItemsAndTotalPrice } = useListItemsAndTotalPrice();
  const { orderItem, quantities, clearOrder } = useOrder();

  const calculateTotal = () => {
    let total = 0;
    Object.entries(quantities).forEach(([, { price, qty }]) => {
      total += parseFloat(price) * qty;
    });
    return total;
  };
  const totalValue = calculateTotal();
  const totalPrice = totalValue.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  });
  const totalCount = Object.values(quantities).reduce(
    (s, { qty }) => s + qty,
    0,
  );

  // Helper to load Paystack script (only needed for resumeTransaction)
  const loadPaystackScript = () => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) return resolve();
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paystack SDK"));
      document.body.appendChild(script);
    });
  };

  // Open or retrieve a Firestore table session (unchanged)
  const getOrCreateSession = async (orderTotal) => {
    if (tableSessionLocal?.firestoreId) {
      const newTotal = (tableSessionLocal.totalBill || 0) + orderTotal;
      await updateDoc(
        doc(
          db,
          "restaurants",
          restaurantId,
          "tableSessions",
          tableSessionLocal.firestoreId,
        ),
        {
          totalBill: newTotal,
          updatedAt: serverTimestamp(),
        },
      );
      updateSession({ totalBill: newTotal });
      setSessionTotal(newTotal);
      return tableSessionLocal.firestoreId;
    }
    const sessionRef = await addDoc(
      collection(db, "restaurants", restaurantId, "tableSessions"),
      {
        table,
        status: "open",
        openedAt: serverTimestamp(),
        totalBill: orderTotal,
        orderIds: [],
        paymentMode,
      },
    );
    const localSession = {
      restaurantId,
      firestoreId: sessionRef.id,
      table,
      status: "open",
      totalBill: orderTotal,
      paymentMode,
    };
    saveSession(localSession);
    setSessionId(sessionRef.id);
    setSessionTotal(orderTotal);
    return sessionRef.id;
  };

  const saveOrderToFirestore = async (paymentRef = null) => {
    const items = Object.entries(quantities).map(([name, { price, qty }]) => ({
      name,
      price: parseFloat(price),
      qty,
    }));
    const sid = await getOrCreateSession(totalValue);
    const orderData = {
      customerName: name,
      email,
      table,
      allergies,
      items,
      total: totalValue,
      status: "pending",
      createdAt: serverTimestamp(),
      sessionId: sid,
    };
    if (paymentRef) {
      orderData.paymentStatus = "paid";
      orderData.paymentRef = paymentRef;
    }
    const docRef = await addDoc(
      collection(db, "restaurants", restaurantId, "orders"),
      orderData,
    );
    const sessionDoc = await getDoc(
      doc(db, "restaurants", restaurantId, "tableSessions", sid),
    );
    const existingIds = sessionDoc.exists()
      ? sessionDoc.data().orderIds || []
      : [];
    await updateDoc(
      doc(db, "restaurants", restaurantId, "tableSessions", sid),
      { orderIds: [...existingIds, docRef.id] },
    );
    saveOrderId(docRef.id);
    setOrderId(docRef.id);
    setConfirmedName(name);
    setName("");
    setEmail("");
    setAllergies("");
    clearOrder();
    setShowModal(true);
  };

  // ─── BACKEND‑INITIATED PAYSTACK (reliable, no frontend subaccount exposure) ───
  const handleSubmit = async () => {
    setVisibleError("");
    if (submitting || isPayingRef.current) return;
    if (!name) return alert("Please enter your name.");
    if (!email) return alert("Please enter your email.");
    if (!allergies) return alert("Please enter allergies or type 'none'.");
    if (!table) return alert("Please enter your table number.");
    if (orderItem.length === 0)
      return alert("Please add items to your order first.");

    setPaymentError(null);

    if (
      profile?.plan === "starter" &&
      monthOrderCount !== null &&
      monthOrderCount >= 300
    ) {
      return alert("This restaurant has reached its 300 orders/month limit.");
    }

    if (paymentMode === "pay_online") {
      if (!profile?.paystackSubaccountCode) {
        setVisibleError("Online payment not configured for this restaurant.");
        return;
      }
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        "https://foodco-backend.onrender.com";

      isPayingRef.current = true;
      setSubmitting(true);
      paymentSuccessRef.current = false;

      try {
        // 1. Call backend to initialize transaction
        const initRes = await fetch(`${backendUrl}/initiate-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            amount: totalValue,
            subaccountCode: profile.paystackSubaccountCode,
            metadata: { restaurantId, table, customerName: name },
          }),
        });
        const initData = await initRes.json();
        if (!initRes.ok || !initData.accessCode) {
          throw new Error(initData.error || "Failed to initialize payment");
        }

        // 2. Load Paystack script
        await loadPaystackScript();

        // 3. Use resumeTransaction (more reliable than setup)
        const popup = new window.PaystackPop();
        popup.resumeTransaction(initData.accessCode, {
          onSuccess: async () => {
            clearTimeout(paymentTimeoutRef.current);
            paymentSuccessRef.current = true;
            try {
              // 4. Verify payment (optional but safe)
              const verifyRes = await fetch(`${backendUrl}/verify-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: initData.reference }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyData.success) {
                setVisibleError(
                  "Payment verification failed. Reference: " +
                    initData.reference,
                );
                setSubmitting(false);
                isPayingRef.current = false;
                return;
              }
              await saveOrderToFirestore(initData.reference);
            } catch (err) {
              console.error(err);
              setVisibleError(
                "Payment succeeded but order save failed. Show reference to staff: " +
                  initData.reference,
              );
            } finally {
              setSubmitting(false);
              isPayingRef.current = false;
            }
          },
          onCancel: () => {
            clearTimeout(paymentTimeoutRef.current);
            setSubmitting(false);
            isPayingRef.current = false;
            setVisibleError("Payment was cancelled.");
          },
          onError: (err) => {
            console.error("Paystack error:", err);
            clearTimeout(paymentTimeoutRef.current);
            setSubmitting(false);
            isPayingRef.current = false;
            setVisibleError(
              "Payment error: " + (err?.message || "Unknown error"),
            );
          },
        });
      } catch (err) {
        console.error("Init payment error:", err);
        setVisibleError(err.message);
        setSubmitting(false);
        isPayingRef.current = false;
      }
      return;
    }

    // Pay at table (offline)
    setSubmitting(true);
    try {
      await saveOrderToFirestore();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestBill = async () => {
    if (!sessionId) return;
    setRequestingBill(true);
    try {
      await updateDoc(
        doc(db, "restaurants", restaurantId, "tableSessions", sessionId),
        {
          status: "awaiting_payment",
          billRequestedAt: serverTimestamp(),
        },
      );
      updateSession({ status: "awaiting_payment" });
      setBillRequested(true);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingBill(false);
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

  // ─── PRODUCTION TOKEN CHECK (no debug bypass) ────────────────────────────────
  if (!tableToken) {
    return (
      <section
        id="Order"
        className="bg-[#111111] py-28 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-sm">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border"
              style={{ background: `${accent}15`, borderColor: `${accent}30` }}
            >
              <svg
                className="w-10 h-10"
                style={{ color: accent }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="3" height="3" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-black text-white mb-3">
              Scan the Table QR Code
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              To place an order, please scan the QR code on your table. This
              confirms you're at the restaurant and links your order to the
              correct table.
            </p>
            <div className="bg-[#1a1a1a] border border-white/5 p-4 text-white/20 text-xs leading-relaxed">
              Already scanned? Your session may have expired. Scan the QR code
              again to continue.
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (sessionStatus === "paid" || sessionStatus === "closed") {
    const handleNewOrder = () => {
      clearSession();
      setSessionStatus("open");
      setSessionId(null);
      setSessionTotal(0);
      setBillRequested(false);
    };
    return (
      <section
        id="Order"
        className="bg-[#111111] py-28 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-sm">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border"
              style={{ background: `${accent}20`, borderColor: `${accent}40` }}
            >
              <svg
                className="w-10 h-10"
                style={{ color: accent }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-black text-white mb-3">
              {sessionStatus === "paid"
                ? "Payment Confirmed! 🎉"
                : "Session Closed"}
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-2">
              {sessionStatus === "paid"
                ? "Your payment has been received. Thank you for dining with us!"
                : "Your table session has been closed by staff."}
            </p>
            <p className="text-white/20 text-sm mb-8">
              We hope to see you again soon. 🙏
            </p>
            {tableToken && (
              <button
                onClick={handleNewOrder}
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full border transition-all cursor-pointer bg-transparent"
                style={{ borderColor: `${accent}60`, color: accent }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = accent;
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = accent;
                }}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                Start a New Order
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (billRequested) {
    return (
      <section
        id="Order"
        className="bg-[#111111] py-28 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <BillRequestedBanner accent={accent} totalBill={sessionTotal} />
        </div>
      </section>
    );
  }

  // ─── MAIN ORDER FORM (same JSX as before, but with visibleError added) ───────
  const showTableReadOnly = !!tableToken?.table;
  return (
    <>
      {showModal && (
        <SuccessModal
          name={confirmedName}
          orderId={orderId}
          sessionId={sessionId}
          accent={accent}
          onClose={handleModalClose}
          onRequestBill={handleRequestBill}
          showBillOption={!!sessionId}
        />
      )}
      <section
        id="Order"
        className="bg-[#111111] py-28 relative overflow-hidden"
      >
        {/* decorative elements */}
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
            <div className="hidden lg:flex items-center justify-center">
              <img
                src={orderImg}
                alt="Order"
                loading="lazy"
                className="w-full max-w-md drop-shadow-2xl"
                style={{ filter: `drop-shadow(0 20px 60px ${accent}26)` }}
              />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-5">
                {tableToken?.table && (
                  <div
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{
                      background: `${accent}15`,
                      borderColor: `${accent}30`,
                      color: accent,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: accent }}
                    />
                    Table {tableToken.table} · Verified ✓
                  </div>
                )}
                {sessionTotal > 0 && (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 text-white/40">
                    Running bill:{" "}
                    <span className="text-white font-bold">
                      ₦{sessionTotal.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5"
                style={{ color: accent }}
              >
                <span className="w-8 h-px" style={{ background: accent }} />
                {sessionTotal > 0 ? "Add more items" : "Place your order"}
              </div>
              <h2 className="font-display text-5xl lg:text-6xl font-black text-white leading-none mb-10">
                <span className="italic" style={{ color: accent }}>
                  Order
                </span>{" "}
                Now
              </h2>
              <div className="space-y-5">
                {/* name, email, table, allergies fields – same as original */}
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
                      readOnly={showTableReadOnly}
                      style={{ opacity: showTableReadOnly ? 0.6 : 1 }}
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

                {/* order summary – same as original */}
                <div>
                  <label className={labelCls}>
                    Your Order ({totalCount} item{totalCount !== 1 ? "s" : ""})
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
                        <span className="text-white/20 text-[10px] font-semibold tracking-widests uppercase w-8 text-center">
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
                          This order
                        </span>
                        <span
                          className="font-bold text-sm"
                          style={{ color: accent }}
                        >
                          ₦{totalPrice}
                        </span>
                      </div>
                      {sessionTotal > 0 && (
                        <div className="pt-1 flex justify-between">
                          <span className="text-white/20 text-xs uppercase tracking-wide">
                            Running bill after
                          </span>
                          <span className="text-white/40 text-xs font-bold">
                            ₦{(sessionTotal + totalValue).toLocaleString()}
                          </span>
                        </div>
                      )}
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

                {/* error displays */}
                {paymentError && (
                  <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                    {paymentError}
                  </div>
                )}
                {visibleError && (
                  <div className="p-3 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm">
                    ⚠️ {visibleError}
                  </div>
                )}

                {paymentMode === "pay_online" && totalCount > 0 && (
                  <div
                    className="p-3 border text-xs flex items-center gap-2"
                    style={{
                      borderColor: `${accent}33`,
                      background: `${accent}0d`,
                      color: accent,
                    }}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    You will be redirected to Paystack to complete payment
                    before your order is confirmed.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full text-white font-bold py-4 rounded-full transition-all duration-300 tracking-wide cursor-pointer border-none disabled:opacity-70 flex items-center justify-center gap-3"
                  style={{ background: accent }}
                  onMouseEnter={(e) => {
                    if (!submitting) e.currentTarget.style.opacity = "0.85";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing your order...
                    </>
                  ) : (
                    <>
                      {paymentMode === "pay_online"
                        ? `Pay ₦${totalPrice}`
                        : sessionTotal > 0
                          ? "Add to Bill"
                          : "Confirm Order"}
                      {totalCount > 0 && (
                        <span className="bg-white/20 text-xs font-black px-2 py-0.5 rounded-full">
                          {totalCount} item{totalCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </>
                  )}
                </button>

                {sessionId && (
                  <button
                    type="button"
                    onClick={handleRequestBill}
                    disabled={requestingBill}
                    className="w-full bg-transparent border border-white/10 hover:border-white/30 text-white/50 hover:text-white font-semibold py-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-40"
                  >
                    {requestingBill ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                        </svg>
                        Request the Bill · ₦{sessionTotal.toLocaleString()}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Order;
