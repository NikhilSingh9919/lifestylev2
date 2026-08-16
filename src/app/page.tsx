'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useMedusaProduct } from '@/hooks/useMedusaProduct';
import { formatImageUrl } from '@/lib/medusa';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { env } from '@/config/env';

const COLOR_HEX_MAP: Record<string, string> = {
  // Greens
  'forest green': '#2D5A27',
  'forestgreen': '#2D5A27',
  'forest': '#2D5A27',
  'emerald green': '#046A38',
  'emerald': '#046A38',
  'sage green': '#8A9A86',
  'sage': '#8A9A86',
  'olive green': '#556B2F',
  'olive': '#556B2F',
  'mint green': '#98FF98',
  'mint': '#98FF98',
  'green': '#4B6B50',

  // Blacks & Greys
  'charcoal black': '#1A1A1A',
  'charcoal': '#2B2B2B',
  'midnight black': '#0D0D0D',
  'matte black': '#1C1C1C',
  'black': '#0A0A0A',
  'space grey': '#535459',
  'space gray': '#535459',
  'slate grey': '#708090',
  'slate gray': '#708090',
  'slate': '#708090',
  'matte silver': '#C0C0C0',
  'silver': '#C0C0C0',
  'carbon': '#2E2E2E',
  'grey': '#808080',
  'gray': '#808080',

  // Whites & Creams
  'cotton white': '#FFFFFF',
  'alpine white': '#F8F9FA',
  'white': '#FFFFFF',
  'off white': '#F5F5F0',
  'cream': '#FFFDD0',
  'sand': '#C2B280',
  'beige': '#F5F5DC',

  // Blues
  'navy blue': '#000080',
  'navy': '#000080',
  'ocean blue': '#1D4E89',
  'sky blue': '#87CEEB',
  'midnight blue': '#191970',
  'blue': '#2E4A62',
  'cobalt': '#0047AB',
  'teal': '#008080',

  // Golds, Reds, Pinks, Purples, Oranges
  'satin gold': '#E6C15C',
  'rose gold': '#B76E79',
  'gold': '#E6C15C',
  'bronze': '#CD7F32',
  'copper': '#B87333',
  'coral': '#FF7F50',
  'pink': '#FFC0CB',
  'rose': '#FF007F',
  'red': '#C8102E',
  'burgundy': '#800020',
  'purple': '#800080',
  'lavender': '#E6E6FA',
  'yellow': '#FFD700',
  'orange': '#FFA500',
};

