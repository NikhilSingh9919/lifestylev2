'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, Lock, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cart, cartSubtotal, checkout, isCheckingOut } = useCart();

  const handleRedirectToStripe = async () => {
    await checkout();
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4 py-20">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-2xl font-light">Your shopping bag is empty</h1>
          <p className="text-neutral-400 text-sm">Add your favorite Poma products to proceed to secure Stripe Checkout.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
          <Link href="/" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping
          </Link>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
              OFFICIAL STRIPE HOSTED CHECKOUT
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Stripe Hosted Checkout Info */}
          <div className="md:col-span-7 space-y-6 rounded-2xl border border-white/10 bg-neutral-900/60 p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-white">Stripe Hosted Checkout</h1>
                <p className="text-xs text-neutral-400">Official, encrypted checkout powered by Stripe</p>
              </div>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              You will be redirected to Stripe’s secure hosted checkout page where you can pay using Credit Card, Apple Pay, Google Pay, or other local payment methods.
            </p>

            <div className="rounded-xl bg-neutral-950/80 p-4 border border-white/5 space-y-3 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Security Assurance</span>
                <span className="text-emerald-400 font-semibold">256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Medusa Order Linkage</span>
                <span className="text-neutral-200">Automatic Order Creation & Refund Sync</span>
              </div>
            </div>

            <button
              onClick={handleRedirectToStripe}
              disabled={isCheckingOut}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-black hover:bg-neutral-200 disabled:opacity-50 transition-all duration-300 cursor-pointer shadow-xl shadow-white/5"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-black" />
                  <span>Redirecting to Stripe...</span>
                </>
              ) : (
                <>
                  <span>Pay with Stripe Checkout</span>
                  <ExternalLink className="h-4 w-4 text-neutral-700" />
                </>
              )}
            </button>
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-5 rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase border-b border-white/10 pb-3">
              Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} items)
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.variantId} className="flex gap-3 items-center text-xs">
                  <div className="relative h-12 w-12 rounded-lg bg-neutral-950 border border-white/10 flex-shrink-0 overflow-hidden">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-200 truncate">{item.title}</p>
                    <p className="text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-white">£{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="text-neutral-200">£{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-semibold text-white">
                <span>Total Amount</span>
                <span className="text-emerald-400">£{cartSubtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
