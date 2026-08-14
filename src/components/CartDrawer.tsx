'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export default function CartDrawer() {
  const {
    cart,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    checkout,
    isCheckingOut,
  } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Frosted Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-neutral-950/95 backdrop-blur-2xl text-white shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold ">YOUR BAG</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                  <p className="text-neutral-400 font-light">Your shopping bag is empty.</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors duration-300"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    key={item.variantId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex gap-4 border-b border-white/5 pb-6"
                  >
                    {/* Product Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/5">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Product Metadata & Actions */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between text-sm">
                        <div>
                          <h3 className="font-medium text-neutral-100">{item.title}</h3>
                          <p className="mt-1 text-xs text-neutral-400 font-light">Price: £{item.price}</p>
                        </div>
                        <p className="font-semibold text-white">£{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-neutral-900 px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="rounded-full p-1 text-neutral-400 hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="rounded-full p-1 text-neutral-400 hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Trash Button */}
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-neutral-500 hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 bg-neutral-900/50 px-6 py-6 space-y-4">
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-neutral-300">SUBTOTAL</span>
                  <span className="text-white">£{cartSubtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-neutral-400 font-light">
                  Shipping, taxes, and discounts calculated securely at payment checkout.
                </p>

                {/* Secure Checkout Button */}
                <button
                  disabled={isCheckingOut}
                  onClick={checkout}
                  className="relative flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black hover:bg-neutral-200 disabled:opacity-50 transition-all duration-300 cursor-pointer font-sans"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
                      Redirecting to secure checkout...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Secure checkout on Medusa
                    </>
                  )}
                </button>

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