const COLOR_MAP: Record<string, string> = {
  'charcoal black': 'bg-neutral-900 ring-neutral-400',
  'cotton white': 'bg-white border-neutral-200 ring-neutral-400',
  'satin gold': 'bg-[#E6C15C] ring-[#C8A03C]',
  'matte silver': 'bg-[#C0C0C0] ring-[#999999]',
  'black': 'bg-neutral-950 ring-neutral-500',
  'white': 'bg-white border-neutral-200 ring-neutral-400',
  'gold': 'bg-[#E6C15C] ring-[#C8A03C]',
  'silver': 'bg-[#C0C0C0] ring-[#999999]',
  'charcoal': 'bg-neutral-800 ring-neutral-400',
  'green': 'bg-[#4B6B50] ring-[#374F3B]',
  'blue': 'bg-[#2E4A62] ring-[#203344]',
  'forest green': 'bg-[#2D5A27] ring-[#1E3E1A]',
  'forestgreen': 'bg-[#2D5A27] ring-[#1E3E1A]',
};

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
  const router = useRouter();
  const { product, loading, error } = useMedusaProduct(handle);
  const { addToCart } = useCart();

  const parseColorValue = (rawValue: string) => {
    let name = rawValue.trim();
    let hex: string | undefined;

    // Pattern 1: Name (#Hex) or Name (Hex) e.g. "Forest Green (#2D5A27)"
    const parenMatch = name.match(/^([^(]+)\((#?[0-9a-fA-F]{6}|#?[0-9a-fA-F]{3})\)/);
    if (parenMatch) {
      name = parenMatch[1].trim();
      hex = parenMatch[2].trim();
    } else {
      // Pattern 2: Name | Hex or Name - Hex e.g. "Forest Green | #2D5A27"
      const separatorMatch = name.match(/^([^|-]+)[|-](#?[0-9a-fA-F]{6}|#?[0-9a-fA-F]{3})$/);
      if (separatorMatch) {
        name = separatorMatch[1].trim();
        hex = separatorMatch[2].trim();
      }
    }

    if (hex && !hex.startsWith('#') && /^[0-9a-fA-F]{3,6}$/.test(hex)) {
      hex = `#${hex}`;
    }

    const keyLower = name.toLowerCase();

    if (!hex) {
      if (COLOR_HEX_MAP[keyLower]) {
        hex = COLOR_HEX_MAP[keyLower];
      } else {
        for (const [k, v] of Object.entries(COLOR_HEX_MAP)) {
          if (keyLower.includes(k)) {
            hex = v;
            break;
          }
        }
      }
    }

    return {
      title: name,
      colorKey: keyLower,
      hexCode: hex || '#4B6B50',
    };
  };

  // Dynamically extract colors from product variants
  const getProductColors = () => {
    if (!product) return [];

    const realColors = product.variants.nodes.filter(v => {
      const hasColorOption = v.selectedOptions?.some(opt => 
        opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour'
      );
      if (hasColorOption) return true;

      const titleLower = v.title.toLowerCase();
      return titleLower !== 'default title';
    });

    if (realColors.length > 0) {
      return realColors.map(v => {
        const colorOption = v.selectedOptions?.find(opt => 
          opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour'
        );
        const colorName = colorOption ? colorOption.value : v.title;
        const parsed = parseColorValue(colorName);
        return {
          id: v.id,
          title: parsed.title,
          colorKey: parsed.colorKey,
          hexCode: parsed.hexCode,
        };
      });
    }

    return [];
  };

  const colors = getProductColors();
  const [selectedColorKey, setSelectedColorKey] = useState<string>('');

  // Set default selected color when product loads
  useEffect(() => {
    if (colors.length > 0) {
      setSelectedColorKey(colors[0].colorKey);
    }
  }, [product?.id, colors.length]);

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

  const activeColorOpt = colors.find(c => c.colorKey === selectedColorKey) || colors[0];
  const primaryVariant = product.variants.nodes.find(v => v.id === activeColorOpt?.id) || product.variants.nodes[0];

  const price = priceOverride || primaryVariant?.price || product.priceRange.minVariantPrice.amount;
  
  // Resolve product images
  const productImages = product.images.nodes.map(img => formatImageUrl(img.url));
  const variantImg = primaryVariant?.image?.url ? formatImageUrl(primaryVariant.image.url) : null;
  const imageUrl = variantImg || productImages[0] || imageOverride || '/assets/products/placeholder.png';

  const title = product.title || titleOverride || '';
  const description = product.description || descriptionOverride || '';

  const handleAdd = () => {
    addToCart({
      variantId: primaryVariant.id,
      productId: product.id,
      title: `${title} (${primaryVariant.title})`,
      price,
      imageUrl,
      handle: product.handle,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onClick={() => router.push(`/products/${handle}`)}
      className="flex flex-col justify-between rounded-[8px] bg-neutral-50 p-4 md:p-6 border border-neutral-200/60 transition-all duration-300 h-full group cursor-pointer"
    >
      <div>
        {/* White Image Container (1:1 aspect-square, covers card, rounded-8px) */}
        <div className="relative aspect-square w-full rounded-[8px] bg-white flex items-center justify-center overflow-hidden mb-4 border border-neutral-100/50">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-[8px]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        {/* Color Selectors (24px circles) */}
        {colors.length > 0 && (
          <div className="flex gap-2 mb-4">
            {colors.map((colorOption) => {
              const isSelected = selectedColorKey === colorOption.colorKey;
              const bgClass = COLOR_MAP[colorOption.colorKey];
              const style = colorOption.hexCode 
                ? { backgroundColor: colorOption.hexCode } 
                : (bgClass ? {} : { backgroundColor: colorOption.colorKey });
              const displayBgClass = colorOption.hexCode 
                ? 'border-neutral-200 shadow-sm' 
                : (bgClass || 'border-neutral-300');

              return (
                <button
                  key={colorOption.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColorKey(colorOption.colorKey);
                  }}
                  className={`w-6 h-6 rounded-full border transition-all relative flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  } ${displayBgClass}`}
                  style={style}
                  title={colorOption.title}
                  aria-label={colorOption.title}
                />
              );
            })}
          </div>
        )}

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

      <div className="flex items-center justify-between pt-4 h-16 w-full gap-[12px] mt-auto">
        <span className="text-[24px] font-bold text-neutral-900 flex-shrink-0">
          £{parseFloat(price).toFixed(2)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAdd();
          }}
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

interface LineupItemProps {
  prefix: string;
  suffix: string;
  handle: string;
  fallbackImg: string;
  scrollTarget?: string;
}

function LineupItem({ prefix, suffix, handle, fallbackImg, scrollTarget }: LineupItemProps) {
  const { product, loading } = useMedusaProduct(handle);
  
  const storefrontImages = product?.images?.nodes?.map(img => img.url) || [];
  const imageUrl = storefrontImages[0] || fallbackImg;

  const content = (
    <div className="flex flex-col gap-5 cursor-pointer group">
      <div className="relative aspect-[3/4] w-full flex items-center justify-center overflow-hidden rounded-[12px] bg-neutral-50">
        {loading ? (
          <div className="w-full h-full bg-neutral-100 animate-pulse rounded-[12px]" />
        ) : (
          <Image
            src={imageUrl}
            alt={prefix + suffix}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-[12px]"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        )}
      </div>
      <h3 className="text-[32px] font-normal text-[#111111] leading-none group-hover:text-neutral-600 transition-colors lowercase">
        <span className="font-semibold">{prefix}</span>{suffix}
      </h3>
    </div>
  );

  if (scrollTarget) {
    return (
      <a href={scrollTarget} className="block">
        {content}
      </a>
    );
  }

  return (
    <Link href={`/products/${handle}`} className="block">
      {content}
    </Link>
  );
}

function PomaHome() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { product: heroProduct } = useMedusaProduct('pomabrush');
  const { product: bruProduct } = useMedusaProduct('pomabru');
  const { product: flossProduct } = useMedusaProduct('pomafloss');

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const bgVideoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.defaultMuted = true;
      bgVideoRef.current.muted = true;
      bgVideoRef.current.play().catch(() => {});
    }

    const handleFirstInteraction = () => {
      if (bgVideoRef.current) {
        bgVideoRef.current.play().catch(() => {});
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    async function fetchAllProducts() {
      const mockData = [
        { id: '1', title: 'Pomabrush', handle: 'pomabrush', productType: 'Oral Care' },
        { id: '2', title: 'Pomafloss', handle: 'pomafloss', productType: 'Oral Care' },
        { id: '3', title: 'Pomabru', handle: 'pomabru', productType: 'Lifestyle' },
        { id: '4', title: 'Pomabrush Heads – Advanced', handle: 'pomabrush-heads-advanced', productType: 'Accessories' },
        { id: '5', title: 'Pomabrush Heads – Nylon-Silicone', handle: 'pomabrush-heads-nylon-silicone', productType: 'Accessories' },
        { id: '6', title: 'Pomabrush Heads – Pure Silicone', handle: 'pomabrush-heads-pure-silicone', productType: 'Accessories' },
        { id: '7', title: 'Pomaclip', handle: 'pomaclip', productType: 'Accessories' },
        { id: '8', title: 'Pomacloth', handle: 'pomacloth', productType: 'Accessories' }
      ];

      try {
        setLoadingProducts(true);
        const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
        const res = await fetch(`${backendUrl}/store/products`, {
          headers: {
            'x-publishable-api-key': env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
          },
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.products && json.products.length > 0) {
            // Filter out legacy Medusa starter products (shirts, pants, shorts, etc.)
            const pomaProducts = json.products
              .filter((p: any) => p.handle && (p.handle.startsWith('poma') || p.handle === 'pomaaccessoris'))
              .map((p: any) => ({
                id: p.id,
                title: p.title,
                handle: p.handle,
                productType: p.type?.value || (p.handle.includes('head') || p.handle.includes('clip') || p.handle.includes('cloth') || p.handle === 'pomaaccessoris' ? 'Accessories' : 'Oral Care'),
              }));

            if (pomaProducts.length > 0) {
              setAllProducts(pomaProducts);
            } else {
              setAllProducts(mockData);
            }
          } else {
            setAllProducts(mockData);
          }
        } else {
          setAllProducts(mockData);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic products, using fallback mock products:', err);
        setAllProducts(mockData);
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchAllProducts();
  }, []);

  const isAccessory = (handle: string, productType?: string) => {
    const h = handle.toLowerCase();
    const t = (productType || '').toLowerCase();
    return t === 'accessories' || h.includes('head') || h.includes('clip') || h.includes('cloth') || h === 'pomaaccessoris';
  };

  const mainProducts = allProducts.filter(p => !isAccessory(p.handle, p.productType));
  const accessoryProducts = allProducts.filter(p => isAccessory(p.handle, p.productType));

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
      const { scrollLeft } = ref.current;
      const card = ref.current.firstElementChild as HTMLElement;
      const cardWidth = card ? card.offsetWidth : 280;
      const gap = window.innerWidth < 768 ? 24 : 32;
      const scrollAmount = cardWidth + gap;
      
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
      imageUrl: heroProduct.images?.nodes?.[0]?.url || '/assets/figma/hero-featured.png',
      handle: heroProduct.handle,
    });
  };

  const handleAddBru = () => {
    if (!bruProduct) return;
    const variant = bruProduct.variants.nodes[0];
    addToCart({
      variantId: variant.id,
      productId: bruProduct.id,
      title: bruProduct.title,
      price: variant.price,
      imageUrl: bruProduct.images?.nodes?.[0]?.url || '/assets/figma/lineup-pomabru.png',
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
      imageUrl: flossProduct.images?.nodes?.[0]?.url || '/assets/figma/lineup-pomafloss.png',
      handle: flossProduct.handle,
    });
  };

  const heroCarouselProducts = [
    {
      handle: 'pomabrush',
      title: heroProduct?.title || 'pomabrush model 2.0',
      price: heroProduct?.variants.nodes[0]?.price || '135.00',
      bannerImage: '/poma reduced.webp',
      thumbnailImage: heroProduct?.images?.nodes?.[0]?.url || '/assets/figma/hero-featured.png',
      handleAdd: handleAddHero
    },
    {
      handle: 'pomafloss',
      title: flossProduct?.title || 'pomafloss active dispenser',
      price: flossProduct?.variants.nodes[0]?.price || '39.00',
      bannerImage: '/Banner - pomafloss - Black & White Hero Banner.webp',
      thumbnailImage: flossProduct?.images?.nodes?.[0]?.url || '/assets/figma/lineup-pomafloss.png',
      handleAdd: handleAddFloss
    },
    {
      handle: 'pomabru',
      title: bruProduct?.title || 'pomabru espresso traveler',
      price: bruProduct?.variants.nodes[0]?.price || '99.00',
      bannerImage: '/Pomabru - Hero Banner.webp',
      thumbnailImage: bruProduct?.images?.nodes?.[0]?.url || '/assets/figma/lineup-pomabru.png',
      handleAdd: handleAddBru
    }
  ];

  const activeHeroProduct = heroCarouselProducts[heroActiveIndex];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      <main>
        {/* HERO SECTION / Frame 2 */}
        <section className="relative h-[calc(100vh-80px)] min-h-[640px] bg-[#111111] text-white flex flex-col justify-between overflow-hidden">
          {/* Dynamic Hero Banner Background Image & Video Overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHeroProduct.bannerImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={activeHeroProduct.bannerImage}
                  alt={activeHeroProduct.title}
                  fill
                  className="object-cover object-center"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            {/* Ambient Dark Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent md:bg-gradient-to-t md:from-black/80 md:via-black/30 md:to-black/50 z-[1]" />
          </div>

          <div className="relative z-10 w-full px-5 md:px-[80px] h-full py-[60px] flex flex-col justify-between flex-grow">
            {/* Top row spacing spacer */}
            <div className="flex-grow" />

            {/* Bottom Row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mt-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-2xl flex flex-col text-white"
              >
                <h1 className="text-[32px] md:text-[48px] font-extrabold leading-[1.2] tracking-tight font-sans flex flex-col">
                  <span>Shop the</span>
                  <span>pomalifestyle range</span>
                </h1>
                <p className="text-[18px] sm:text-[24px] font-normal opacity-80 mt-2 sm:mt-[20px] font-sans">
                  Authorized distributor for Poma lifestyle
                </p>
              </motion.div>

              {/* Featured Product Overlay Wrapper containing Card and Dots */}
              <div className="flex flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                {/* Featured Product Overlay Card / Frame 41 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  onMouseEnter={() => setIsHeroHovered(true)}
                  onMouseLeave={() => setIsHeroHovered(false)}
                  onClick={() => router.push(`/products/${activeHeroProduct.handle}`)}
                  className="flex-grow sm:flex-initial w-full sm:w-[411px] max-w-[calc(100vw-64px)] sm:max-w-none rounded-3xl bg-[#111111]/45 backdrop-blur-lg border border-white/10 p-3.5 sm:p-6 group/hero-card hover:ring-[1px] hover:ring-white/60 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-3 sm:gap-6 w-full">
                    {/* Container 1: Thumbnail (matches thumbnail set in Medusa) */}
                    <div className="relative w-[72px] h-[72px] sm:w-[103px] sm:h-[103px] rounded-2xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image
                        src={activeHeroProduct.thumbnailImage}
                        alt={activeHeroProduct.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Container 2: Text Container (Title + Price) */}
                    <div className="flex flex-col justify-center flex-grow min-w-0 pr-1">
                      <h4 className="text-[14px] sm:text-lg font-semibold text-white lowercase leading-tight break-words font-sans">
                        {activeHeroProduct.title}
                      </h4>
                      <span className="text-base sm:text-2xl font-bold text-white mt-1 sm:mt-2">
                        £{parseFloat(activeHeroProduct.price).toFixed(2)}
                      </span>
                    </div>

                    {/* Container 3: Separate Add Button Container (Middle of widget, 60x60 on mobile) */}
                    <div className="flex items-center justify-center flex-shrink-0 self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          activeHeroProduct.handleAdd();
                        }}
                        className="w-[60px] h-[60px] sm:h-14 sm:w-14 sm:group-hover/hero-card:w-[110px] transition-all duration-300 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 border border-white/10 cursor-pointer flex items-center justify-center sm:justify-start gap-2 px-0 sm:px-4 overflow-hidden font-sans"
                      >
                        <ShoppingBag className="h-6 w-6 flex-shrink-0" />
                        <span className="hidden sm:inline-block w-0 opacity-0 group-hover/hero-card:w-auto group-hover/hero-card:opacity-100 transition-all duration-300 text-sm font-semibold whitespace-nowrap overflow-hidden">
                          Add
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Dots on the right of widget for both mobile and desktop */}
                <div className="flex flex-col gap-3 justify-center py-0 flex-shrink-0">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroActiveIndex(idx)}
                      className={`w-[8px] h-[8px] rounded-full transition-all duration-300 cursor-pointer ${heroActiveIndex === idx ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
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
        <section id="shop" className="bg-white py-12 md:py-20">
          <div className="px-5 md:px-[80px]">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[32px] md:text-[48px] font-bold text-[#111111] mb-8 md:mb-12"
            >
              Explore the line-up
            </motion.h2>

            {/* Product categories grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { prefix: 'poma', suffix: 'brush', handle: 'pomabrush', img: '/poma reduced.webp' },
                { prefix: 'poma', suffix: 'floss', handle: 'pomafloss', img: '/Banner - pomafloss - Black & White Hero Banner.webp' },
                { prefix: 'poma', suffix: 'bru', handle: 'pomabru', img: '/Pomabru - Hero Banner.webp' },
                { prefix: 'poma', suffix: 'accessoris', handle: 'pomaaccessoris', img: '/assets/figma/lineup-pomaaccessories.png', scrollTarget: '#accessories' },
              ].map((item, idx) => (
                <LineupItem
                  key={idx}
                  prefix={item.prefix}
                  suffix={item.suffix}
                  handle={item.handle}
                  fallbackImg={item.img}
                  scrollTarget={item.scrollTarget}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTIONS BANNER / Frame 17 */}
        <section className="bg-white py-6 md:py-12">
          <div className="mx-5 md:mx-[80px] rounded-[24px] bg-black text-white min-h-[540px] md:h-[560px] overflow-hidden relative px-6 md:px-[60px] py-8 md:py-[40px] flex flex-col justify-end md:justify-center">
            {/* Background image & Overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/pomabru/poma-brush.webp"
                alt="Solutions Background"
                fill
                className="object-cover object-[75%_20%] md:object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            </div>

            {/* Content Left (Vertically centered "middle", left aligned) */}
            <div className="relative z-10 flex flex-col justify-end md:justify-center text-left max-w-[485px] w-full">
              <h2 className="text-[32px] md:text-[60px] font-extrabold leading-[1.2] text-white mb-[8px] md:mb-[20px]">
                Solutions for<br />Modern Living
              </h2>
              <p className="text-base md:text-[20px] text-white/80 font-normal leading-[1.5] mb-6">
                We create products for people who value rituals. But with more intention, where it already exists.
              </p>
              <a
                href="#shop"
                className="inline-flex items-center justify-center py-4 rounded-full bg-white text-[#111111] text-lg font-bold hover:bg-neutral-200 transition-all w-[200px] shadow-lg cursor-pointer font-sans"
              >
                Shop now
              </a>
            </div>
          </div>
        </section>

        {/* BEST SELLERS / Frame 18 */}
        <section className="bg-white py-12 md:py-20">
          <div className="px-5 md:px-[80px]">
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 mb-8 md:mb-12">
              <h2 className="text-[32px] md:text-[48px] font-bold text-[#111111] leading-tight">
                You shouldn’t miss on these
              </h2>
              <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                <button
                  onClick={() => scroll(bestSellersRef, 'left')}
                  className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </button>
                <button
                  onClick={() => scroll(bestSellersRef, 'right')}
                  className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>
            </div>

            {/* Product Cards Row (Scrollable Carousel, dynamic width) */}
            <div
              ref={bestSellersRef}
              className="flex overflow-x-auto no-scrollbar scroll-smooth gap-6 md:gap-8 w-full pb-4"
            >
              {loadingProducts ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="w-[280px] min-w-[280px] lg:w-[calc((100%-96px)/4)] lg:min-w-[calc((100%-96px)/4)] flex-shrink-0 bg-neutral-50 border border-neutral-100 animate-pulse h-[530px] rounded-2xl animate-pulse" />
                ))
              ) : (
                mainProducts.map((p) => (
                  <div key={p.handle} className="w-[280px] min-w-[280px] lg:w-[calc((100%-96px)/4)] lg:min-w-[calc((100%-96px)/4)] flex-shrink-0">
                    <ProductCard handle={p.handle} />
                  </div>
                ))
              )}
            </div>

            {/* Slider Arrows below cards (mobile only) */}
            <div className="flex md:hidden justify-center gap-4 mt-8">
              <button
                onClick={() => scroll(bestSellersRef, 'left')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll(bestSellersRef, 'right')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* FEATURED PROMO / Frame 21 */}
        <section className="bg-white py-6 md:py-12">
          <div className="mx-5 md:mx-[80px] rounded-[24px] bg-black text-white min-h-[540px] md:h-[560px] overflow-hidden relative px-6 md:px-[60px] py-8 md:py-[40px] flex flex-col justify-end md:justify-center">
            {/* Promo Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/pomabru/poma-bru.webp"
                alt="Skip the Cafe Background"
                fill
                className="object-cover object-[80%_20%] md:object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            </div>

            {/* Content Left (Vertically centered "middle", left aligned) */}
            <div className="relative z-10 flex flex-col justify-end md:justify-center text-left max-w-[485px] w-full">
              <h2 className="text-[32px] md:text-[60px] font-extrabold leading-[1.2] text-white mb-[8px] md:mb-[20px]">
                Skip the Café
              </h2>
              <p className="text-base md:text-[20px] text-white/80 font-normal leading-[1.5] mb-6">
                From early flights to quiet mountain mornings, it reimagines the ritual of espresso for modern travel-combining convenience, precision, and the pleasure of a perfect cup.
              </p>
              <button
                onClick={() => router.push('/products/pomabru')}
                className="inline-flex items-center justify-center py-4 rounded-full bg-white text-[#111111] text-lg font-bold hover:bg-neutral-200 transition-colors w-[200px] cursor-pointer shadow-lg font-sans"
              >
                Get Pomabru
              </button>
            </div>
          </div>
        </section>

        {/* ACCESSORIES / Frame 23 */}
        <section id="accessories" className="bg-white py-12 md:py-20 scroll-mt-20">
          <div className="px-5 md:px-[80px]">
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 mb-8 md:mb-12">
              <h2 className="text-[32px] md:text-[48px] font-bold text-[#111111] leading-tight">
                Don’t forget your accessories
              </h2>
              <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                <button
                  onClick={() => scroll(accessoriesRef, 'left')}
                  className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </button>
                <button
                  onClick={() => scroll(accessoriesRef, 'right')}
                  className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>
            </div>

            {/* Product Cards Row (Scrollable Carousel, restored fixed width) */}
            <div
              ref={accessoriesRef}
              className="flex overflow-x-auto no-scrollbar scroll-smooth gap-6 md:gap-8 w-full pb-4"
            >
              {loadingProducts ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="w-[280px] min-w-[280px] lg:w-[calc((100%-96px)/4)] lg:min-w-[calc((100%-96px)/4)] flex-shrink-0 bg-neutral-50 border border-neutral-100 animate-pulse h-[400px] rounded-2xl animate-pulse" />
                ))
              ) : (
                accessoryProducts.map((p) => {
                  let titleOverride: string | undefined;
                  let imageOverride: string | undefined;
                  
                  if (p.handle === 'pomaaccessoris') {
                    titleOverride = "pomabrush advanced brush heads - pack of 4";
                    imageOverride = "/assets/figma/accessory-1.png";
                  }
                  
                  return (
                    <div key={p.handle} className="w-[280px] min-w-[280px] lg:w-[calc((100%-96px)/4)] lg:min-w-[calc((100%-96px)/4)] flex-shrink-0">
                      <ProductCard
                        handle={p.handle}
                        titleOverride={titleOverride}
                        imageOverride={imageOverride}
                        hideDescription={false}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Slider Arrows below cards (mobile only) */}
            <div className="flex md:hidden justify-center gap-4 mt-8">
              <button
                onClick={() => scroll(accessoriesRef, 'left')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll(accessoriesRef, 'right')}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-transparent text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  return <PomaHome />;
}
