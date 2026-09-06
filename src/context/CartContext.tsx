'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartItem } from '@/types';
import { generateId } from '@/lib/id';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'count'>, count?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateCount: (cartItemId: string, count: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'vks_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt cart data
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after initial hydration, to avoid clobbering with [])
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem: CartContextValue['addItem'] = useCallback((item, count = 1) => {
    setItems((prev) => {
      // Merge with an existing identical line (same product + same quantity/variant)
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.quantityLabel === item.quantityLabel &&
          i.variantId === item.variantId
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        const existing = next[existingIndex];
        const newCount = existing.count + count;
        next[existingIndex] = {
          ...existing,
          count: newCount,
          lineTotal: (existing.lineTotal / existing.count) * newCount,
        };
        return next;
      }
      return [...prev, { ...item, id: generateId('cart-'), count, lineTotal: item.lineTotal }];
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  }, []);

  const updateCount = useCallback((cartItemId: string, count: number) => {
    setItems((prev) => {
      if (count <= 0) return prev.filter((i) => i.id !== cartItemId);
      return prev.map((i) =>
        i.id === cartItemId ? { ...i, count, lineTotal: (i.lineTotal / i.count) * count } : i
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const itemCount = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateCount, clearCart, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
