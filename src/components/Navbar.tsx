'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function Navbar() {
  const { setIsOpen, cartCount } = useCart();
  const { customer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/#shop' },
    { label: 'About Us', href: '/#about' },
    { label: 'FAQ', href: '/faq' },
  ];

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
        className="w-full h-20 bg-[#111111] text-white flex items-center border-b border-white/5 relative z-50"
      >
        <div className="w-full flex items-center justify-between px-5 md:px-[80px]">
          {/* Brand Logo */}
          <a href="/" className="flex items-center cursor-pointer">
            <Image
              src="/logo.svg"
              alt="Poma Lifestyle Logo"
              width={145}
              height={40}
              className="h-[20px] md:h-[32px] w-auto hover:opacity-80 transition-opacity duration-300"
              priority
            />
          </a>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-base font-semibold text-neutral-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors duration-300 relative group py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Account Pill */}
            <a
              href={customer ? '/account' : '/login'}
              className="flex items-center justify-center gap-2 p-2.5 md:px-5 md:py-2.5 rounded-full bg-white text-[#111111] hover:bg-neutral-200 transition-colors duration-300 text-xs md:text-sm font-semibold cursor-pointer font-sans"
              title={customer ? `Hi, ${customer.firstName}` : 'Account'}
            >
              <User className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden md:inline">{customer ? `Hi, ${customer.firstName}` : 'Account'}</span>
            </a>

            {/* Cart Pill */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center justify-center gap-2 p-2.5 md:px-5 md:py-2.5 rounded-full bg-white text-[#111111] hover:bg-neutral-200 transition-colors duration-300 text-xs md:text-sm font-semibold cursor-pointer font-sans"
            >
              <ShoppingBag className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden md:inline">Cart</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-1 -right-1 md:relative md:top-auto md:right-auto flex h-4 md:h-5 min-w-[16px] md:min-w-[20px] items-center justify-center rounded-full bg-[#111111] px-1 text-[9px] md:text-[10px] font-bold text-white shadow-lg"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Hamburger Button (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Drawer/Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
              style={{ top: '120px' }}
            />
            {/* Menu Panel */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-full left-0 right-0 bg-[#111111] border-b border-white/5 z-40 md:hidden overflow-y-auto max-h-[70vh] shadow-xl"
            >
              <nav className="flex flex-col px-5 py-6 gap-4 text-base font-semibold text-neutral-300">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 hover:text-white border-b border-white/5 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
