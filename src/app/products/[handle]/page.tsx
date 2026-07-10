'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, ShoppingBag, Plus, Minus, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

// Custom dynamic titles matching the screenshot layout
const PRODUCT_DISPLAY_TITLES: Record<string, string> = {
  'pomabrush': 'pomabrush - sonic electric toothbrush',
  'pomabru': 'pomabru - portable espresso machine',
  'pomafloss': 'pomafloss - floating water flosser',
  'pomaaccessoris': 'pomabrush heads - advanced cleaning pack',
  'pomaclip': 'pomaclip - magnetic wall mount holder',
  'pomacloth': 'pomacloth - microfiber device cleaning cloth',
};

// Default colors associated with products for display if not defined in Shopify
const PRODUCT_DEFAULT_COLORS: Record<string, string[]> = {
  'pomabrush': ['Charcoal Black', 'Cotton White'],
  'pomabru': ['Charcoal Black', 'Cotton White'],
  'pomafloss': ['Cotton White'],
  'pomaaccessoris': ['Charcoal Black', 'Cotton White'],
  'pomaclip': ['Matte Silver'],
  'pomacloth': ['Charcoal Black'],
};

// Hardcoded premium local galleries to support multiple images per product slider
const PRODUCT_GALLERIES: Record<string, string[]> = {
  'pomabrush': [
    '/assets/figma/hero-featured.png',
    '/assets/figma/lineup-pomabrush.png',
    '/assets/figma/lineup-pomaaccessories.png',
  ],
  'pomabru': [
    '/assets/figma/lineup-pomabru.png',
    '/assets/figma/skipcafe-bg.png',
  ],
  'pomafloss': [
    '/assets/figma/lineup-pomafloss.png',
    '/assets/figma/solutions-bg.png',
  ],
  'pomaaccessoris': [
    '/assets/figma/accessory-1.png',
    '/assets/figma/lineup-pomaaccessories.png',
  ],
  'pomaclip': [
    '/assets/figma/accessory-4.png',
    '/assets/figma/accessory-3.png',
  ],
  'pomacloth': [
    '/assets/figma/lineup-pomaaccessories.png',
    '/assets/figma/accessory-2.png',
  ]
};

// Option round circle color mapping helper
const COLOR_MAP: Record<string, string> = {
  'charcoal black': 'bg-neutral-900 ring-neutral-400',
  'cotton white': 'bg-white border-neutral-200 ring-neutral-400',
  'satin gold': 'bg-[#E6C15C] ring-[#C8A03C]',
  'matte silver': 'bg-[#C0C0C0] ring-[#999999]',
};

// Accordion detailed data
const ACCORDION_DATA: Record<string, Array<{ title: string; content: string }>> = {
  'pomabru': [
    { 
      title: 'Key Features', 
      content: '19 bar high-pressure extraction pump yields professional travel espresso. Lightweight 350g pocket traveler profile. Compatible with Nespresso® pods, Dolce Gusto® pods, and ground coffee.' 
    },
    { 
      title: 'Additional Information', 
      content: 'Includes a water-resistant zipper carry case, an espresso scoop, and a universal USB-C fast charging cable. Recharge time is approximately 2 hours.' 
    },
    { 
      title: 'Poma Policies', 
      content: 'Standard free global delivery on all orders over £50. Includes our 2-year comprehensive manufacturer hardware warranty and a 30-day return policy.' 
    }
  ],
  'pomabrush': [
    { 
      title: 'Key Features', 
      content: 'Advanced sonic motor delivers 15k deep-cleaning vibrations per minute. High-durability medical-grade silicone brush base. Waterproof design rated IPX7.' 
    },
    { 
      title: 'Additional Information', 
      content: 'Package includes toothbrush body, a hybrid carbon-silicone head, a charging travel case, and a USB-C cable.' 
    },
    { 
      title: 'Poma Policies', 
      content: 'Standard free global delivery on all orders over £50. Includes our 2-year comprehensive manufacturer hardware warranty and a 30-day return policy.' 
    }
  ],
  'pomafloss': [
    { 
      title: 'Key Features', 
      content: 'Sleek wall-mount holder with magnetic latching system. Expandable organic dental floss fibers. Refillable spools.' 
    },
    { 
      title: 'Additional Information', 
      content: 'Includes magnetic dispenser, mounting adhesive strips, and one pre-installed spool of charcoal-infused expands floss.' 
    },
    { 
      title: 'Poma Policies', 
      content: 'Standard free global delivery on all orders over £50. Includes our 2-year comprehensive manufacturer hardware warranty and a 30-day return policy.' 
    }
  ]
};

