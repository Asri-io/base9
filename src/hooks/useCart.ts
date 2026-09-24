"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  slug: string;
}

const CART_KEY = "base9_cart";

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((i) =>
          i.id === item.id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        updated = [...prev, item];
      }
      saveCart(updated);
      return updated;
    });
  };

  const removeItem = (id: string, size: string, color: string) => {
    setCart((prev) => {
      const updated = prev.filter(
        (i) => !(i.id === id && i.size === size && i.color === color)
      );
      saveCart(updated);
      return updated;
    });
  };

  const updateQuantity = (id: string, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id, size, color);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((i) =>
        i.id === id && i.size === size && i.color === color
          ? { ...i, quantity: qty }
          : i
      );
      saveCart(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { cart, addItem, removeItem, updateQuantity, clearCart, itemCount, totalPrice };
}
