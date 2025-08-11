import React, { createContext, useState, useContext } from 'react';
const CartContext = createContext();
export  const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const addToCart = (product) => {

    setItems(prevItems => [...prevItems, product]);
  };
   const removeFromCart = (productId) => {
    
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
 const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, totalPrice,removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};