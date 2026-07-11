'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function Navbar() {
  const { setIsOpen, cartCount } = useCart();
  const { customer } = useAuth();

  return (
    <div className="w-full flex flex-col z-40 sticky top-0">
      {/* Announcement Bar / Frame 19 */}
      <div className="w-full bg-[#111111] overflow-hidden py-2.5 border-b border-white/5 select-none">
        <div className="flex whitespace-nowrap">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ ease: 'linear', duration: 20, repeat: Infinity }}
            className="flex items-center gap-10 pr-10 text-sm font-medium text-white uppercase font-sans"
          >
            <span>Enjoy 10% off your first purchase</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
            <span>Enjoy 10% off your first purchase</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
            <span>Enjoy 10% off your first purchase</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
            <span>Enjoy 10% off your first purchase</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
            
            {/* Duplicate for seamless looping */}
            <span>Enjoy 10% off your first purchase</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
            <span>Enjoy 10% off your first purchase</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
            <span>Enjoy 10% off your first purchase</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
            <span>Enjoy 10% off your first purchase</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
          </motion.div>
        </div>
      </div>

      {/* Main Navbar */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className="w-full h-20 bg-[#111111] text-white flex items-center border-b border-white/5"
      >
        <div className="w-full flex items-center justify-between mx-[80px]">
          {/* Brand Logo */}
          <a href="/" className="flex items-center cursor-pointer">
            <Image
              src="/assets/branding/logo.svg"
              alt="Poma Lifestyle Logo"
              width={145}
              height={40}
              className="h-8 w-auto hover:opacity-80 transition-opacity duration-300"
              priority
            />
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-300">
            <a href="#" className="hover:text-white transition-colors duration-300 relative group py-2">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#shop" className="hover:text-white transition-colors duration-300 relative group py-2">
              Shop
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#about" className="hover:text-white transition-colors duration-300 relative group py-2">
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#faq" className="hover:text-white transition-colors duration-300 relative group py-2">
              FAQ
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-4">
            {/* Account Pill */}
            <a
              href={customer ? '/account' : '/login'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#111111] hover:bg-neutral-200 transition-colors duration-300 text-sm font-semibold cursor-pointer font-sans"
            >
              <User className="h-4 w-4 stroke-[2.5]" />
              {customer ? `Hi, ${customer.firstName}` : 'Account'}
            </a>

            {/* Cart Pill */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#111111] hover:bg-neutral-200 transition-colors duration-300 text-sm font-semibold cursor-pointer font-sans"
            >
              <ShoppingBag className="h-4 w-4 stroke-[2.5]" />
              <span>Cart</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#111111] px-1 text-[10px] font-bold text-white shadow-lg"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>
    </div>
  );
}
