import React, { createContext, useContext, useState } from "react";

const ListItemsAndTotalPriceContext = createContext();

export const useListItemsAndTotalPrice = () =>
  useContext(ListItemsAndTotalPriceContext);

export const ListItemsAndTotalPriceProvider = ({ children }) => {
  const [orderItem, setOrderItem] = useState([]);

  const addToOrder = (itemName, itemPrice) => {
    setOrderItem([...orderItem, { name: itemName, price: itemPrice }]);
  };

  const listItemsAndTotalPrice = () => {
    let totalPrice = 0;
    let itemsList = "";
    orderItem.forEach((item) => {
      itemsList += `${item.name}: ₦${item.price}\n`;
      totalPrice += parseFloat(item.price);
    });
    itemsList += `Total Price: ₦${totalPrice.toFixed(2)}`;
    return itemsList;
  };

  return (
    <ListItemsAndTotalPriceContext.Provider
      value={{ listItemsAndTotalPrice, setOrderItem, orderItem }}
    >
      {children}
    </ListItemsAndTotalPriceContext.Provider>
  );
};
