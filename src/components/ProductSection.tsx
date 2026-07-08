'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import { useCart } from '@/context/CartContext';
import { Sparkles, ShoppingBag, Info, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  handle: string;
  badge: string;
  themeColor: string;
}

function ProductCard({ handle, badge, themeColor }: ProductCardProps) {
  const { product, loading, error, isOutOfStock } = useShopifyProduct(handle);
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="flex h-[550px] w-full flex-col items-center justify-center rounded-3xl border border-white/5 bg-neutral-900/40 backdrop-blur-md">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="mt-4 text-sm text-neutral-400 font-light tracking-widest">LOADING PRODUCT...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-[550px] w-full flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-neutral-900/40 p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-400 mb-4" />
        <p className="text-sm font-medium text-white">FAILED TO LOAD PRODUCT</p>
        <p className="mt-1 text-xs text-neutral-400 font-light">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const primaryVariant = product.variants.nodes[0];
  const price = primaryVariant?.price || product.priceRange.minVariantPrice.amount;
  const imageNode = product.images.nodes[0];
  const imageUrl = imageNode?.url || '/assets/products/placeholder.png';

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart({
      variantId: primaryVariant.id,
      productId: product.id,
      title: product.title,
      price,
      imageUrl,
      handle: product.handle,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-700 ${
        isOutOfStock
          ? 'border-white/5 bg-neutral-900/10 opacity-40 grayscale pointer-events-none'
          : 'border-white/10 bg-neutral-900/30 hover:border-white/20 hover:bg-neutral-900/50 hover:shadow-2xl hover:shadow-indigo-500/5'
      }`}
    >
      {/* Decorative Gradient Glows */}
      <div className={`absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full blur-3xl opacity-20 transition-all duration-700 group-hover:scale-110 ${themeColor}`} />

      {/* Card Body */}
      <div className="p-6 sm:p-8">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-indigo-300 uppercase">
            <Sparkles className="h-3 w-3" />
            {isOutOfStock ? 'SOLD OUT' : badge}
          </span>
          <span className="text-xs text-neutral-400 font-light tracking-wider">SKU: {primaryVariant?.sku || 'N/A'}</span>
        </div>

        {/* Floating Product Image Container */}
        <div className="relative h-64 w-full cursor-pointer mb-6 overflow-hidden rounded-2xl bg-neutral-950/20 border border-white/5 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: isOutOfStock ? 1 : 1.05, y: isOutOfStock ? 0 : -8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative h-full w-full flex items-center justify-center p-4"
          >
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-contain p-2 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </div>

        {/* Title and Description */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold tracking-tight text-white">{product.title}</h3>
          <p className="text-sm font-light text-neutral-400 leading-relaxed min-h-[72px]">
            {product.description}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="border-t border-white/5 bg-black/20 p-6 sm:p-8 space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-light text-neutral-400 tracking-wider">PRICE</span>
          <span className="text-3xl font-extrabold text-white tracking-tight">${parseFloat(price).toFixed(2)}</span>
        </div>

        {/* Buy Action Button */}
        <motion.button
          whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
          whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
            isOutOfStock
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
              : 'bg-white text-black hover:bg-neutral-200 cursor-pointer shadow-lg hover:shadow-white/10'
          }`}
        >
          {isOutOfStock ? (
            'OUT OF STOCK'
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              ADD TO BAG
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ProductSection() {
  return (
    <section id="shop" className="mx-auto max-w-7xl px-6 py-24 sm:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      
      {/* Section Header */}
      <div className="text-center mb-16 space-y-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-semibold tracking-widest text-indigo-400 uppercase"
        >
          PREMIUM ESSENTIALS
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-black tracking-tight text-white sm:text-5xl"
        >
          ELEVATE YOUR DAILY RITUAL
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-2xl text-sm font-light text-neutral-400 leading-relaxed"
        >
          A minimalist storefront engineered for peak performance and secure shopping. Experience weightless aesthetics connected to a reliable e-commerce core.
        </motion.p>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <ProductCard
          handle="pomabrush-hero"
          badge="BESTSELLER"
          themeColor="bg-indigo-500"
        />
        <ProductCard
          handle="pomafloss-floating"
          badge="INNOVATION"
          themeColor="bg-purple-500"
        />
      </div>

      {/* Structural Accordion / Product Info Drawer */}
      <div className="mt-20 border-t border-white/10 pt-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex gap-4 p-4 rounded-2xl bg-neutral-900/10 border border-white/5">
            <Info className="h-6 w-6 text-indigo-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">Secure Card Handling</h4>
              <p className="mt-1 text-xs text-neutral-400 font-light leading-relaxed">
                Direct integration with Shopify Starter ensures payment details are fully sandbox-isolated.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-2xl bg-neutral-900/10 border border-white/5">
            <Sparkles className="h-6 w-6 text-indigo-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">Antigravity Design</h4>
              <p className="mt-1 text-xs text-neutral-400 font-light leading-relaxed">
                Sleek typography, vibrant gradients, and lightweight spring interactions that respond to you.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-2xl bg-neutral-900/10 border border-white/5">
            <ShoppingBag className="h-6 w-6 text-indigo-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">Dynamic Stock Validations</h4>
              <p className="mt-1 text-xs text-neutral-400 font-light leading-relaxed">
                Real-time variant checks disable checkouts instantly when the backend report reflects zero stock.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
