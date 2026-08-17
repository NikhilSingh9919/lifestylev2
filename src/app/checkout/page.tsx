'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  ShoppingBag,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const isSuccessParam = searchParams.get('success') === 'true';
  const isCanceledParam = searchParams.get('canceled') === 'true';
  const cartIdParam = searchParams.get('cart_id');

  const { cart, clearCart, cartSubtotal } = useCart();
  const { customer } = useAuth();
  const hasClearedRef = useRef(false);

  // Customer & Shipping State
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    country: 'United Kingdom',
    city: '',
    postalCode: '',
    phone: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('POMA-884920');
  const [confirmedEmail, setConfirmedEmail] = useState('');

  // Autofill user address & contact from saved customer profile if logged in
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        email: customer.email || prev.email,
        firstName: customer.firstName || prev.firstName,
        lastName: customer.lastName || prev.lastName,
        phone: customer.phone || prev.phone,
        address: customer.defaultAddress?.address1 || prev.address,
        apartment: customer.defaultAddress?.address2 || prev.apartment,
        city: customer.defaultAddress?.city || prev.city,
        postalCode: customer.defaultAddress?.zip || prev.postalCode,
        country: customer.defaultAddress?.country || prev.country || 'United Kingdom',
      }));
    } else {
      try {
        const activeUser = localStorage.getItem('poma_active_customer');
        if (activeUser) {
          const user = JSON.parse(activeUser);
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email,
            firstName: user.firstName || prev.firstName,
            lastName: user.lastName || prev.lastName,
            phone: user.phone || prev.phone,
            address: user.defaultAddress?.address1 || prev.address,
            apartment: user.defaultAddress?.address2 || prev.apartment,
            city: user.defaultAddress?.city || prev.city,
            postalCode: user.defaultAddress?.zip || prev.postalCode,
            country: user.defaultAddress?.country || prev.country || 'United Kingdom',
          }));
        }
      } catch {}
    }
  }, [customer]);

  // Handle URL success state safely without render loops
  useEffect(() => {
    if (isSuccessParam && !hasClearedRef.current) {
      hasClearedRef.current = true;
      const sessionId = searchParams.get('session_id');

      if (sessionId) {
        setIsProcessing(true);
        fetch('/api/checkout/confirm-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.order) {
              const orderRef = `#${data.order.displayId || data.order.orderNumber}`;
              setConfirmedOrderId(orderRef);
              if (data.customerEmail) {
                setConfirmedEmail(data.customerEmail);
              }

              // Synchronize local customer profile, address, and order history
              if (typeof window !== 'undefined') {
                const targetEmail = (data.customerEmail || formData.email || '').toLowerCase();
                const savedActive = localStorage.getItem('poma_active_customer');
                let updatedCust: any = null;

                if (savedActive) {
                  try {
                    const parsed = JSON.parse(savedActive);
                    const existingOrders = parsed.orders || [];
                    parsed.orders = [data.order, ...existingOrders.filter((prevO: any) => prevO.id !== data.order.id)];
                    if (!parsed.defaultAddress && formData.address) {
                      parsed.defaultAddress = {
                        id: `addr_${Date.now()}`,
                        address1: formData.address,
                        address2: formData.apartment || undefined,
                        city: formData.city,
                        zip: formData.postalCode,
                        country: formData.country,
                      };
                    }
                    updatedCust = parsed;
                  } catch {}
                }

                if (!updatedCust && targetEmail) {
                  updatedCust = {
                    id: `cus_${Math.floor(Math.random() * 100000000)}`,
                    firstName: formData.firstName || (data.order.lineItems?.[0]?.title ? 'Valued' : 'Customer'),
                    lastName: formData.lastName || 'Customer',
                    email: targetEmail,
                    phone: formData.phone || undefined,
                    defaultAddress: formData.address ? {
                      id: `addr_${Date.now()}`,
                      address1: formData.address,
                      address2: formData.apartment || undefined,
                      city: formData.city,
                      zip: formData.postalCode,
                      country: formData.country,
                    } : undefined,
                    orders: [data.order],
                  };
                }

                if (updatedCust) {
                  localStorage.setItem('poma_active_customer', JSON.stringify(updatedCust));
                  if (targetEmail) {
                    const userKey = `poma_user_${targetEmail}`;
                    const savedUser = localStorage.getItem(userKey);
                    if (savedUser) {
                      try {
                        const parsedUser = JSON.parse(savedUser);
                        parsedUser.customer = updatedCust;
                        localStorage.setItem(userKey, JSON.stringify(parsedUser));
                      } catch {}
                    }
                  }
                }
              }

              setOrderConfirmed(true);
              clearCart();
            } else {
              setErrorMessage(data.error || 'Unable to record order on Medusa backend.');
            }
          })
          .catch((err) => {
            console.error('Session confirmation failed:', err);
            setErrorMessage('Unable to connect to Medusa backend for order confirmation.');
          })
          .finally(() => {
            setIsProcessing(false);
          });
      }
    }
  }, [isSuccessParam, searchParams, clearCart, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Stripe Checkout Session Redirect Handler
  const handleStripeCheckoutRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.address) {
      setErrorMessage('Please fill in all required contact and shipping details.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    // Save shipping address into profile if user is creating/updating address
    if (typeof window !== 'undefined' && formData.address) {
      try {
        const savedActive = localStorage.getItem('poma_active_customer');
        let parsed: any = savedActive ? JSON.parse(savedActive) : {};
        parsed.firstName = formData.firstName || parsed.firstName || '';
        parsed.lastName = formData.lastName || parsed.lastName || '';
        parsed.email = formData.email || parsed.email || '';
        if (formData.phone) parsed.phone = formData.phone;
        
        parsed.defaultAddress = {
          id: parsed.defaultAddress?.id || `addr_${Date.now()}`,
          address1: formData.address,
          address2: formData.apartment || undefined,
          city: formData.city,
          zip: formData.postalCode,
          country: formData.country,
        };
        localStorage.setItem('poma_active_customer', JSON.stringify(parsed));
      } catch {}
    }

    try {
      const res = await fetch('/api/checkout/stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerEmail: formData.email,
          formData,
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

  // Order Confirmed / Success Screen
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
            <span className="text-neutral-800 font-medium">{confirmedEmail || formData.email || 'your email'}</span>.
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

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Left Column: Form & Checkout */}
          <div className="lg:col-span-7 space-y-10">
            <form onSubmit={handleStripeCheckoutRedirect} className="space-y-10">
              {/* 1. Contact Information */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                    1. Contact Information
                  </h2>
                  {!customer && (
                    <Link href="/login" className="text-xs text-neutral-500 hover:text-neutral-900 underline transition-colors">
                      Already have an account? Log in
                    </Link>
                  )}
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
                      placeholder="123 Main Street"
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

                  {/* 1. Country */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Country</label>
                    <div className="relative">
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-10 text-sm text-neutral-900 appearance-none cursor-pointer focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-colors"
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Ireland">Ireland</option>
                        <option value="India">India</option>
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* 2. City & 3. Postal code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </div>

                  {/* 4. Phone number */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Phone number</label>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || cart.length === 0}
                className="w-full rounded-full bg-neutral-900 py-4 px-6 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>
                    Proceed to checkout
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 self-start z-10">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden shadow-sm">
              {/* Header: Full width border, 20px padding */}
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                  Order Summary
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List: 20px padding */}
              <div className="p-5 max-h-80 overflow-y-auto space-y-4 divide-y divide-neutral-200/60">
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

              {/* Price Breakdown: Full width top border, 20px padding, 12px gap, 16px font size */}
              <div className="p-5 border-t border-neutral-200 space-y-3 text-[16px]">
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
              </div>

              {/* Total Cost: Full width border, 20px padding, 16px font size */}
              <div className="p-5 border-t border-neutral-200 flex justify-between items-center text-[16px] font-semibold text-neutral-900 bg-neutral-100/40">
                <span>Total</span>
                <span>£{cartSubtotal.toFixed(2)}</span>
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
