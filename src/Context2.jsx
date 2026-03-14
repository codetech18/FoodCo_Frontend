import React, { useState, createContext, useContext } from "react";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  // quantities: { [itemName]: { price, qty } }
  const [quantities, setQuantities] = useState({});

  const increment = (itemName, itemPrice) => {
    setQuantities(prev => ({
      ...prev,
      [itemName]: {
        price: itemPrice,
        qty: (prev[itemName]?.qty || 0) + 1,
      },
    }));
  };

  const decrement = (itemName) => {
    setQuantities(prev => {
      const current = prev[itemName]?.qty || 0;
      if (current <= 1) {
        // Remove the item entirely
        const next = { ...prev };
        delete next[itemName];
        return next;
      }
      return { ...prev, [itemName]: { ...prev[itemName], qty: current - 1 } };
    });
  };

  const clearOrder = () => setQuantities({});

  // Flat array of items for the order summary (one entry per unit)
  const orderItem = Object.entries(quantities).flatMap(([name, { price, qty }]) =>
    Array(qty).fill({ name, price })
  );

  // Total item count
  const totalCount = Object.values(quantities).reduce((sum, { qty }) => sum + qty, 0);

  return (
    <OrderContext.Provider value={{ quantities, orderItem, totalCount, increment, decrement, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
