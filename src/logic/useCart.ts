import { useEffect, useState } from "react";

type Extra = {
  name: string;
  price: number;
};

export type CartItem = {
  cartId: number;
  itemKey: string;
  name: string;
  size?: string;
  sizeKey?: string;
  price: number;
  qty?: number;
  imageUrl?: string;
  extras: Extra[];
  flavors?: string[];
  flavorsCount?: number;
};

function buildItemKey(item: Pick<CartItem, "name" | "sizeKey" | "size" | "extras" | "flavors">) {
  const flavorsKey = (item.flavors || [])
    .map((f) => String(f || "").trim())
    .filter(Boolean)
    .sort()
    .join("|");

  const extrasKey = (item.extras || [])
    .map((e) => `${e.name}:${Number(e.price).toFixed(2)}`)
    .sort()
    .join("|");

  return `${item.name}|${item.sizeKey || item.size || ""}|${flavorsKey}|${extrasKey}`;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sitari_cart_v2") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sitari_cart_v2", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "cartId" | "qty" | "itemKey">) =>
    setItems((prev) => {
      const itemKey = buildItemKey(item);
      const existingIndex = prev.findIndex((i) => i.itemKey === itemKey);
      if (existingIndex === -1) {
        return [
          ...prev,
          {
            ...item,
            itemKey,
            qty: 1,
            cartId: Date.now() + Math.random(),
          },
        ];
      }

      return prev.map((i, idx) =>
        idx === existingIndex ? { ...i, qty: (i.qty || 1) + 1 } : i
      );
    });

  const incrementItem = (cartId: number) =>
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, qty: (i.qty || 1) + 1 } : i))
    );

  const decrementItem = (cartId: number) =>
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.cartId !== cartId) return i;
          const nextQty = (i.qty || 1) - 1;
          return { ...i, qty: nextQty };
        })
        .filter((i) => (i.qty || 1) > 0)
    );

  const removeItem = (cartId: number) =>
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));

  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => {
    const extras = Array.isArray(i.extras) ? i.extras : [];
    return s + (i.qty || 1) * (i.price + extras.reduce((es, e) => es + e.price, 0));
  }, 0);

  return {
    items,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    total,
  };
}
