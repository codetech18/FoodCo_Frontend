import React from "react";

const formatTime = (value) => {
  if (!value) return "";
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString();
};

const ReceiptHeader = ({ receipt, label }) => (
  <div className="text-center mb-4">
    <p className="font-black text-base">{receipt.restaurantName}</p>
    <p className="text-xs text-black/60">Table {receipt.table}</p>
    {label && <p className="text-xs text-black/50 mt-0.5">{label}</p>}
    <p className="text-[10px] text-black/40">{formatTime(receipt.closedAt)}</p>
  </div>
);

const OrderLines = ({ order, showSubtotal = true }) => (
  <div className="text-xs">
    <p className="font-semibold mb-1">{order.customerName || "Guest"}</p>
    {(order.items || []).map((item, j) => (
      <div key={j} className="flex justify-between text-black/70">
        <span>
          {item.qty}× {item.name}
        </span>
        <span>₦{(parseFloat(item.price) * item.qty).toLocaleString()}</span>
      </div>
    ))}
    {showSubtotal && (
      <div className="flex justify-between font-semibold mt-1">
        <span>Subtotal</span>
        <span>₦{Number(order.total || 0).toLocaleString()}</span>
      </div>
    )}
  </div>
);

const PaidFooter = ({ total, paidVia }) => (
  <>
    <div className="border-t border-black/10 my-3" />
    <div className="flex justify-between font-black text-sm mb-1">
      <span>Total</span>
      <span>₦{Number(total || 0).toLocaleString()}</span>
    </div>
    <p className="text-xs text-black/60 uppercase tracking-wide">
      Paid via {paidVia === "pos" ? "POS / Card" : "Cash"}
    </p>
  </>
);

const ReceiptView = ({ receipt, onClose }) => {
  // Orders are already scoped server-side to just this session's orderIds —
  // this only ever renders the bill for this one table/session, never the
  // full restaurant order list.
  const orders = receipt.orders || [];
  const isSplit = receipt.billMode === "split" && orders.length > 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 print:static print:px-0">
      {/* Print only the receipt card — not the dashboard page behind it */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-print-area, .receipt-print-area * { visibility: visible; }
          .receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />
      <div className="receipt-print-area relative z-10 bg-white text-black w-full max-w-sm p-6 shadow-2xl print:shadow-none print:max-w-full max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible">
        {isSplit ? (
          orders.map((order, i) => (
            <div
              key={i}
              className={
                i > 0
                  ? "mt-8 pt-6 border-t-2 border-dashed border-black/20 print:break-before-page print:border-t-0 print:mt-0 print:pt-0"
                  : ""
              }
            >
              <ReceiptHeader
                receipt={receipt}
                label={`Bill for ${order.customerName || "Guest"}`}
              />
              <div className="border-t border-black/10 my-3" />
              <OrderLines order={order} showSubtotal={false} />
              <PaidFooter total={order.total} paidVia={receipt.paidVia} />
            </div>
          ))
        ) : (
          <>
            <ReceiptHeader receipt={receipt} />
            <div className="border-t border-black/10 my-3" />
            <div className="space-y-3">
              {orders.map((order, i) => (
                <OrderLines key={i} order={order} />
              ))}
            </div>
            <PaidFooter total={receipt.totalBill} paidVia={receipt.paidVia} />
          </>
        )}

        <div className="flex gap-3 mt-6 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 bg-black text-white text-xs font-bold py-2.5 transition-all cursor-pointer border-none"
          >
            Print
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 text-black/50 hover:text-black text-xs font-semibold border border-black/15 hover:border-black/30 transition-all cursor-pointer bg-transparent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
