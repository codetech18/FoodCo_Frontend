import React from "react";

const formatTime = (value) => {
  if (!value) return "";
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString();
};

const ReceiptView = ({ receipt, onClose }) => {
  const orders = receipt.orders || [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 print:static print:px-0">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white text-black w-full max-w-sm p-6 shadow-2xl print:shadow-none print:max-w-full">
        <div className="text-center mb-4">
          <p className="font-black text-base">{receipt.restaurantName}</p>
          <p className="text-xs text-black/60">Table {receipt.table}</p>
          <p className="text-[10px] text-black/40">{formatTime(receipt.closedAt)}</p>
        </div>

        <div className="border-t border-black/10 my-3" />

        <div className="space-y-3">
          {orders.map((order, i) => (
            <div key={i} className="text-xs">
              <p className="font-semibold mb-1">{order.customerName || "Guest"}</p>
              {(order.items || []).map((item, j) => (
                <div key={j} className="flex justify-between text-black/70">
                  <span>
                    {item.qty}× {item.name}
                  </span>
                  <span>
                    ₦{(parseFloat(item.price) * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-semibold mt-1">
                <span>Subtotal</span>
                <span>₦{Number(order.total || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-black/10 my-3" />

        <div className="flex justify-between font-black text-sm mb-1">
          <span>Total</span>
          <span>₦{Number(receipt.totalBill || 0).toLocaleString()}</span>
        </div>
        <p className="text-xs text-black/60 uppercase tracking-wide">
          Paid via {receipt.paidVia === "pos" ? "POS / Card" : "Cash"}
        </p>

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
