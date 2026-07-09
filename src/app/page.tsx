'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import DiagnosticConsole from '@/components/DiagnosticConsole';
import { CartProvider, useCart } from '@/context/CartContext';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Inline Product Card for bestsellers and accessories
interface ProductCardProps {
  handle: string;
  imageOverride?: string;
  titleOverride?: string;
  descriptionOverride?: string;
  priceOverride?: string;
  hideDescription?: boolean;
}

function ProductCard({ handle, imageOverride, titleOverride, descriptionOverride, priceOverride, hideDescription }: ProductCardProps) {
  const { product, loading, error } = useShopifyProduct(handle);
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<'black' | 'white'>('black');

  if (loading) {
    return (
      <div className="flex h-[550px] w-full flex-col items-center justify-center rounded-[8px] bg-neutral-100 animate-pulse">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-[550px] w-full flex-col items-center justify-center rounded-[8px] bg-red-50 p-6 text-center border border-red-200">
        <p className="text-sm font-semibold text-red-600">FAILED TO LOAD PRODUCT</p>
      </div>
    );
  }

  const primaryVariant = product.variants.nodes[0];
  const price = priceOverride || primaryVariant?.price || product.priceRange.minVariantPrice.amount;
  const imageUrl = imageOverride || product.images.nodes[0]?.url || '/assets/products/placeholder.png';
  const title = titleOverride || product.title;
  const description = descriptionOverride || product.description;

  const handleAdd = () => {
    addToCart({
      variantId: primaryVariant.id,
      productId: product.id,
      title: `${title} (${selectedColor === 'black' ? 'Charcoal Black' : 'Cotton White'})`,
      price,
      imageUrl,
      handle: product.handle,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-between rounded-[8px] bg-neutral-50 p-6 border border-neutral-200/60 transition-all duration-300 h-full group"
    >
      <div>
        {/* White Image Container (1:1 aspect-square, covers card, rounded-8px) */}
        <div className="relative aspect-square w-full rounded-[8px] bg-white flex items-center justify-center overflow-hidden mb-[20px] border border-neutral-100/50">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500 rounded-[8px]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        {/* Color Selectors (24px circles) */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedColor('black')}
            className={`w-6 h-6 rounded-full border bg-neutral-900 transition-all ${selectedColor === 'black' ? 'border-neutral-900 scale-110 ring-2 ring-neutral-300' : 'border-transparent opacity-60'
              }`}
            aria-label="Select Charcoal Black"
          />
          <button
            onClick={() => setSelectedColor('white')}
            className={`w-6 h-6 rounded-full border bg-white transition-all ${selectedColor === 'white' ? 'border-neutral-950 scale-110 ring-2 ring-neutral-300' : 'border-transparent opacity-60'
              }`}
            aria-label="Select Cotton White"
          />
        </div>

        {/* Title and Info */}
        <h3 className="text-[20px] font-semibold text-neutral-900 leading-snug mb-2 font-sans lowercase">
          {title}
        </h3>
        {!hideDescription && (
          <p className="text-[16px] font-normal text-neutral-500 leading-relaxed font-sans line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Price & Cart row with hover morph transition (32px padding above) */}
      <div className="flex items-center justify-between pt-[32px] border-t border-neutral-100 h-16 w-full gap-[12px]">
        <span className="text-[24px] font-bold text-neutral-900 flex-shrink-0">
          £{parseFloat(price).toFixed(2)}
        </span>
        <button
          onClick={handleAdd}
          className="h-14 w-14 group-hover:w-[110px] transition-all duration-300 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer flex items-center justify-start gap-2 px-4 overflow-hidden flex-shrink-0 font-sans"
        >
          <ShoppingBag className="h-6 w-6 flex-shrink-0" />
          <span className="w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 text-sm font-semibold whitespace-nowrap overflow-hidden">
            Add
          </span>
        </button>
      </div>
    </motion.div>
  );
}

function PomaHome() {
  const { addToCart } = useCart();
  const { product: heroProduct } = useShopifyProduct('pomabrush');
  const { product: bruProduct } = useShopifyProduct('pomabru');
  const { product: flossProduct } = useShopifyProduct('pomafloss');

  const [heroActiveIndex, setHeroActiveIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (isHeroHovered) return;
    const timer = setInterval(() => {
      setHeroActiveIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  const bestSellersRef = React.useRef<HTMLDivElement>(null);
  const accessoriesRef = React.useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth / 2;
      ref.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAddHero = () => {
    if (!heroProduct) return;
    const variant = heroProduct.variants.nodes[0];
    addToCart({
      variantId: variant.id,
      productId: heroProduct.id,
      title: heroProduct.title,
      price: variant.price,
      imageUrl: heroProduct.images.nodes[0].url,
      handle: heroProduct.handle,
    });
  };

  const handleAddBru = () => {
    if (!bruProduct) return;
    const variant = bruProduct.variants.nodes[0];
    addToCart({
      variantId: variant.id,
      productId: heroProduct?.id || 'pomabru',
      title: bruProduct.title,
      price: variant.price,
      imageUrl: bruProduct.images.nodes[0].url,
      handle: bruProduct.handle,
    });
  };

  const handleAddFloss = () => {
    if (!flossProduct) return;
    const variant = flossProduct.variants.nodes[0];
    addToCart({
      variantId: variant.id,
      productId: flossProduct.id,
      title: flossProduct.title,
      price: variant.price,
      imageUrl: flossProduct.images.nodes[0].url,
      handle: flossProduct.handle,
    });
  };

  const heroCarouselProducts = [
    {
      handle: 'pomabrush',
      title: heroProduct?.title || 'pomabrush model 2.0',
      price: heroProduct?.variants.nodes[0]?.price || '135.00',
      image: '/assets/figma/hero-featured.png',
      handleAdd: handleAddHero
    },
    {
      handle: 'pomafloss',
      title: flossProduct?.title || 'pomafloss active dispenser',
      price: flossProduct?.variants.nodes[0]?.price || '39.00',
      image: '/assets/figma/lineup-pomafloss.png',
      handleAdd: handleAddFloss
    },
    {
      handle: 'pomabru',
      title: bruProduct?.title || 'pomabru espresso traveler',
      price: bruProduct?.variants.nodes[0]?.price || '99.00',
      image: '/assets/figma/lineup-pomabru.png',
      handleAdd: handleAddBru
    }
  ];

  const activeHeroProduct = heroCarouselProducts[heroActiveIndex];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      <Navbar />

      <main>
        {/* HERO SECTION / Frame 2 */}
        <section className="relative h-[720px] bg-[#111111] text-white flex flex-col justify-between overflow-hidden">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/figma/hero-bg.png"
              alt="Smile Freely with Poma Background"
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>

          <div className="relative z-10 w-[calc(100%-160px)] mx-[80px] h-full py-[60px] flex flex-col justify-between flex-grow">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-[100px] font-extrabold leading-none text-white mt-[20px]"
            >
              Smile freely with poma
            </motion.h1>

            {/* Bottom Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-xl"
              >
                <p className="text-2xl md:text-[40px] font-medium text-white leading-tight lowercase">
                  beautiful oral care designed for brighter, healthier smiles.
                </p>
              </motion.div>

              {/* Featured Product Overlay Wrapper containing Card and Dots */}
              <div className="flex items-center gap-4">
                {/* Featured Product Overlay Card / Frame 41 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  onMouseEnter={() => setIsHeroHovered(true)}
                  onMouseLeave={() => setIsHeroHovered(false)}
                  className="w-full md:w-[411px] rounded-3xl bg-[#111111]/45 backdrop-blur-lg border border-white/10 p-6 flex flex-col gap-6 group/hero-card hover:ring-[1px] hover:ring-white/60 transition-all duration-300"
                >
                  <div className="flex items-center gap-6">
                    {/* Thumbnail (image fills container) */}
                    <div className="relative w-[103px] h-[103px] rounded-2xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image
                        src={activeHeroProduct.image}
                        alt={activeHeroProduct.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Title and price */}
                    <div className="flex flex-col justify-center flex-grow">
                      <h4 className="text-lg font-semibold text-white lowercase">{activeHeroProduct.title}</h4>
                      <div className="flex items-center justify-between mt-2 gap-[12px]">
                        <span className="text-2xl font-bold text-white">£{parseFloat(activeHeroProduct.price).toFixed(2)}</span>
                        {/* Black morphing add to bag button */}
                        <button
                          onClick={activeHeroProduct.handleAdd}
                          className="h-14 w-14 group-hover/hero-card:w-[110px] transition-all duration-300 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 border border-white/10 cursor-pointer flex items-center justify-start gap-2 px-4 overflow-hidden flex-shrink-0 font-sans"
                        >
                          <ShoppingBag className="h-6 w-6 flex-shrink-0" />
                          <span className="w-0 opacity-0 group-hover/hero-card:w-auto group-hover/hero-card:opacity-100 transition-all duration-300 text-sm font-semibold whitespace-nowrap overflow-hidden">
                            Add
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Vertically centered Dots on the right side of the card */}
                <div className="flex flex-col gap-3 justify-center">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroActiveIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${heroActiveIndex === idx ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                        }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPLORE THE LINE-UP / Frame 3 */}
        <section id="shop" className="bg-white py-20">
          <div className="mx-[80px]">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-[48px] font-bold text-[#111111] mb-12"
            >
              Explore the line-up
            </motion.h2>

            {/* Product categories grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { prefix: 'poma', suffix: 'brush', handle: 'pomabrush', img: '/assets/figma/lineup-pomabrush.png' },
                { prefix: 'poma', suffix: 'floss', handle: 'pomafloss', img: '/assets/figma/lineup-pomafloss.png' },
                { prefix: 'poma', suffix: 'bru', handle: 'pomabru', img: '/assets/figma/lineup-pomabru.png' },
                { prefix: 'poma', suffix: 'accessoris', handle: 'pomaaccessoris', img: '/assets/figma/lineup-pomaaccessories.png' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col gap-5 cursor-pointer group"
                >
                  <div className="relative aspect-[3/4] w-full flex items-center justify-center overflow-hidden rounded-[12px]">
                    <Image
                      src={item.img}
                      alt={item.prefix + item.suffix}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-[12px]"
                    />
                  </div>
                  <h3 className="text-[32px] font-normal text-[#111111] leading-none group-hover:text-neutral-600 transition-colors lowercase">
                    <span className="font-semibold">{item.prefix}</span>{item.suffix}
                  </h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTIONS BANNER / Frame 17 */}
        <section className="relative h-[720px] text-white overflow-hidden mx-[80px] rounded-[24px] p-[40px]">
          {/* Background image & Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/figma/solutions-bg.png"
              alt="Solutions Background"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#111111]/30" />
          </div>

          {/* Centered Heading */}
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
            <h2 className="text-[60px] font-extrabold leading-[1.2] max-w-4xl text-white text-center lowercase">
              Conscious solutions<br />for modern living
            </h2>
          </div>

          {/* Bottom Right Info Card */}
          <div className="absolute bottom-[40px] right-[40px] z-20 max-w-[373px] flex flex-col gap-6 w-full md:w-[373px]">
            <p className="text-[20px] text-white/80 font-normal leading-[1.5]">
              We create products for people who value rituals. But with more intention, where it already exists.
            </p>
            <a
              href="#shop"
              className="inline-flex items-center justify-center px-12 py-4 rounded-full bg-white text-[#111111] text-lg font-bold hover:bg-neutral-200 transition-all w-full shadow-lg cursor-pointer font-sans"
            >
              Shop now
            </a>
          </div>
        </section>

        {/* BEST SELLERS / Frame 18 */}
        <section className="bg-white py-20">
          <div className="mx-[80px]">
            {/* Header row */}
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl md:text-[48px] font-bold text-[#111111]">
                You shouldn’t miss on these
              </h2>
              {/* Carousel Arrows */}
              <div className="flex gap-4">
                <button
                  onClick={() => scroll(bestSellersRef, 'left')}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => scroll(bestSellersRef, 'right')}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Product Cards Row (Scrollable Carousel, restored fixed width) */}
            <div
              ref={bestSellersRef}
              className="flex overflow-x-auto no-scrollbar scroll-smooth gap-8 w-full pb-4"
            >
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomabrush"
                  imageOverride="/assets/figma/bestseller-1.png"
                  titleOverride="pomabrush model 2.0"
                />
              </div>
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomabrush"
                  imageOverride="/assets/figma/bestseller-2.png"
                  titleOverride="pomabrush model 2.0"
                />
              </div>
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomabrush"
                  imageOverride="/assets/figma/bestseller-3.png"
                  titleOverride="pomabrush model 2.0"
                />
              </div>
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomabrush"
                  imageOverride="/assets/figma/bestseller-4.png"
                  titleOverride="pomabrush model 2.0"
                />
              </div>
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomafloss"
                  imageOverride="/assets/figma/lineup-pomafloss.png"
                  titleOverride="pomafloss active dispenser"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PROMO / Frame 21 */}
        <section className="bg-white py-12">
          <div className="mx-[80px] rounded-[24px] bg-black text-white h-[560px] overflow-hidden relative p-[40px]">
            {/* Promo Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/assets/figma/skipcafe-bg.png"
                alt="Skip the Cafe Background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#111111]/30" />
            </div>

            {/* Content Left (Vertically centered "middle", left aligned) */}
            <div className="relative z-10 h-full flex flex-col justify-center text-left max-w-[485px]">
              <h2 className="text-[60px] font-extrabold leading-[1.2] text-white lowercase mb-[20px]">
                skip the café
              </h2>
              <p className="text-[20px] text-white/80 font-normal leading-[1.5] mb-6">
                From early flights to quiet mountain mornings, it reimagines the ritual of espresso for modern travel-combining convenience, precision, and the pleasure of a perfect cup.
              </p>
              <button
                onClick={handleAddBru}
                className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white text-[#111111] text-lg font-bold hover:bg-neutral-200 transition-colors w-full cursor-pointer shadow-lg font-sans"
              >
                Get Pomabru
              </button>
            </div>
          </div>
        </section>

        {/* ACCESSORIES / Frame 23 */}
        <section className="bg-white py-20">
          <div className="mx-[80px]">
            {/* Header row */}
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl md:text-[48px] font-bold text-[#111111]">
                Don’t forget your accessories
              </h2>
              {/* Carousel Arrows */}
              <div className="flex gap-4">
                <button
                  onClick={() => scroll(accessoriesRef, 'left')}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => scroll(accessoriesRef, 'right')}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Product Cards Row (Scrollable Carousel, restored fixed width) */}
            <div
              ref={accessoriesRef}
              className="flex overflow-x-auto no-scrollbar scroll-smooth gap-8 w-full pb-4"
            >
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomaaccessoris"
                  imageOverride="/assets/figma/accessory-1.png"
                  titleOverride="pomabrush advanced brush heads - pack of 4"
                  hideDescription={true}
                />
              </div>
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomaaccessoris"
                  imageOverride="/assets/figma/accessory-2.png"
                  titleOverride="pomabrush charging base"
                  descriptionOverride="Sleek magnetic inductive USB-C charger for your PomaBrush."
                  hideDescription={true}
                />
              </div>
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomaaccessoris"
                  imageOverride="/assets/figma/accessory-3.png"
                  titleOverride="poma travel leather case"
                  descriptionOverride="Finished in full-grain Italian leather, designed for jetsetters."
                  hideDescription={true}
                />
              </div>
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomaaccessoris"
                  imageOverride="/assets/figma/accessory-4.png"
                  titleOverride="pomabrush replacement case"
                  descriptionOverride="Keep your toothbrush clean with the original charging travel case."
                  hideDescription={true}
                />
              </div>
              <div className="w-[296px] min-w-[296px] flex-shrink-0">
                <ProductCard
                  handle="pomaaccessoris"
                  imageOverride="/assets/figma/lineup-pomaaccessories.png"
                  titleOverride="poma travel charger pouch"
                  descriptionOverride="Compact tech pouch designed to organize and protect Poma accessories."
                  hideDescription={true}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER SECTION / Frame 22 */}
      <footer className="bg-[#111111] text-white pt-20 pb-10 border-t border-white/5 relative font-sans">
        <div className="mx-[80px] flex flex-col gap-16 font-sans">
          {/* Top Footer Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <Image
              src="/assets/branding/logo.svg"
              alt="Poma Logo"
              width={145}
              height={40}
              className="h-10 w-auto opacity-80"
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
              <a href="#shop" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">poma brush</a>
              <a href="#shop" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">poma floss</a>
              <a href="#shop" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">poma bru</a>
              <a href="#shop" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">poma accessories</a>
            </div>
            {/* Col 2 */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xl font-bold text-white font-sans mb-2">pomalifestyle</h4>
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
              <h4 className="text-xl font-bold text-white font-sans mb-2">connect</h4>
              <a href="https://facebook.com" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">facebook</a>
              <a href="https://instagram.com" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">instagram</a>
              <a href="https://linkedin.com" className="text-neutral-400 hover:text-white transition-colors text-lg font-normal">linkedIn</a>
            </div>
          </div>

          {/* Large Brand Wordmark Graphic / Group 1 */}
          <div className="relative w-full h-[120px] md:h-[169px] mt-8 flex justify-center items-center pointer-events-none opacity-20">
            <Image
              src="/assets/branding/logo.svg"
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

      {/* Global Cart Drawer sliding overlay */}
      <CartDrawer />

      {/* E2E Test Suite Floating Terminal Console */}
      <DiagnosticConsole />
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <PomaHome />
    </CartProvider>
  );
}