// Box items data structures
interface BoxItem {
  title: string;
  desc: string;
  img: string;
}

const INSIDE_THE_BOX_DATA: Record<string, BoxItem[]> = {
  'pomabru': [
    { title: 'pomabru', desc: 'Designed for those who refuse to compromise on quality, pomabru brings the café experience to wherever you are.', img: '/assets/figma/lineup-pomabru.png' },
    { title: 'Scoop', desc: 'A handy scoop that perfectly measures the ideal amount of ground coffee for one delicious espresso, ensuring consistency and flavour in every cup.', img: '/assets/figma/accessory-1.png' },
    { title: 'water-resistant carry case', desc: 'The protective case keeps your pomabru safe and ready for adventure.', img: '/assets/figma/lineup-pomaaccessories.png' },
    { title: 'usb-c fast charging cable', desc: 'Universal, reliable and quick to recharge your pomabru. You can even use your pomabru as a source to charge a different device.', img: '/assets/figma/accessory-2.png' },
  ],
  'pomabrush': [
    { title: 'pomabrush', desc: 'The flagship electric toothbrush featuring a medical-grade silicone handle and sonic motor.', img: '/assets/figma/lineup-pomabrush.png' },
    { title: 'charging travel case', desc: 'Compact travel case that charges your PomaBrush on the go.', img: '/assets/figma/hero-featured.png' },
    { title: 'replacement head', desc: 'One premium hybrid carbon-silicone replacement head included.', img: '/assets/figma/accessory-1.png' },
    { title: 'usb-c cable', desc: 'Universal fast charging cable compatible with travel case.', img: '/assets/figma/accessory-2.png' },
  ],
  'pomafloss': [
    { title: 'pomafloss', desc: 'The floating flosser dispenser with magnetic wall-mount.', img: '/assets/figma/lineup-pomafloss.png' },
    { title: 'magnetic holder', desc: 'Sleek wall mount with adhesive back for universal installation.', img: '/assets/figma/accessory-4.png' },
    { title: 'expanding floss spool', desc: 'One organic, expandable charcoal-infused dental floss spool.', img: '/assets/figma/lineup-pomaaccessories.png' },
    { title: 'microfiber pouch', desc: 'Travel pouch to protect the flosser when packing.', img: '/assets/figma/accessory-3.png' },
  ],
};

// Compatible products data structures
interface CompatibleItem {
  title: string;
  desc: string;
  img: string;
}

const COMPATIBLE_DATA: Record<string, CompatibleItem[]> = {
  'pomabru': [
    { title: 'Nespresso®-style pods', desc: 'Designed for those who refuse to compromise on quality, pomabru brings the café experience to wherever you are.', img: '/assets/figma/skipcafe-bg.png' },
    { title: 'Dolce Gusto®-style pods', desc: 'Designed for those who refuse to compromise on quality, pomabru brings the café experience to wherever you are.', img: '/assets/figma/solutions-bg.png' },
    { title: 'ground coffee', desc: 'Designed for those who refuse to compromise on quality, pomabru brings the café experience to wherever you are.', img: '/assets/figma/hero-bg.png' },
  ],
  'pomabrush': [
    { title: 'Carbon replacement heads', desc: 'Carbon-infused nylon bristles designed for plaque removal.', img: '/assets/figma/accessory-1.png' },
    { title: 'Hybrid silicone heads', desc: 'Combines carbon nylon bristles with soft outer silicone loops.', img: '/assets/figma/accessory-2.png' },
    { title: 'Pure silicone heads', desc: 'Gentle, full-silicone head perfect for sensitive gums.', img: '/assets/figma/accessory-3.png' },
  ],
  'pomafloss': [
    { title: 'Expanding clean floss refill', desc: 'Organic expanding charcoal dental floss spools.', img: '/assets/figma/lineup-pomaaccessories.png' },
    { title: 'Wall mount adhesive strip', desc: 'Spare 3M adhesive strip for relocating wall mounts.', img: '/assets/figma/accessory-4.png' },
  ],
};

