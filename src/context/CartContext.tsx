'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateCheckoutLink } from '@/lib/medusa';

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  price: string;
  quantity: number;
  imageUrl: string;
  handle: string;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantityToAdd?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  isCheckingOut: boolean;
  cartCount: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('poma_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart storage', e);
      }
    }
  }, []);

  const saveCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('poma_cart', JSON.stringify(newCart));
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantityToAdd = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.variantId === item.variantId);
      let updated: CartItem[];
      if (existing) {
        updated = prevCart.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantityToAdd } : i
        );
      } else {
        updated = [...prevCart, { ...item, quantity: quantityToAdd }];
      }
      localStorage.setItem('poma_cart', JSON.stringify(updated));
      return updated;
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((variantId: string) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((i) => i.variantId !== variantId);
      localStorage.setItem('poma_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setCart((prevCart) => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = prevCart.filter((i) => i.variantId !== variantId);
      } else {
        updated = prevCart.map((i) => (i.variantId === variantId ? { ...i, quantity } : i));
      }
      localStorage.setItem('poma_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('poma_cart');
  }, []);

  const checkout = useCallback(async () => {
    if (cart.length === 0) return;
    try {
      setIsCheckingOut(true);
      const items = cart.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('medusa_customer_access_token') || undefined 
        : undefined;
      const checkoutUrl = await generateCheckoutLink(items, token);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout redirect failed:', error);
      setIsCheckingOut(false);
    }
  }, [cart]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        isCheckingOut,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
