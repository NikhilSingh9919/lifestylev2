'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export default function Navbar() {
  const { setIsOpen, cartCount } = useCart();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur-md text-white"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/assets/branding/logo-light.svg"
            alt="Poma Lifestyle Logo"
            width={160}
            height={48}
            className="h-9 w-auto hover:opacity-80 transition-opacity duration-300"
          />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest text-neutral-300">
          <a href="#brush" className="hover:text-white transition-colors duration-300 relative group py-2">
            POMABRUSH
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#floss" className="hover:text-white transition-colors duration-300 relative group py-2">
            POMAFLOSS
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-6">
          <button className="text-neutral-300 hover:text-white transition-colors duration-300" aria-label="Account">
            <User className="h-5 w-5" />
          </button>

          {/* Spring-loaded Shopping Bag Icon */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center text-neutral-300 hover:text-white transition-colors duration-300"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-lg shadow-indigo-600/50"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
