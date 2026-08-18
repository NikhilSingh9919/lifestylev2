'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Package,
  X,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function AccountContent() {
  const { customer, loading, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'profiles' || searchParams.get('tab') === 'profile' ? 'profiles' : 'orders';
  const [activeTab, setActiveTab] = useState<'orders' | 'profiles'>(initialTab);

  const [liveOrdersList, setLiveOrdersList] = useState<any[] | null>(null);

  // Modal / Edit States
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Form states for contact
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Form states for address
  const [addressForm, setAddressForm] = useState({
    address1: '',
    address2: '',
    city: '',
    province: '',
    zip: '',
    country: 'United Kingdom',
  });

  // Sync customer state to form states
  useEffect(() => {
    if (customer) {
      setContactForm({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
      });

      if (customer.defaultAddress) {
        setAddressForm({
          address1: customer.defaultAddress.address1 || '',
          address2: customer.defaultAddress.address2 || '',
          city: customer.defaultAddress.city || '',
          province: customer.defaultAddress.province || '',
          zip: customer.defaultAddress.zip || '',
          country: customer.defaultAddress.country || 'United Kingdom',
        });
      }
    }
  }, [customer]);

  // Refresh latest order statuses from Medusa on mount
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Auth Guard
  useEffect(() => {
    if (!loading && !customer) {
      router.push('/login?redirect=/account');
    }
  }, [customer, loading, router]);

  // Fetch live order statuses from Medusa on load
  useEffect(() => {
    if (customer && customer.email) {
      fetch(`/api/account/orders?email=${encodeURIComponent(customer.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orders && Array.isArray(data.orders)) {
            setLiveOrdersList(data.orders);
          }
        })
        .catch((err) => console.warn('Could not fetch live order statuses:', err));
    }
  }, [customer]);

  if (loading || !customer) {
    return (
      <div className="min-h-[80vh] bg-white py-16 px-4 sm:px-8 font-sans text-neutral-900">
        <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
            <div className="md:col-span-3 space-y-4">
              <div className="h-8 w-28 bg-neutral-100 rounded-lg" />
              <div className="h-8 w-28 bg-neutral-100 rounded-lg" />
            </div>
            <div className="md:col-span-9 max-w-2xl space-y-6">
              <div className="h-44 bg-neutral-100 rounded-2xl" />
              <div className="h-44 bg-neutral-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { firstName, lastName, email, defaultAddress, orders: initialOrders = [] } = customer;
  const rawOrders = liveOrdersList !== null ? liveOrdersList : initialOrders;
  const orders = [...rawOrders].sort((a: any, b: any) => {
    const timeA = a.processedAt ? new Date(a.processedAt).getTime() : 0;
    const timeB = b.processedAt ? new Date(b.processedAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return (b.orderNumber || b.displayId || 0) - (a.orderNumber || a.displayId || 0);
  });

  const formatDate = (isoString: string) => {
    if (!isoString) return 'June 24, 2026';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'June 24, 2026';
    }
  };

  const formatPrice = (amount: string | number, currencyCode: string = 'GBP') => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '£0';
    const symbol = currencyCode?.toUpperCase() === 'GBP' ? '£' : currencyCode?.toUpperCase() === 'USD' ? '$' : '€';
    return Number.isInteger(num) ? `${symbol}${num}` : `${symbol}${num.toFixed(2)}`;
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Delivered';
    const lower = status.toLowerCase();
    if (lower === 'delivered') return 'Delivered';
    if (lower === 'shipped') return 'Shipped';
    if (lower === 'fulfilled') return 'Fulfilled';
    if (lower === 'unfulfilled' || lower === 'pending') return 'Processing';
    if (lower === 'paid') return 'Paid';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Save Contact Changes
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('poma_active_customer');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = {
            ...parsed,
            firstName: contactForm.firstName,
            lastName: contactForm.lastName,
            email: contactForm.email,
            phone: contactForm.phone,
          };
          localStorage.setItem('poma_active_customer', JSON.stringify(updated));
        } catch (err) {}
      }
    }
    customer.firstName = contactForm.firstName;
    customer.lastName = contactForm.lastName;
    customer.email = contactForm.email;
    customer.phone = contactForm.phone;
    setIsEditingContact(false);
    refreshProfile();
  };

  // Save Address Changes
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress = {
      id: customer.defaultAddress?.id || `addr_${Date.now()}`,
      address1: addressForm.address1,
      address2: addressForm.address2 || undefined,
      city: addressForm.city,
      province: addressForm.province,
      zip: addressForm.zip,
      country: addressForm.country,
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('poma_active_customer');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = {
            ...parsed,
            defaultAddress: newAddress,
          };
          localStorage.setItem('poma_active_customer', JSON.stringify(updated));
        } catch (err) {}
      }
    }
    customer.defaultAddress = newAddress;
    setIsEditingAddress(false);
    refreshProfile();
  };

  // Remove Address
  const handleRemoveAddress = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('poma_active_customer');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          delete parsed.defaultAddress;
          localStorage.setItem('poma_active_customer', JSON.stringify(parsed));
        } catch (err) {}
      }
    }
    delete customer.defaultAddress;
    setIsEditingAddress(false);
    refreshProfile();
  };

  return (
    <div className="min-h-[85vh] bg-white py-14 sm:py-20 px-6 sm:px-12 lg:px-20 font-sans text-neutral-900">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Sticky Sidebar Navigation (Orders and Profiles) */}
          <div className="md:col-span-3 lg:col-span-3 md:sticky md:top-36 self-start z-10">
            <nav className="flex md:flex-col gap-6 md:gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`text-left text-2xl font-bold tracking-tight transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-neutral-600 font-semibold'
                }`}
              >
                Orders
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profiles')}
                className={`text-left text-2xl font-bold tracking-tight transition-colors cursor-pointer ${
                  activeTab === 'profiles'
                    ? 'text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-neutral-600 font-semibold'
                }`}
              >
                Profiles
              </button>
            </nav>
          </div>

          {/* Right Column: Main Content Area */}
          <div className="md:col-span-9 lg:col-span-9 max-w-2xl w-full">
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-neutral-200 bg-[#fbfbfb] p-12 text-center">
                    <Package className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-neutral-900 mb-1">No Orders Found</h3>
                    <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
                      You haven&apos;t placed any orders yet. Explore our high-performance sonic lineups.
                    </p>
                    <Link
                      href="/#shop"
                      className="inline-flex items-center justify-center h-[32px] px-5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs transition-all cursor-pointer"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order: any, orderIdx: number) => {
                      const orderNumber = order.orderNumber || order.displayId || 31;
                      const orderDate = formatDate(order.processedAt);
                      const orderTotal = formatPrice(order.totalPrice?.amount || '25', order.totalPrice?.currencyCode || 'GBP');
                      const orderStatus = formatStatus(order.fulfillmentStatus || 'DELIVERED');
                      const lineItems = order.lineItems && order.lineItems.length > 0 ? order.lineItems : [
                        {
                          title: 'Pomabrush - Nylon-Silicone Brush Heads (Pack of 4)',
                          quantity: 1,
                          imageUrl: '/products/pbh-hero.png',
                        },
                      ];

                      return (
                        <div
                          key={order.id || orderIdx}
                          className="rounded-2xl border border-neutral-200 bg-[#fbfbfb] overflow-hidden transition-all"
                        >
                          {/* 1. Header Bar: Order Placed | Total | Order no */}
                          <div className="bg-[#f8f8f8] px-6 py-4 flex items-center justify-between border-b border-neutral-200/70">
                            <div className="flex items-center gap-2 sm:gap-3 text-xs text-neutral-500">
                              <span>
                                Order Placed : <strong className="font-semibold text-neutral-900">{orderDate}</strong>
                              </span>
                              <span className="text-neutral-300">|</span>
                              <span>
                                Total : <strong className="font-semibold text-neutral-900">{orderTotal}</strong>
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500">
                              Order no : <strong className="font-semibold text-neutral-900">#{orderNumber}</strong>
                            </div>
                          </div>

                          {/* 2. Middle Body: Line Items */}
                          <div className="px-6 py-2 divide-y divide-neutral-200/70">
                            {lineItems.map((item: any, itemIdx: number) => (
                              <div
                                key={itemIdx}
                                className="flex items-center gap-4 py-4"
                              >
                                {/* Item Thumbnail */}
                                <div className="w-14 h-14 rounded-xl bg-neutral-100/90 border border-neutral-200/60 overflow-hidden relative shrink-0 flex items-center justify-center">
                                  {item.imageUrl ? (
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.title || 'Product'}
                                      fill
                                      className="object-contain p-1"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 text-neutral-400" />
                                  )}
                                </div>

                                {/* Item Info */}
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold text-neutral-900 leading-snug">
                                    {item.title || 'Pomabrush - Nylon-Silicone Brush Heads (Pack of 4)'}
                                  </h4>
                                  <p className="text-xs text-neutral-500 font-normal">
                                    Qty : {item.quantity || 1}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 3. Footer Bar: Order Status */}
                          <div className="bg-[#f8f8f8] px-6 py-3.5 border-t border-neutral-200/70">
                            <p className="text-xs text-neutral-500">
                              Order Status : <strong className="font-semibold text-neutral-900">{orderStatus}</strong>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PROFILES TAB */}
            {activeTab === 'profiles' && (
              <div className="space-y-10">
                
                {/* 1. Contact Section */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                      Contact
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingContact(true)}
                      className="h-[32px] px-4 rounded-full border border-neutral-300 hover:border-neutral-400 bg-white text-xs font-semibold text-neutral-900 transition-all hover:bg-neutral-50 cursor-pointer inline-flex items-center justify-center"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="h-[60px] rounded-2xl border border-neutral-200 bg-white px-5 flex items-center justify-between">
                    <span className="text-neutral-400 text-sm font-normal">Email</span>
                    <span className="text-neutral-900 text-sm font-normal truncate max-w-[280px] sm:max-w-md">
                      {email}
                    </span>
                  </div>
                </section>

                {/* 2. Addresses Section */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                      Addresses
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="h-[32px] px-4 rounded-full border border-neutral-300 hover:border-neutral-400 bg-white text-xs font-semibold text-neutral-900 transition-all hover:bg-neutral-50 cursor-pointer inline-flex items-center justify-center"
                    >
                      {defaultAddress ? 'Edit' : 'Add'}
                    </button>
                  </div>

                  <div className={`${defaultAddress ? 'min-h-[60px] py-3.5' : 'h-[60px]'} rounded-2xl border border-neutral-200 bg-white px-5 flex items-center justify-between`}>
                    {defaultAddress ? (
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-neutral-100/90 flex items-center justify-center text-neutral-500 shrink-0">
                          <MapPin className="w-4 h-4 stroke-[1.5]" />
                        </div>
                        <div className="text-sm space-y-0.5 text-neutral-700">
                          <p className="font-medium text-neutral-900">{firstName} {lastName}</p>
                          <p>{defaultAddress.address1} {defaultAddress.address2 ? `, ${defaultAddress.address2}` : ''} - {defaultAddress.city}, {defaultAddress.province} {defaultAddress.zip}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-neutral-100/80 flex items-center justify-center text-neutral-400 shrink-0">
                          <MapPin className="w-4 h-4 stroke-[1.5]" />
                        </div>
                        <span className="text-sm text-neutral-400 font-normal">
                          No addresses added
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                {/* 3. Sign out Button Section */}
                <section className="pt-2">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="h-[32px] px-4 rounded-xl border border-red-200 bg-white text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer inline-flex items-center justify-center"
                    >
                      Sign out
                    </button>
                    <span className="text-sm text-neutral-600 font-normal">
                      Sign out of all devices
                    </span>
                  </div>
                </section>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditingContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-[640px] max-w-[calc(100vw-32px)] border border-neutral-200 overflow-hidden relative shadow-xl"
            >
              {/* Header: End-to-end line */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-neutral-200">
                <h3 className="text-[20px] font-medium text-neutral-900">Edit Profile</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body (12px top gap, 8px field gap) */}
              <form onSubmit={handleSaveContact}>
                <div className="px-6 sm:px-8 pt-3 pb-6 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">First name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.firstName}
                        onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                        className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 text-sm font-normal text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Last name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.lastName}
                        onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                        className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 text-sm font-normal text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 text-sm font-normal text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition"
                    />
                  </div>
                </div>

                {/* Footer: End-to-end line */}
                <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-neutral-200 bg-neutral-50/40">
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(false)}
                    className="h-[32px] px-5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 rounded-full border border-neutral-300 hover:bg-neutral-100 transition cursor-pointer inline-flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-[32px] px-6 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition cursor-pointer inline-flex items-center justify-center"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT / ADD ADDRESS MODAL */}
      <AnimatePresence>
        {isEditingAddress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-[640px] max-w-[calc(100vw-32px)] border border-neutral-200 overflow-hidden relative shadow-xl"
            >
              {/* Header: End-to-end line */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-neutral-200">
                <h3 className="text-[20px] font-medium text-neutral-900">
                  {customer.defaultAddress ? 'Edit Address' : 'Add Address'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body (12px top gap, 8px field gap) */}
              <form onSubmit={handleSaveAddress}>
                <div className="px-6 sm:px-8 pt-3 pb-6 space-y-2">
                  {/* 1. Address line 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Address line 1</label>
                    <input
                      type="text"
                      required
                      value={addressForm.address1}
                      onChange={(e) => setAddressForm({ ...addressForm, address1: e.target.value })}
                      placeholder="123 Main Street"
                      className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 text-sm font-normal text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition"
                    />
                  </div>

                  {/* 2. Apartment/suite */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Apartment, suite, etc. (optional)</label>
                    <input
                      type="text"
                      value={addressForm.address2}
                      onChange={(e) => setAddressForm({ ...addressForm, address2: e.target.value })}
                      placeholder="Apt 4B"
                      className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 text-sm font-normal text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition"
                    />
                  </div>

                  {/* 3. Country */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Country</label>
                    <div className="relative">
                      <select
                        required
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full h-[48px] px-4 pr-10 rounded-xl border border-neutral-200 text-sm font-normal bg-white text-neutral-900 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition"
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

                  {/* 4. City & 5. Postal code */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="London"
                        className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 text-sm font-normal text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Postal code</label>
                      <input
                        type="text"
                        required
                        value={addressForm.zip}
                        onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                        placeholder="SW1A 1AA"
                        className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 text-sm font-normal text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer: End-to-end line */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-neutral-200 bg-neutral-50/40">
                  {customer.defaultAddress ? (
                    <button
                      type="button"
                      onClick={handleRemoveAddress}
                      className="h-[32px] flex items-center gap-1.5 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="h-[32px] px-5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 rounded-full border border-neutral-300 hover:bg-neutral-100 transition cursor-pointer inline-flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-[32px] px-6 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition cursor-pointer inline-flex items-center justify-center"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] bg-white py-16 px-4 sm:px-8 font-sans text-neutral-900">
          <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
              <div className="md:col-span-3 space-y-4">
                <div className="h-8 w-28 bg-neutral-100 rounded-lg" />
                <div className="h-8 w-28 bg-neutral-100 rounded-lg" />
              </div>
              <div className="md:col-span-9 max-w-2xl space-y-6">
                <div className="h-44 bg-neutral-100 rounded-2xl" />
                <div className="h-44 bg-neutral-100 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
