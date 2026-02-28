import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('della_cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('della_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const addToCart = (product, size, qty = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(i => i.id === product.id && (i.size || '') === (size || ''));
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].qty = Math.min((next[existingIndex].qty || 0) + qty, product.sizes && size ? (product.sizes[size] || product.stock) : product.stock);
        return next;
      }
      const item = {
        id: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount || 0,
        size: size || '',
        qty: qty,
        imageUrl: product.imageUrl || (product.imageUrls && product.imageUrls[0]) || '',
        stock: product.sizes && size ? (product.sizes[size] || 0) : product.stock
      };
      return [item, ...prev];
    });
  };

  const removeFromCart = (productId, size) => {
    setCart(prev => prev.filter(i => !(i.id === productId && (i.size||'') === (size||''))));
  };

  const updateQty = (productId, size, qty) => {
    setCart(prev => prev.map(i => (i.id === productId && (i.size||'') === (size||'')) ? { ...i, qty } : i));
  };

  const clearCart = () => setCart([]);

  const value = { cart, addToCart, removeFromCart, updateQty, clearCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
