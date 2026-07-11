'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ShoppingBag,
  MapPin,
  LogOut,
  Calendar,
  CreditCard,
  Truck,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AccountPage() {
  const { customer, loading, logout } = useAuth();
  const router = useRouter();
  const [openOrderIdx, setOpenOrderIdx] = useState<number | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!loading && !customer) {
      router.push('/login?redirect=/account');
    }
  }, [customer, loading, router]);

  if (loading || !customer) {
    return (
      <div className="min-h-[80vh] bg-neutral-50 py-16 px-4 font-sans text-neutral-900">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="h-10 w-48 bg-neutral-200 rounded-lg" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Profile Skeleton */}
            <div className="lg:col-span-1 space-y-6">
              <div className="h-[250px] bg-neutral-200 rounded-2xl" />
              <div className="h-[150px] bg-neutral-200 rounded-2xl" />
            </div>
            
            {/* Right Column Orders Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-32 bg-neutral-200 rounded" />
              <div className="h-[120px] bg-neutral-200 rounded-2xl" />
              <div className="h-[120px] bg-neutral-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { firstName, lastName, email, phone, defaultAddress, orders = [] } = customer;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (amount: string, currencyCode: string = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    });
    return formatter.format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === 'paid' || lower === 'fulfilled') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (lower === 'pending' || lower === 'unfulfilled') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-neutral-100 text-neutral-600 border-neutral-200';
  };

  return (
    <div className="min-h-[85vh] bg-neutral-50 py-16 px-4 sm:px-6 lg:px-8 font-sans text-neutral-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-8 mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-950">
              Welcome, {firstName}!
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Manage your orders, profile, and subscription details below.
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 hover:bg-neutral-100 hover:text-neutral-950 transition-all duration-300 text-sm font-semibold text-neutral-600 cursor-pointer w-fit"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Personal Info & Address */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/60 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-950 flex items-center gap-2 mb-5">
                <User className="h-5 w-5 text-neutral-400" />
                Profile Details
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Full Name</span>
                  <span className="font-medium text-neutral-800">{firstName} {lastName}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Email Address</span>
                  <span className="font-medium text-neutral-800">{email}</span>
                </div>
                {phone && (
                  <div>
                    <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Phone</span>
                    <span className="font-medium text-neutral-800">{phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/60 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-950 flex items-center gap-2 mb-5">
                <MapPin className="h-5 w-5 text-neutral-400" />
                Shipping Address
              </h3>
              {defaultAddress ? (
                <div className="space-y-2 text-sm text-neutral-700">
                  <p className="font-semibold text-neutral-800">{firstName} {lastName}</p>
                  <p>{defaultAddress.address1}</p>
                  {defaultAddress.address2 && <p>{defaultAddress.address2}</p>}
                  <p>{defaultAddress.city}, {defaultAddress.province} {defaultAddress.zip}</p>
                  <p className="font-medium text-neutral-500">{defaultAddress.country}</p>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-neutral-400">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No default shipping address saved.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950 flex items-center gap-2.5">
              <ShoppingBag className="h-6 w-6 text-neutral-400" />
              Order History
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200/60 p-12 text-center shadow-sm">
                <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 mb-1">No Orders Found</h3>
                <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
                  You haven&apos;t placed any premium orders yet. Explore our high-performance sonic lineups.
                </p>
                <Link
                  href="/#shop"
                  className="inline-flex items-center justify-center py-2.5 px-6 rounded-full bg-[#111111] hover:bg-neutral-800 text-white font-semibold text-sm transition-all duration-300 cursor-pointer"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, orderIdx) => {
                  const isOpen = openOrderIdx === orderIdx;
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden transition-all duration-300"
                    >
                      {/* Summary Row */}
                      <div
                        onClick={() => setOpenOrderIdx(isOpen ? null : orderIdx)}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 cursor-pointer hover:bg-neutral-50/50 transition-colors select-none gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-neutral-900 text-lg">
                              Order #{order.orderNumber}
                            </span>
                            <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(order.processedAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-800">
                              {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
                            </span>
                            <span className="text-neutral-300">|</span>
                            <span className="text-xs text-neutral-500 font-medium">
                              {order.lineItems.length} {order.lineItems.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.financialStatus)}`}>
                              <CreditCard className="h-3 w-3 mr-1" />
                              {order.financialStatus}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.fulfillmentStatus)}`}>
                              <Truck className="h-3 w-3 mr-1" />
                              {order.fulfillmentStatus}
                            </span>
                          </div>
                          <div className="text-neutral-400 sm:block hidden">
                            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </div>
                      </div>

                      {/* Detail Accordion Panel */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-neutral-100 bg-neutral-50/40"
                          >
                            <div className="p-6 space-y-4">
                              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                                Line Items
                              </h4>
                              <div className="divide-y divide-neutral-100 bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-inner">
                                {order.lineItems.map((item, itemIdx) => (
                                  <div
                                    key={itemIdx}
                                    className="flex items-center justify-between p-4 gap-4"
                                  >
                                    <div className="flex items-center gap-3.5">
                                      {item.imageUrl ? (
                                        <div className="relative h-12 w-12 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
                                          <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="h-12 w-12 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 flex-shrink-0">
                                          <Package className="h-5 w-5" />
                                        </div>
                                      )}
                                      <div>
                                        <h5 className="font-semibold text-neutral-800 text-sm leading-tight">
                                          {item.title}
                                        </h5>
                                        <span className="text-xs text-neutral-500">
                                          Qty: {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
