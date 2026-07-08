'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProductSection from '@/components/ProductSection';
import CartDrawer from '@/components/CartDrawer';
import DiagnosticConsole from '@/components/DiagnosticConsole';
import { CartProvider } from '@/context/CartContext';
import { Sparkles, ArrowDown } from 'lucide-react';

export default function Home() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
        {/* Transparent Background Grid */}
        <div className="absolute inset-0 -z-30 h-full w-full bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Top Header Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-20 h-[500px] w-full max-w-7xl rounded-full bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl" />

        <Navbar />

        <main>
          {/* Antigravity Hero Section */}
          <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center sm:px-8">
            <div className="space-y-6 max-w-4xl">
              {/* Micro-badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-indigo-300 uppercase"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
                MODERN STOREFRONT CORE v2.0
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl"
              >
                POMA{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  LIFESTYLE
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mx-auto max-w-2xl text-base font-light text-neutral-400 leading-relaxed sm:text-lg"
              >
                Experience weightless performance. A premium, high-speed Headless storefront coupled securely to an isolated Shopify engine. Built to look stunning, run at zero hosting cost, and deliver checkout confidence.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4"
              >
                <a
                  href="#shop"
                  className="group relative flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-xs font-bold tracking-widest text-black uppercase shadow-lg shadow-white/10 hover:bg-neutral-200 transition-all duration-300 cursor-pointer"
                >
                  DISCOVER PRODUCTS
                  <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
                </a>
              </motion.div>
            </div>

            {/* Antigravity floating dots */}
            <div className="absolute inset-0 pointer-events-none -z-10">
              <motion.div
                animate={{
                  y: [0, -25, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-purple-500"
              />
              <motion.div
                animate={{
                  y: [0, -35, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-indigo-500"
              />
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2,
                }}
                className="absolute bottom-1/4 left-1/3 h-1.5 w-1.5 rounded-full bg-pink-500"
              />
            </div>
          </section>

          <ProductSection />
        </main>

        <footer className="border-t border-white/5 py-12 text-center text-xs text-neutral-500 font-light tracking-wider">
          <p>© {new Date().getFullYear()} POMA LIFESTYLE INC. HEADLESS E-COMMERCE CORE.</p>
        </footer>

        {/* Global Cart Drawer sliding overlay */}
        <CartDrawer />

        {/* E2E Test Suite Floating Terminal Console */}
        <DiagnosticConsole />
      </div>
    </CartProvider>
  );
}
