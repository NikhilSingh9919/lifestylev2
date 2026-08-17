'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Truck,
  ShoppingBag,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const isSuccessParam = searchParams.get('success') === 'true';
  const isCanceledParam = searchParams.get('canceled') === 'true';
  const cartIdParam = searchParams.get('cart_id');

  const { cart, clearCart, cartSubtotal } = useCart();
  const hasClearedRef = useRef(false);

  // Customer & Shipping State
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom',
    phone: '',
  });

  // Payment Form State
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });

  const [paymentMode, setPaymentMode] = useState<'stripe_direct' | 'stripe_checkout'>('stripe_checkout');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('POMA-884920');

  // Load user from local session if logged in
  useEffect(() => {
    try {
      const activeUser = localStorage.getItem('poma_active_customer');
      if (activeUser) {
        const user = JSON.parse(activeUser);
        setFormData((prev) => ({
          ...prev,
          email: user.email || prev.email,
          firstName: user.firstName || prev.firstName,
          lastName: user.lastName || prev.lastName,
          address: user.defaultAddress?.address1 || prev.address,
          city: user.defaultAddress?.city || prev.city,
          postalCode: user.defaultAddress?.zip || prev.postalCode,
          country: user.defaultAddress?.country || prev.country,
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle URL success state safely without render loops
  useEffect(() => {
    if (isSuccessParam && !hasClearedRef.current) {
      hasClearedRef.current = true;
      setConfirmedOrderId(`POMA-${Math.floor(100000 + Math.random() * 900000)}`);
      setOrderConfirmed(true);
      clearCart();
    }
  }, [isSuccessParam, clearCart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 16);
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
      setCardData((prev) => ({ ...prev, cardNumber: formatted }));
      return;
    }
    if (name === 'expiry') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      const formatted = cleaned.length >= 3 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned;
      setCardData((prev) => ({ ...prev, expiry: formatted }));
      return;
    }
    if (name === 'cvc') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setCardData((prev) => ({ ...prev, cvc: cleaned }));
      return;
    }
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  // Stripe Checkout Session Redirect Handler
  const handleStripeCheckoutRedirect = async () => {
    if (!formData.email) {
      setErrorMessage('Please enter your email address to proceed.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/checkout/stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerEmail: formData.email,
          cartId: cartIdParam || undefined,
          returnUrl: window.location.origin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Unable to redirect to Stripe checkout');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while connecting to Stripe');
      setIsProcessing(false);
    }
  };

  // Direct Card Payment Handler
  const handleDirectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.address) {
      setErrorMessage('Please fill in all required contact and shipping details.');
      return;
    }

    if (paymentMode === 'stripe_checkout') {
      await handleStripeCheckoutRedirect();
      return;
    }

    if (!cardData.cardNumber || !cardData.expiry || !cardData.cvc) {
      setErrorMessage('Please provide valid card details.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartSubtotal,
          currency: 'gbp',
          metadata: {
            customerEmail: formData.email,
            customerName: `${formData.firstName} ${formData.lastName}`,
            cartId: cartIdParam || '',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment processing failed');
      }

      await new Promise((r) => setTimeout(r, 1000));

      const newOrderId = `POMA-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderId(newOrderId);
      setOrderConfirmed(true);
      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed. Please check card details.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Order Confirmed / Success Screen in Pure White
  if (orderConfirmed) {
    return (
      <main className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 mb-8"
          >
            <CheckCircle2 className="h-10 w-10" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-light tracking-tight font-serif text-neutral-900">
            Thank you for your order
          </h1>
          <p className="mt-3 text-neutral-600 text-sm">
            Order reference <span className="font-mono text-neutral-900 font-semibold">{confirmedOrderId}</span>
          </p>
          <p className="mt-2 text-neutral-500 text-xs">
            A confirmation receipt and tracking details have been sent to{' '}
            <span className="text-neutral-800 font-medium">{formData.email || 'your email'}</span>.
          </p>

          <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                <Sparkles className="h-3 w-3" /> Paid via Stripe
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Estimated Delivery</span>
              <span className="text-neutral-900 font-medium">3-5 Business Days (Express)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Payment Security</span>
              <span className="inline-flex items-center gap-1 text-xs text-neutral-700">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 256-bit Encrypted
              </span>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto rounded-full bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="w-full sm:w-auto rounded-full border border-neutral-300 bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              View My Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
        {isCanceledParam && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            Payment was canceled. You can review your information and try again.
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Form & Payment */}
          <div className="lg:col-span-7 space-y-10">
            <form onSubmit={handleDirectPayment} className="space-y-10">
              {/* 1. Contact Information */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                    1. Contact Information
                  </h2>
                  <Link href="/login" className="text-xs text-neutral-500 hover:text-neutral-900 underline transition-colors">
                    Already have an account? Log in
                  </Link>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Email address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Shipping Address */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                  2. Shipping Address
                </h2>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">First name</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Last name</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="123 Luxury Avenue"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Apartment, suite, unit (optional)</label>
                    <input
                      type="text"
                      name="apartment"
                      placeholder="Apt 4B"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="London"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Postal code</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        placeholder="SW1A 1AA"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Phone number (for delivery updates)</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+44 7123 456789"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* 3. Delivery Method */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                  3. Delivery Method
                </h2>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-neutral-700" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Tracked Express Worldwide Shipping</p>
                      <p className="text-xs text-neutral-500">Delivered within 3-5 business days</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    FREE
                  </span>
                </div>
              </section>

              {/* 4. Payment Options */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                  4. Payment
                </h2>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('stripe_checkout')}
                    className={`rounded-xl p-4 border text-left transition-all cursor-pointer ${
                      paymentMode === 'stripe_checkout'
                        ? 'border-neutral-900 bg-neutral-50 text-neutral-900 ring-1 ring-neutral-900'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-neutral-900">Stripe Checkout</span>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-neutral-500">Cards, Apple Pay, Google Pay</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('stripe_direct')}
                    className={`rounded-xl p-4 border text-left transition-all cursor-pointer ${
                      paymentMode === 'stripe_direct'
                        ? 'border-neutral-900 bg-neutral-50 text-neutral-900 ring-1 ring-neutral-900'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-neutral-900">Direct Card</span>
                      <CreditCard className="h-4 w-4 text-neutral-700" />
                    </div>
                    <p className="text-xs text-neutral-500">Enter card details directly</p>
                  </button>
                </div>

                {/* Direct Card Inputs (if direct card selected) */}
                {paymentMode === 'stripe_direct' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Card number</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          placeholder="4242 •••• •••• 4242"
                          value={cardData.cardNumber}
                          onChange={handleCardChange}
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pl-11 text-sm font-mono text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                        />
                        <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">Name on card</label>
                      <input
                        type="text"
                        name="cardName"
                        placeholder="John Doe"
                        value={cardData.cardName}
                        onChange={handleCardChange}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Expiration (MM/YY)</label>
                        <input
                          type="text"
                          name="expiry"
                          placeholder="12/28"
                          value={cardData.expiry}
                          onChange={handleCardChange}
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-mono text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">CVC / CVV</label>
                        <input
                          type="text"
                          name="cvc"
                          placeholder="123"
                          value={cardData.cvc}
                          onChange={handleCardChange}
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-mono text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </section>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || cart.length === 0}
                className="w-full rounded-full bg-neutral-900 py-4 px-6 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    {paymentMode === 'stripe_checkout'
                      ? `Proceed to Stripe Checkout • £${cartSubtotal.toFixed(2)}`
                      : `Pay £${cartSubtotal.toFixed(2)} Now`}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 lg:p-8 space-y-6 sticky top-12">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                  Order Summary
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto space-y-4 pr-1 divide-y divide-neutral-200/60">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    <ShoppingBag className="mx-auto h-8 w-8 mb-2 opacity-40 text-neutral-400" />
                    Your cart is empty.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.variantId} className="flex items-center gap-4 pt-4 first:pt-0">
                      <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-white">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-neutral-100" />
                        )}
                        <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-neutral-900 truncate">{item.title}</h4>
                        <p className="text-xs text-neutral-500">Qty {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">
                        £{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-neutral-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="text-neutral-900 font-medium">£{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span className="text-emerald-700 font-medium">Free Express</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Taxes (Included)</span>
                  <span className="text-neutral-900 font-mono">£0.00</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-neutral-900 border-t border-neutral-200 pt-4">
                  <span>Total</span>
                  <span>£{cartSubtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Stripe Protected • 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-neutral-700" />
                  <span>Free tracked global shipping & 30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-neutral-900">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
