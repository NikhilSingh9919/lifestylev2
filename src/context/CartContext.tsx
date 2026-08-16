'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('poma_cart', JSON.stringify(newCart));
  };

  const addToCart = (item: Omit<CartItem, 'quantity'> & { availableForSale?: boolean; quantityAvailable?: number }, quantityToAdd = 1) => {
    // Check inventory availability
    if (item.availableForSale === false || (item.quantityAvailable !== undefined && item.quantityAvailable <= 0)) {
      alert(`Sorry, "${item.title}" is currently out of stock.`);
      return;
    }

    const existing = cart.find((i) => i.variantId === item.variantId);
    if (existing) {
      const updated = cart.map((i) =>
        i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantityToAdd } : i
      );
      saveCart(updated);
    } else {
      saveCart([...cart, { ...item, quantity: quantityToAdd }]);
    }
    setIsOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    saveCart(cart.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
    } else {
      saveCart(cart.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)));
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      setIsCheckingOut(true);
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('medusa_customer_access_token') || undefined 
        : undefined;

      let customerData: any = undefined;
      let email: string | undefined;
      if (typeof window !== 'undefined') {
        const cust = localStorage.getItem('poma_active_customer');
        if (cust) {
          try {
            customerData = JSON.parse(cust);
            email = customerData.email;
          } catch (e) {}
        }
      }

      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          email,
          customer: customerData,
          customerToken: token,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.error) {
        alert(`Stripe Checkout Error: ${data.error}\n${data.details || ''}`);
        setIsCheckingOut(false);
        return;
      }

      window.location.href = '/checkout';
    } catch (error: any) {
      console.error('Stripe Hosted Checkout redirect failed:', error);
      alert(`Stripe Checkout Error: ${error.message || 'Network error'}`);
      setIsCheckingOut(false);
    }
  };


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