export default function ProductDetailPage() {
  const { handle } = useParams();
  const router = useRouter();
  const { product, loading, error } = useShopifyProduct(handle as string);
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [successAdded, setSuccessAdded] = useState(false);
  const [selectedColorKey, setSelectedColorKey] = useState<string>('');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    'Key Features': true,
  });

  // Helper to extract colors from variants or fallback to default product colors
  const getProductColors = () => {
    if (!product) return [];

    // Filter real variants with specific colors from Shopify if present
    const realColors = product.variants.nodes.filter(v => {
      const titleLower = v.title.toLowerCase();
      return titleLower !== 'default title' && (
        COLOR_MAP[titleLower] !== undefined ||
        titleLower.includes('black') ||
        titleLower.includes('white') ||
        titleLower.includes('gold') ||
        titleLower.includes('silver')
      );
    });

    if (realColors.length > 0) {
      return realColors.map(v => ({
        id: v.id,
        title: v.title,
        colorKey: v.title.toLowerCase(),
        isMock: false,
      }));
    }

    // Default color options fallback mapping
    const defaultColors = PRODUCT_DEFAULT_COLORS[product.handle] || ['Charcoal Black'];
    return defaultColors.map(colorName => {
      const variantId = product.variants.nodes[0]?.id || '';
      return {
        id: variantId,
        title: colorName,
        colorKey: colorName.toLowerCase(),
        isMock: true,
      };
    });
  };

  const colors = getProductColors();

  // Force page scroll to top on mount / handle changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [handle]);

  // Set default selected color option when product loads
  useEffect(() => {
    if (product) {
      const cols = getProductColors();
      if (cols.length > 0) {
        setSelectedColorKey(cols[0].colorKey);
      }
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-950 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-neutral-500 font-sans animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-500 mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-sans">Failed to load product</h2>
        <p className="text-neutral-500 mt-2 max-w-md font-sans">The product handle you are trying to reach does not exist or your Shopify configurations are misaligned.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer animate-pulse"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Resolve product images
  const localGallery = PRODUCT_GALLERIES[product.handle];
  const storefrontImages = product.images?.nodes?.map(img => img.url) || [];
  const productImages = localGallery && localGallery.length > 0 ? localGallery : (storefrontImages.length > 0 ? storefrontImages : ['/assets/products/placeholder.png']);
  const activeImageUrl = productImages[activeImageIndex] || productImages[0];

  // Resolve active variant and base price
  const activeColorOpt = colors.find(c => c.colorKey === selectedColorKey) || colors[0];
  let activeVariant = product.variants.nodes.find(v => v.id === activeColorOpt?.id) || product.variants.nodes[0];
  if (activeColorOpt && !activeColorOpt.isMock) {
    const realVariant = product.variants.nodes.find(v => v.id === activeColorOpt.id);
    if (realVariant) activeVariant = realVariant;
  }
  const basePrice = parseFloat(activeVariant?.price || product.priceRange.minVariantPrice.amount);

  // Handle Add to Cart
  const handleAddToBag = () => {
    if (!activeVariant) return;

    // Construct title showing properly capitalized selected color
    const displayColor = activeColorOpt 
      ? activeColorOpt.title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : activeVariant.title;

    addToCart({
      variantId: activeVariant.id,
      productId: product.id,
      title: `${product.title} (${displayColor})`,
      price: basePrice.toString(),
      imageUrl: activeImageUrl,
      handle: product.handle,
    }, quantity);

    setSuccessAdded(true);
    setTimeout(() => setSuccessAdded(false), 2000);
  };

  const toggleAccordion = (title: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const accordions = ACCORDION_DATA[product.handle] || [
    { title: 'Key Features', content: 'Premium engineering. High durability, lightweight materials built for modern, intentional living.' },
    { title: 'Additional Information', content: 'Package includes product device, standard charging interface, and user instructions guide.' },
    { title: 'Poma Policies', content: 'Enjoy free standard global delivery on orders over £50. Includes our 2-year manufacturer warranty.' }
  ];

  const insideTheBoxItems = INSIDE_THE_BOX_DATA[product.handle] || [];
  const compatibleItems = COMPATIBLE_DATA[product.handle] || [];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pt-12 pb-20">
      <div className="mx-[80px]">
        {/* Core Product Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT SIDE: Media Gallery Column with Vertical Thumbnails (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex gap-4 items-start w-full">
              {/* Main Large Image Box (Flex-Grow) */}
              <div className="flex-grow relative aspect-square rounded-3xl bg-[#FAFAFA] border border-neutral-100/50 flex items-center justify-center overflow-hidden">
                <Image
                  src={activeImageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>

              {/* Vertical Thumbnail Navigation Column (Right of Main Image) */}
              {productImages.length > 1 && (
                <div className="flex flex-col gap-3 flex-shrink-0 w-20">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl bg-neutral-50 border overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-300 ${
                        activeImageIndex === idx 
                          ? 'border-neutral-950 ring-2 ring-neutral-950/10 scale-[1.03] shadow-md' 
                          : 'border-neutral-200 hover:border-neutral-400 hover:scale-[1.01]'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} view ${idx}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Product Description & Purchase Actions (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full py-2">
            <div>
              {/* Title */}
              <h1 className="text-3xl md:text-[42px] font-black text-neutral-950 leading-tight mb-4 lowercase tracking-tight">
                {PRODUCT_DISPLAY_TITLES[product.handle] || product.title}
              </h1>

              {/* Description body */}
              <p className="text-sm md:text-base text-neutral-500 leading-relaxed font-sans font-light mb-6">
                {product.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-neutral-950">
                  £{basePrice.toFixed(2)}
                </span>
              </div>

              {/* Color Swatch Options (Renders swatches by default, handles single colors beautifully) */}
              {colors.length > 0 && (
                <div className="mb-8 border-b border-neutral-100 pb-6">
                  <h3 className="text-xs font-bold uppercase text-neutral-400 tracking-widest mb-3 font-sans">
                    Select Color
                  </h3>
                  
                  <div className="flex flex-wrap gap-3">
                    {colors.map((colorOption) => {
                      const isSelected = selectedColorKey === colorOption.colorKey;
                      const bgClass = COLOR_MAP[colorOption.colorKey] || 'bg-neutral-400';

                      return (
                        <button
                          key={colorOption.title}
                          onClick={() => setSelectedColorKey(colorOption.colorKey)}
                          className={`w-10 h-10 rounded-full border transition-all relative flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110'
                              : 'hover:scale-105 border-neutral-300'
                          } ${bgClass}`}
                          title={colorOption.title}
                          aria-label={colorOption.title}
                        >
                          {isSelected && (
                            <Check className={`h-4 w-4 ${colorOption.colorKey === 'cotton white' ? 'text-neutral-900' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer (Unified counter and full-width button) */}
            <div className="border-t border-neutral-100 pt-6">
              
              {/* Buy row */}
              <div className="flex gap-4 items-center mb-8">
                {/* Quantity Adjustment Box */}
                <div className="flex items-center rounded-full border-2 border-neutral-900 h-14 px-2">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-full flex items-center justify-center text-neutral-600 disabled:opacity-30 transition-all cursor-pointer hover:bg-neutral-100"
                  >
                    <Minus className="h-3.5 w-3.5 text-neutral-950 stroke-[3]" />
                  </button>
                  <span className="w-10 text-center text-base font-extrabold text-neutral-900 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="h-10 w-10 rounded-full flex items-center justify-center text-neutral-600 transition-all cursor-pointer hover:bg-neutral-100"
                  >
                    <Plus className="h-3.5 w-3.5 text-neutral-950 stroke-[3]" />
                  </button>
                </div>

                {/* Full-width Add to Bag Button */}
                <button
                  onClick={handleAddToBag}
                  disabled={!activeVariant?.availableForSale}
                  className="flex-grow h-14 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all duration-300 font-sans text-sm font-extrabold uppercase flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] shadow-md tracking-wider"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {successAdded ? 'Added to bag!' : 'Add to bag'}
                </button>
              </div>

              {/* Collapsible Accordion details */}
              <div className="border-t border-neutral-200">
                {accordions.map((item, idx) => (
                  <div key={idx} className="border-b border-neutral-200 py-3">
                    <button
                      onClick={() => toggleAccordion(item.title)}
                      className="w-full flex items-center justify-between text-left cursor-pointer py-1"
                    >
                      <span className="text-base font-bold text-neutral-900 font-sans">{item.title}</span>
                      {openAccordions[item.title] ? (
                        <ChevronUp className="h-5 w-5 text-neutral-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-neutral-500" />
                      )}
                    </button>
                    <AnimatePresence>
                      {openAccordions[item.title] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-neutral-500 pt-2 pb-1 font-sans leading-relaxed font-light">
                            {item.content}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

        {/* Dynamic bottom details grid section */}
        {insideTheBoxItems.length > 0 && (
          <section className="mt-20 pt-16 border-t border-neutral-100">
            <h2 className="text-3xl font-black text-neutral-950 mb-10 lowercase tracking-tight">
              what&apos;s inside the box
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {insideTheBoxItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <div className="relative aspect-[4/3] w-full rounded-2xl bg-neutral-50 border border-neutral-100 overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 lowercase">{item.title}</h3>
                  <p className="text-sm text-neutral-500 font-sans leading-relaxed font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {compatibleItems.length > 0 && (
          <section className="mt-20 pt-16 border-t border-neutral-100">
            <h2 className="text-3xl font-black text-neutral-950 mb-10 lowercase tracking-tight">
              compatible with
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {compatibleItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <div className="relative aspect-[4/3] w-full rounded-2xl bg-neutral-50 border border-neutral-100 overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 lowercase">{item.title}</h3>
                  <p className="text-sm text-neutral-500 font-sans leading-relaxed font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
