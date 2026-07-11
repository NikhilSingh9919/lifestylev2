'use client';

import React from 'react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-20 pb-10 border-t border-white/5 relative font-sans w-full">
      <div className="px-5 md:px-[80px] flex flex-col gap-16 font-sans">
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <Image
            src="/logo.svg"
            alt="Poma Logo"
            width={145}
            height={40}
            className="h-[20px] md:h-10 w-auto opacity-80"
          />
          {/* Social Buttons */}
          <div className="flex gap-4">
            {['facebook', 'instagram', 'linkedin'].map((social) => (
              <a
                key={social}
                href={`https://${social}.com`}
                target="_blank"
                rel="noreferrer"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#222222] border border-white/5 text-white hover:bg-neutral-800 transition-colors uppercase text-xs font-semibold font-sans"
              >
                {social.substring(0, 2)}
              </a>
            ))}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-8 border-t border-white/5">
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold text-white font-sans mb-2">shop</h4>
            <a href="/#shop" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">poma brush</a>
            <a href="/#shop" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">poma floss</a>
            <a href="/#shop" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">poma bru</a>
            <a href="/#shop" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">poma accessories</a>
          </div>
          {/* Col 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold text-white font-sans mb-2">poma lifestyle</h4>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">about us</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">stories</a>
          </div>
          {/* Col 3 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold text-white font-sans mb-2">support</h4>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">contact us</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">faq</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">policies</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">warranty</a>
          </div>
          {/* Col 4 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold text-white font-sans mb-2">connect with us</h4>
            <a href="https://facebook.com" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">facebook</a>
            <a href="https://instagram.com" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">instagram</a>
            <a href="https://linkedin.com" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">linkedin</a>
          </div>
        </div>

        {/* Large Brand Wordmark Graphic */}
        <div className="relative w-full h-[120px] md:h-[169px] mt-8 flex justify-center items-center pointer-events-none opacity-20 select-none">
          <Image
            src="/logo.svg"
            alt="POMA"
            fill
            className="object-contain"
          />
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-neutral-500 pt-8 border-t border-white/5 font-light font-sans">
          <p>© {new Date().getFullYear()} POMA LIFESTYLE INC. HEADLESS E-COMMERCE CORE.</p>
        </div>
      </div>
    </footer>
  );
}
