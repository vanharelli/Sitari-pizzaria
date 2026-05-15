import { useEffect, useState } from "react";

export function useCart() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sitari_cart_v2") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sitari_cart_v2", JSON.stringify(items));
  }, [items]);

  const addItem = (item) =>
    setItems((prev) => [...prev, { ...item, cartId: Date.now() + Math.random() }]);
  const removeItem = (cartId) =>
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  const clearCart = () => setItems([]);

  const total = items.reduce(
    (s, i) => s + i.price + i.extras.reduce((es, e) => es + e.price, 0),
    0
  );

  return { items, addItem, removeItem, clearCart, total };
}
