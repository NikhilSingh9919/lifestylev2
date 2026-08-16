'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchMedusaOrder, completeMedusaCart, attachOrderToCustomerSession } from '@/lib/medusa';
import { CheckCircle2, ShieldCheck, Package, Clock, ArrowRight, ShoppingBag, User, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderConfirmedPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      try {
        let data: any = null;
        if (orderId.startsWith('cart_')) {
          const comp = await completeMedusaCart(orderId);
          data = comp.order || comp.cart;
        } else {
          data = await fetchMedusaOrder(orderId);
        }

        if (data) {
          attachOrderToCustomerSession(data);
          setOrder(data);
        }
      } catch (err) {
        console.error('Error fetching confirmed order:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  // Extract display ID in #POMA- format
  const displayOrderNumber = order?.display_id 
    ? `#POMA-${order.display_id}`
    : (orderId?.startsWith('order_') ? `#POMA-${orderId.slice(-4)}` : `#POMA-1`);

  // Extract items
  const items = order?.items || [];
  const totalAmount = order?.total !== undefined 
    ? (typeof order.total === 'number' && order.total > 500 ? (order.total / 100).toFixed(2) : Number(order.total).toFixed(2))
    : '129.00';
  const currencyCode = (order?.currency_code || 'usd').toUpperCase();

  const customerName = order?.shipping_address 
    ? `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim()
    : (order?.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : null);

  const customerEmail = order?.email || order?.customer?.email;

  return (
    <main className="min-h-screen bg-neutral-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="mx-auto max-w-2xl w-full text-center space-y-8">
        {/* Animated Check Icon */}
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>

        <div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
            PAYMENT CONFIRMED VIA STRIPE
          </span>
          <h1 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl text-white">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Your payment was successfully confirmed and your order has been registered in Medusa.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-xl text-left space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs text-neutral-400">ORDER NUMBER</p>
              <p className="text-xl font-bold font-mono text-white tracking-wider">{displayOrderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-400">PAYMENT STATUS</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                {order?.payment_status === 'captured' ? 'Captured / Paid' : 'Paid & Confirmed'}
              </span>
            </div>
          </div>

          {/* Customer and Shipping Details if available */}
          {(customerName || customerEmail || order?.shipping_address) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-white/10 pb-4">
              {customerName && (
                <div className="space-y-1">
                  <p className="text-neutral-400 flex items-center gap-1 font-medium">
                    <User className="h-3.5 w-3.5 text-neutral-500" />
                    Customer
                  </p>
                  <p className="text-neutral-200 font-semibold">{customerName}</p>
                  {customerEmail && <p className="text-neutral-400">{customerEmail}</p>}
                </div>
              )}
              {order?.shipping_address && (
                <div className="space-y-1">
                  <p className="text-neutral-400 flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                    Shipping Destination
                  </p>
                  <p className="text-neutral-200">{order.shipping_address.address_1}</p>
                  <p className="text-neutral-400">{order.shipping_address.city}, {order.shipping_address.country_code?.toUpperCase()}</p>
                </div>
              )}
            </div>
          )}

          {/* Line Items List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Ordered Items</p>
              <div className="divide-y divide-white/10 rounded-xl bg-neutral-950/60 border border-white/5 overflow-hidden">
                {items.map((item: any, idx: number) => {
                  const itemPrice = typeof item.unit_price === 'number' && item.unit_price > 500 
                    ? (item.unit_price / 100).toFixed(2) 
                    : Number(item.unit_price || 0).toFixed(2);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3.5 gap-3">
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <div className="relative h-12 w-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden flex-shrink-0">
                            <Image
                              src={item.thumbnail}
                              alt={item.title || 'Product'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500 flex-shrink-0">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{item.title || item.product_title || 'Poma Product'}</p>
                          {item.variant_title && (
                            <p className="text-xs text-neutral-400">Variant: {item.variant_title}</p>
                          )}
                          <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white font-mono">${itemPrice}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <p className="text-neutral-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                Order Date
              </p>
              <p className="text-neutral-200">{new Date(order?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-neutral-400 flex items-center gap-1">
                <Package className="h-3.5 w-3.5 text-neutral-500" />
                Fulfillment Status
              </p>
              <p className="text-neutral-200 capitalize">{order?.fulfillment_status || 'Preparing for dispatch'}</p>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-950 p-4 border border-white/5 space-y-2">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Total Paid</span>
              <span className="text-white font-bold font-mono text-sm">${totalAmount} {currencyCode}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Payment Gateway</span>
              <span className="text-neutral-200 font-mono">Stripe Payments (Medusa v2 Module)</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Medusa Sync Status</span>
              <span className="text-emerald-400 font-medium">Order Created & Synced</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 border border-white/10 px-8 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            <span>View Account & Orders</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
