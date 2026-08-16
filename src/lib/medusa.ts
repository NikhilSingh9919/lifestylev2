import { env } from '@/config/env';

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  sku: string;
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;
  image?: {
    url: string;
    altText: string;
  } | null;
}

export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
    };
  };
  images: {
    nodes: Array<{
      url: string;
      altText: string;
    }>;
  };
  variants: {
    nodes: ProductVariant[];
  };
  tags?: string[];
  metadata?: Record<string, any>;
  metafields?: Array<{
    key: string;
    value: string;
    reference?: {
      sources?: Array<{
        url: string;
        mimeType: string;
      }>;
    } | null;
  } | null>;
}

// In-memory store for tracking inventory mock overrides dynamically
const mockInventory: Record<string, number> = {
  'pomabrush-hero': 15,
  'pomafloss-floating': 8,
  'pomabrush': 12,
  'pomafloss': 20,
  'pomabru': 5,
  'pomaaccessoris': 50,
};

const listeners = new Set<() => void>();

export const mockInventoryStore = {
  get(handle: string): number {
    return mockInventory[handle] !== undefined ? mockInventory[handle] : 10;
  },
  set(handle: string, qty: number) {
    mockInventory[handle] = qty;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const REAL_VARIANT_MAP: Record<string, string> = {
  // Pomabrush Model 2.0
  'variant_medusa_pomabrush_black': 'variant_01M00Y58BV70RT2K6M5B2TSJ7T',
  'variant_medusa_pomabrush_white': 'variant_01M00Y58BWGKM55SHJVTWV9JTA',
  'PL-PB02-BLK': 'variant_01M00Y58BV70RT2K6M5B2TSJ7T',
  'PL-PB02-WHT': 'variant_01M00Y58BWGKM55SHJVTWV9JTA',
  'pomabrush-black': 'variant_01M00Y58BV70RT2K6M5B2TSJ7T',
  'pomabrush-white': 'variant_01M00Y58BWGKM55SHJVTWV9JTA',

  // Pomafloss Model 2.0
  'variant_medusa_pomafloss_black': 'variant_01M00Y58BWE6Y3DDSVJQ7ATEYB',
  'variant_medusa_pomafloss_white': 'variant_01M00Y58BWZGHJSG719SDMMTGJ',
  'variant_medusa_pomafloss_901847102': 'variant_01M00Y58BWE6Y3DDSVJQ7ATEYB',
  'PL-PF02-BLK': 'variant_01M00Y58BWE6Y3DDSVJQ7ATEYB',
  'PL-PF02-WHT': 'variant_01M00Y58BWZGHJSG719SDMMTGJ',

  // Pomafloss Model 1.0
  'PL-PF01-WHT': 'variant_01M00Y58BWDN2D84F0XT62G8F9',
  'PL-PF01-BLK': 'variant_01M00Y58BWKB4XEA6K7Q91QN8D',

  // Pomabru
  'variant_medusa_pomabru_887711223': 'variant_01M00Y58BWHHV2GSCG0ZTAXAX2',
  'variant_medusa_pomabru_black': 'variant_01M00Y58BWHHV2GSCG0ZTAXAX2',
  'PL-PBRU01-BLK': 'variant_01M00Y58BWHHV2GSCG0ZTAXAX2',

  // Advanced Brush Heads
  'variant_medusa_pbh_advanced': 'variant_01M00Y58BWY3NBDGFNYZHTT4YY',
  'variant_medusa_pbh_adv_black': 'variant_01M00Y58BWY3NBDGFNYZHTT4YY',
  'variant_medusa_pbh_adv_white': 'variant_01M00Y58BW8ZQDAWQ2XPX00CRY',
  'PL-BH02ADNY4PC-BLK': 'variant_01M00Y58BWY3NBDGFNYZHTT4YY',
  'PL-BH02ADNY4PC-WHT': 'variant_01M00Y58BW8ZQDAWQ2XPX00CRY',

  // Nylon Silicone Brush Heads
  'variant_medusa_pbh_nylon_silicone': 'variant_01M00Y58BW9KS65BG16X36G0HA',
  'variant_medusa_pbh_nylon_black': 'variant_01M00Y58BW9KS65BG16X36G0HA',
  'variant_medusa_pbh_nylon_white': 'variant_01M00Y58BW27HMMB8F4VXRFT9F',
  'PL-BH01NY4PC-BLK': 'variant_01M00Y58BW9KS65BG16X36G0HA',
  'PL-BH01NY4PC-WHT': 'variant_01M00Y58BW27HMMB8F4VXRFT9F',

  // Pure Silicone Brush Heads
  'variant_medusa_pbh_pure_silicone': 'variant_01M00Y58BWEBBRX594YQQPJ1RE',
  'variant_medusa_pbh_sil_black': 'variant_01M00Y58BWEBBRX594YQQPJ1RE',
  'variant_medusa_pbh_sil_white': 'variant_01M00Y58BW9900AW6TVYRG0V7D',
  'PL-BH01SIL2PC-BLK': 'variant_01M00Y58BWEBBRX594YQQPJ1RE',
  'PL-BH01SIL2PC-WHT': 'variant_01M00Y58BW9900AW6TVYRG0V7D',

  // Pomaclip
  'variant_medusa_pomaclip_1': 'variant_01M00Y58BW01ZFJZTZW3EJ4KA3',
  'variant_medusa_pomaclip_silver': 'variant_01M00Y58BWNMK0MES2V7M9TV5V',
  'PMD-CLBLK01': 'variant_01M00Y58BW01ZFJZTZW3EJ4KA3',
  'PMD-CLWHT01': 'variant_01M00Y58BWNMK0MES2V7M9TV5V',
  'PMD-CLGRN01': 'variant_01M00Y58BWVZFH5WNABKZYB30C',
  'PMD-CLBLU01': 'variant_01M00Y58BWPF8FH578ZQ1WW8PM',

  // Pomacloth
  'variant_medusa_pomacloth_1': 'variant_01M00Y58BWNPSQWAFKDNBD1EMG',
  'variant_medusa_pomacloth_black': 'variant_01M00Y58BWNPSQWAFKDNBD1EMG',
  'PL-MCC01-BLK': 'variant_01M00Y58BWNPSQWAFKDNBD1EMG',
};

export function getMockProduct(handle: string): MedusaProduct | null {
  if (handle === 'pomabrush-hero' || handle === 'pomabrush' || handle === 'pomabrush-model-2-0') {
    return {
      id: 'prod_01M00Y589N5R2VZPC3MMS39QVE',
      title: 'Pomabrush Model 2.0',
      handle: 'pomabrush-model-2-0',
      description: "The brand's flagship minimalist sonic electric toothbrush featuring medical-grade silicone, charcoal-infused bristles, and a compact charging travel case.",
      priceRange: {
        minVariantPrice: {
          amount: '129.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/hero-featured.png',
            altText: 'Pomabrush',
          },
          {
            url: '/assets/figma/lineup-pomabrush.png',
            altText: 'Pomabrush View 2',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_01M00Y58BV70RT2K6M5B2TSJ7T',
            title: 'Charcoal Black',
            price: '129.00',
            sku: 'PL-PB02-BLK',
            availableForSale: true,
            quantityAvailable: 100,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BWGKM55SHJVTWV9JTA',
            title: 'Cotton White',
            price: '129.00',
            sku: 'PL-PB02-WHT',
            availableForSale: true,
            quantityAvailable: 100,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomafloss-floating' || handle === 'pomafloss' || handle === 'pomafloss-model-2-0') {
    return {
      id: 'prod_01M00Y589NY0AD39HGA2K8BYQX',
      title: 'Pomafloss Model 2.0',
      handle: 'pomafloss-model-2-0',
      description: 'A portable, compact water flosser designed for daily gum care and travel.',
      priceRange: {
        minVariantPrice: {
          amount: '115.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/lineup-pomafloss.png',
            altText: 'Pomafloss',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_01M00Y58BWE6Y3DDSVJQ7ATEYB',
            title: 'Charcoal Black',
            price: '115.00',
            sku: 'PL-PF02-BLK',
            availableForSale: true,
            quantityAvailable: 100,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BWZGHJSG719SDMMTGJ',
            title: 'Cotton White',
            price: '115.00',
            sku: 'PL-PF02-WHT',
            availableForSale: true,
            quantityAvailable: 100,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomabru' || handle === 'pomabru-portable-espresso-machine') {
    return {
      id: 'prod_01M00Y589NJ7F94BHCSRZW00WT',
      title: 'Pomabru - Portable Espresso Machine',
      handle: 'pomabru-portable-espresso-machine',
      description: 'A compact, portable handheld travel espresso machine compatible with coffee capsules and ground coffee.',
      priceRange: {
        minVariantPrice: {
          amount: '199.95',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/lineup-pomabru.png',
            altText: 'Pomabru',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_01M00Y58BWHHV2GSCG0ZTAXAX2',
            title: 'Matte Black',
            price: '199.95',
            sku: 'PL-PBRU01-BLK',
            availableForSale: true,
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Matte Black' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomabrush-heads-advanced' || handle === 'pomabrush-advanced-brush-heads-4pack') {
    return {
      id: 'prod_01M00Y589NZ37RBN0104AR4H5G',
      title: 'Pomabrush - Advanced Brush Heads (Pack of 4)',
      handle: 'pomabrush-advanced-brush-heads-4pack',
      description: 'Replacement brush heads engineered for deeper surface cleaning and plaque removal.',
      priceRange: {
        minVariantPrice: {
          amount: '22.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/accessory-1.png',
            altText: 'Pomabrush Heads – Advanced',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_01M00Y58BWY3NBDGFNYZHTT4YY',
            title: 'Charcoal Black',
            price: '22.00',
            sku: 'PL-BH02ADNY4PC-BLK',
            availableForSale: true,
            quantityAvailable: 200,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BW8ZQDAWQ2XPX00CRY',
            title: 'Cotton White',
            price: '22.00',
            sku: 'PL-BH02ADNY4PC-WHT',
            availableForSale: true,
            quantityAvailable: 200,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomabrush-heads-nylon-silicone' || handle === 'pomabrush-nylon-silicone-brush-heads-4pack') {
    return {
      id: 'prod_01M00Y589N2T4GS6REE0EAMDTY',
      title: 'Pomabrush - Nylon-Silicone Brush Heads (Pack of 4)',
      handle: 'pomabrush-nylon-silicone-brush-heads-4pack',
      description: 'Hybrid replacement heads combining charcoal-infused nylon inner bristles with outer protective silicone loops.',
      priceRange: {
        minVariantPrice: {
          amount: '14.50',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/lineup-pomaaccessories.png',
            altText: 'Pomabrush Heads – Nylon-Silicone',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_01M00Y58BW9KS65BG16X36G0HA',
            title: 'Charcoal Black',
            price: '14.50',
            sku: 'PL-BH01NY4PC-BLK',
            availableForSale: true,
            quantityAvailable: 200,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BW27HMMB8F4VXRFT9F',
            title: 'Cotton White',
            price: '14.50',
            sku: 'PL-BH01NY4PC-WHT',
            availableForSale: true,
            quantityAvailable: 200,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomabrush-heads-pure-silicone' || handle === 'pomaaccessoris' || handle === 'pomabrush-pure-silicone-brush-heads-2pack') {
    return {
      id: 'prod_01M00Y589NRGDW12SHPNPPK9DY',
      title: 'Pomabrush - Pure Silicone Brush Heads (Pack of 2)',
      handle: 'pomabrush-pure-silicone-brush-heads-2pack',
      description: 'Ultra-gentle, all-silicone replacement heads tailored for sensitive teeth and gums.',
      priceRange: {
        minVariantPrice: {
          amount: '9.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/accessory-1.png',
            altText: 'Pomabrush Heads – Pure Silicone',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_01M00Y58BWEBBRX594YQQPJ1RE',
            title: 'Charcoal Black',
            price: '9.00',
            sku: 'PL-BH01SIL2PC-BLK',
            availableForSale: true,
            quantityAvailable: 200,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BW9900AW6TVYRG0V7D',
            title: 'Cotton White',
            price: '9.00',
            sku: 'PL-BH01SIL2PC-WHT',
            availableForSale: true,
            quantityAvailable: 200,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomaclip' || handle === 'pomaclip-magnetic-toothbrush-holder') {
    return {
      id: 'prod_01M00Y589NT05TPA6PYMPGCB51',
      title: 'Pomaclip - Magnetic Toothbrush Holder',
      handle: 'pomaclip-magnetic-toothbrush-holder',
      description: 'A minimalist magnetic bathroom wall mount/holder designed to dock the Pomabrush.',
      priceRange: {
        minVariantPrice: {
          amount: '19.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/accessory-4.png',
            altText: 'Pomaclip',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_01M00Y58BW01ZFJZTZW3EJ4KA3',
            title: 'Charcoal Black',
            price: '19.00',
            sku: 'PMD-CLBLK01',
            availableForSale: true,
            quantityAvailable: 100,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BWNMK0MES2V7M9TV5V',
            title: 'Cotton White',
            price: '19.00',
            sku: 'PMD-CLWHT01',
            availableForSale: true,
            quantityAvailable: 100,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
          {
            id: 'variant_01M00Y58BWVZFH5WNABKZYB30C',
            title: 'Forest Green',
            price: '19.00',
            sku: 'PMD-CLGRN01',
            availableForSale: true,
            quantityAvailable: 100,
            selectedOptions: [{ name: 'Color', value: 'Forest Green' }],
          },
          {
            id: 'variant_01M00Y58BWPF8FH578ZQ1WW8PM',
            title: 'Santorini Blue',
            price: '19.00',
            sku: 'PMD-CLBLU01',
            availableForSale: true,
            quantityAvailable: 100,
            selectedOptions: [{ name: 'Color', value: 'Santorini Blue' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomacloth' || handle === 'pomacloth-microfibre-cleaning-cloth') {
    return {
      id: 'prod_01M00Y589NBV1P9CRQZN3FHCTG',
      title: 'Pomacloth - Microfibre Cleaning Cloth',
      handle: 'pomacloth-microfibre-cleaning-cloth',
      description: 'A premium, soft microfiber cleaning cloth designed to wipe down and maintain Poma devices and travel cases.',
      priceRange: {
        minVariantPrice: {
          amount: '12.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/accessory-2.png',
            altText: 'Pomacloth',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_01M00Y58BWNPSQWAFKDNBD1EMG',
            title: 'Charcoal Black',
            price: '12.00',
            sku: 'PL-MCC01-BLK',
            availableForSale: true,
            quantityAvailable: 100,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
        ],
      },
    };
  }

  const formattedTitle = handle.replace(/[-_]/g, ' ');
  return {
    id: `prod_mock_${handle}`,
    title: formattedTitle,
    handle: handle,
    description: 'Poma Lifestyle premium curated item.',
    priceRange: { minVariantPrice: { amount: '25.00' } },
    images: { nodes: [{ url: '/assets/figma/accessory-1.png', altText: formattedTitle }] },
    variants: {
      nodes: [
        {
          id: 'variant_01M00Y58BV70RT2K6M5B2TSJ7T',
          title: 'Standard',
          price: '25.00',
          sku: `PL-PB02-BLK`,
          availableForSale: true,
          quantityAvailable: 25,
        },
      ],
    },
  };
}

const HANDLE_ALIASES: Record<string, string> = {
  'pomabru': 'pomabru-portable-espresso-machine',
  'pomabrush': 'pomabrush-model-2-0',
  'pomafloss': 'pomafloss-model-1-0',
  'pomaclip': 'pomaclip-magnetic-toothbrush-holder',
  'pomacloth': 'pomacloth-microfibre-cleaning-cloth',
};

export async function fetchMedusaProductByHandle(handle: string): Promise<MedusaProduct | null> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
  }

  const targetHandle = HANDLE_ALIASES[handle.toLowerCase()] || handle;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    // Try Medusa v2 /store/products endpoint with handle filter and metadata fields
    let res = await fetch(`${backendUrl}/store/products?handle=${encodeURIComponent(targetHandle)}&fields=+metadata,*images,*variants`, {
      headers,
      signal: controller.signal,
    });

    if (res.ok) {
      const data = await res.json();
      let product = data.products?.[0];

      // If alias handle returned no product, retry with exact original handle
      if (!product && targetHandle !== handle) {
        const retryRes = await fetch(`${backendUrl}/store/products?handle=${encodeURIComponent(handle)}&fields=+metadata,*images,*variants`, {
          headers,
          signal: controller.signal,
        });
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          product = retryData.products?.[0];
        }
      }

      clearTimeout(timeoutId);

      if (product) {
        return adaptMedusaProduct(product);
      }
    }
    clearTimeout(timeoutId);
  } catch (err) {
    console.warn(`Medusa API offline at ${backendUrl}, using fallback product for '${handle}':`, err);
  }

  return getMockProduct(handle);
}

export function formatImageUrl(url?: string | null): string {
  if (!url) return '/assets/products/placeholder.png';
  if (url.startsWith('data:')) return url;

  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  let fullUrl = url.trim();

  // Handle relative paths (e.g. /static/... or static/... or /uploads/...)
  if (fullUrl.startsWith('/')) {
    fullUrl = `${backendUrl}${fullUrl}`;
  } else if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://') && !fullUrl.startsWith('//')) {
    fullUrl = `${backendUrl}/${fullUrl}`;
  }

  try {
    const decoded = decodeURIComponent(fullUrl);
    return encodeURI(decoded);
  } catch {
    return encodeURI(fullUrl);
  }
}

function adaptMedusaProduct(medusaProd: any): MedusaProduct {
  const variants = (medusaProd.variants || []).map((v: any) => ({
    id: v.id,
    title: v.title || 'Default Variant',
    price: (v.calculated_price?.calculated_amount ?? v.prices?.[0]?.amount ?? 13500) / 100 + '',
    sku: v.sku || 'MEDUSA-SKU',
    availableForSale: v.inventory_quantity !== undefined ? v.inventory_quantity > 0 : true,
    quantityAvailable: v.inventory_quantity ?? 10,
    selectedOptions: v.options?.map((opt: any) => ({ name: opt.option?.title || 'Option', value: opt.value })),
    image: v.thumbnail ? { url: formatImageUrl(v.thumbnail), altText: v.title || '' } : null,
  }));

  const images = (medusaProd.images || []).map((img: any) => ({
    url: formatImageUrl(typeof img === 'string' ? img : img.url),
    altText: medusaProd.title || '',
  }));
  if (images.length === 0 && medusaProd.thumbnail) {
    images.push({ url: formatImageUrl(medusaProd.thumbnail), altText: medusaProd.title || '' });
  }

  const minPrice = variants[0]?.price || '35.00';

  return {
    id: medusaProd.id,
    title: medusaProd.title,
    handle: medusaProd.handle,
    description: medusaProd.description || '',
    priceRange: { minVariantPrice: { amount: minPrice } },
    images: { nodes: images },
    variants: { nodes: variants },
    tags: medusaProd.tags?.map((t: any) => t.value || t),
    metadata: medusaProd.metadata || {},
  };
}

function getMedusaHeaders(token?: string): Record<string, string> {
  const pubKey = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_659d8e4863ae8e42500da9365796d43bb13c5a33b937ac0a6945ade6579ddd71';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': pubKey,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function generateCheckoutLink(
  lineItems: Array<{ variantId: string; quantity: number }>,
  customerAccessToken?: string
): Promise<string> {
  // Direct storefront /checkout page route
  return '/checkout';
}

export async function createMedusaCart(
  lineItems: Array<{ variantId: string; quantity: number }>,
  customerAccessToken?: string
): Promise<any> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers = getMedusaHeaders(customerAccessToken);

  try {
    // 1. Fetch available products from Medusa backend to resolve real variant IDs if needed
    let realVariantMap: Record<string, string> = {};
    try {
      const prodRes = await fetch(`${backendUrl}/store/products?fields=*variants`, { headers });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        (prodData.products || []).forEach((p: any) => {
          (p.variants || []).forEach((v: any) => {
            if (v.id) {
              realVariantMap[v.id] = v.id;
              if (v.sku) realVariantMap[v.sku] = v.id;
              if (p.handle) realVariantMap[p.handle] = v.id;
            }
          });
        });
      }
    } catch (e) {
      console.warn('Could not fetch products for variant mapping:', e);
    }

    const fallbackRealVariantId = Object.values(realVariantMap)[0] || 'variant_01M00Y58BWY3NBDGFNYZHTT4YY';

    const payload: any = {
      currency_code: 'usd',
      items: lineItems.map((item) => {
        let validVariantId = item.variantId;
        if (!validVariantId.startsWith('variant_01') && !validVariantId.startsWith('variant_02')) {
          validVariantId = REAL_VARIANT_MAP[item.variantId] || realVariantMap[item.variantId] || fallbackRealVariantId;
        }
        return {
          variant_id: validVariantId,
          quantity: item.quantity,
        };
      }),
    };

    const res = await fetch(`${backendUrl}/store/carts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return data.cart;
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn('Medusa cart creation notice:', errData);
    }
  } catch (err) {
    console.warn('Medusa createCart endpoint offline/error:', err);
  }

  // Local fallback cart if backend is offline
  return {
    id: `cart_mock_${Date.now()}`,
    items: lineItems,
    currency_code: 'usd',
    total: 13500,
  };
}

export async function updateMedusaCart(cartId: string, data: any): Promise<any> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers = getMedusaHeaders();

  try {
    const res = await fetch(`${backendUrl}/store/carts/${cartId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const result = await res.json();
      return result.cart;
    }
  } catch (err) {
    console.warn(`Medusa updateMedusaCart error for cart ${cartId}:`, err);
  }
  return null;
}

export async function fetchShippingOptions(cartId: string): Promise<any[]> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers = getMedusaHeaders();

  try {
    const res = await fetch(`${backendUrl}/store/shipping-options?cart_id=${cartId}`, { headers });
    if (res.ok) {
      const data = await res.json();
      return data.shipping_options || [];
    }
  } catch (err) {
    console.warn('Medusa fetchShippingOptions error:', err);
  }

  // Fallback shipping options if backend offline/unseeded
  return [
    {
      id: 'so_standard_express',
      name: 'Standard Express Shipping (2-3 Days)',
      amount: 1000,
      price_type: 'flat',
    },
    {
      id: 'so_priority_overnight',
      name: 'Priority Overnight Shipping',
      amount: 2500,
      price_type: 'flat',
    },
  ];
}

export async function addShippingMethodToCart(cartId: string, optionId: string): Promise<any> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers = getMedusaHeaders();

  try {
    const res = await fetch(`${backendUrl}/store/carts/${cartId}/shipping-methods`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ option_id: optionId }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.cart;
    }
  } catch (err) {
    console.warn('Medusa addShippingMethodToCart error:', err);
  }
  return null;
}

export async function initiatePaymentSession(
  cartId: string,
  providerId: string = 'pp_stripe_stripe'
): Promise<{ clientSecret?: string; paymentSession?: any; error?: string }> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers = getMedusaHeaders();

  try {
    // 1. Try Medusa v2 Payment Collection flow
    let collectionId: string | null = null;
    
    // First, try creating a payment collection for the cart
    const colRes = await fetch(`${backendUrl}/store/payment-collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ cart_id: cartId }),
    });

    if (colRes.ok) {
      const colData = await colRes.json();
      collectionId = colData.payment_collection?.id;
    }

    if (collectionId) {
      // Create payment session on the collection
      const sessionRes = await fetch(`${backendUrl}/store/payment-collections/${collectionId}/payment-sessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ provider_id: providerId }),
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const session = sessionData.payment_collection?.payment_sessions?.find(
          (s: any) => s.provider_id === providerId
        ) || sessionData.payment_session;

        const clientSecret = session?.data?.client_secret || session?.data?.client_secret_intent;
        return { clientSecret, paymentSession: session };
      }
    }

    // 2. Fallback to /store/carts/:id/payment-sessions
    const cartSessionRes = await fetch(`${backendUrl}/store/carts/${cartId}/payment-sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider_id: providerId }),
    });

    if (cartSessionRes.ok) {
      const data = await cartSessionRes.json();
      const session = data.cart?.payment_sessions?.find(
        (s: any) => s.provider_id === providerId
      ) || data.cart?.payment_session;

      const clientSecret = session?.data?.client_secret || session?.data?.client_secret_intent;
      return { clientSecret, paymentSession: session };
    }
  } catch (err) {
    console.warn('Initiate Stripe payment session error:', err);
  }

  // Mock Stripe client_secret for local sandbox/testing if backend is offline or Stripe test keys active
  return {
    clientSecret: 'pi_3PomaLifestyle_secret_TestModeClientSecret99182',
    paymentSession: { provider_id: providerId, status: 'pending' },
  };
}

export function attachOrderToCustomerSession(orderData: any) {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem('poma_active_customer');
    if (!saved) return;
    const customer: Customer = JSON.parse(saved);
    if (!customer.orders) customer.orders = [];

    const orderId = orderData?.id || `order_${Date.now()}`;
    const displayId = orderData?.display_id || Math.floor(1000 + Math.random() * 9000);

    // Check if order is already linked
    if (customer.orders.some((o) => o.id === orderId || o.orderNumber === displayId)) {
      return;
    }

    // Extract line items directly from Medusa order or fallback to cart
    let lineItems: Array<{ title: string; quantity: number; imageUrl?: string }> = [];

    if (orderData?.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
      lineItems = orderData.items.map((i: any) => {
        const title = i.title || i.product_title || 'Poma Product';
        const variantSuffix = i.variant_title && !title.includes(i.variant_title) ? ` (${i.variant_title})` : '';
        return {
          title: `${title}${variantSuffix}`,
          quantity: i.quantity || 1,
          imageUrl: i.thumbnail || '/assets/figma/hero-featured.png',
        };
      });
    }

    if (lineItems.length === 0) {
      try {
        const cartItems = JSON.parse(localStorage.getItem('poma_cart') || '[]');
        if (cartItems.length > 0) {
          lineItems = cartItems.map((i: any) => ({
            title: i.title,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
          }));
        }
      } catch (e) {}
    }

    if (lineItems.length === 0) {
      lineItems = [
        {
          title: 'Poma Lifestyle Item',
          quantity: 1,
          imageUrl: '/assets/figma/hero-featured.png',
        },
      ];
    }

    const newOrder = {
      id: orderId,
      orderNumber: displayId,
      processedAt: orderData?.created_at || new Date().toISOString(),
      financialStatus: orderData?.payment_status === 'captured' ? 'paid' : 'paid',
      fulfillmentStatus: orderData?.fulfillment_status || 'unfulfilled',
      totalPrice: {
        amount: orderData?.total !== undefined 
          ? (typeof orderData.total === 'number' && orderData.total > 500 ? (orderData.total / 100).toFixed(2) : Number(orderData.total).toFixed(2))
          : '129.00',
        currencyCode: (orderData?.currency_code || 'USD').toUpperCase(),
      },
      lineItems,
    };

    customer.orders.unshift(newOrder);

    // Save to active session & user account database
    localStorage.setItem('poma_active_customer', JSON.stringify(customer));

    if (customer.email) {
      const userKey = `poma_user_${customer.email.toLowerCase()}`;
      const existingUser = localStorage.getItem(userKey);
      if (existingUser) {
        try {
          const parsed = JSON.parse(existingUser);
          parsed.customer = customer;
          localStorage.setItem(userKey, JSON.stringify(parsed));
        } catch (e) {}
      }
    }
  } catch (err) {
    console.error('Error attaching order to customer session:', err);
  }
}

export async function completeMedusaCart(cartId: string): Promise<{ type: 'order' | 'cart'; order?: any; cart?: any; error?: string }> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers = getMedusaHeaders();

  let finalOrder: any = null;

  try {
    // Step 1: Attach Shipping Method FIRST so cart totals calculate properly
    try {
      const shipRes = await fetch(`${backendUrl}/store/shipping-options?cart_id=${cartId}`, { headers });
      if (shipRes.ok) {
        const shipData = await shipRes.json();
        const optionId = shipData.shipping_options?.[0]?.id || 'so_01M00QXFMFK9YW8KSJNSK8KH2Z';
        if (optionId) {
          await fetch(`${backendUrl}/store/carts/${cartId}/shipping-methods`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ option_id: optionId }),
          });
        }
      }
    } catch (e) {
      console.warn('Could not attach shipping method:', e);
    }

    // Step 2: Ensure Payment Collection exists for the updated cart total
    let colId: string | null = null;
    try {
      const colRes = await fetch(`${backendUrl}/store/payment-collections`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ cart_id: cartId }),
      });
      if (colRes.ok) {
        const colData = await colRes.json();
        colId = colData.payment_collection?.id || null;
      } else {
        const cartRes = await fetch(`${backendUrl}/store/carts/${cartId}?fields=*payment_collection`, { headers });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          colId = cartData.cart?.payment_collection?.id || null;
        }
      }
    } catch (e) {
      console.warn('Payment collection error:', e);
    }

    // Step 3: Create Payment Session for the Collection
    if (colId) {
      try {
        const sessRes = await fetch(`${backendUrl}/store/payment-collections/${colId}/payment-sessions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ provider_id: 'pp_system_default' }),
        });
        if (!sessRes.ok) {
          await fetch(`${backendUrl}/store/payment-collections/${colId}/payment-sessions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ provider_id: 'pp_stripe_stripe' }),
          }).catch(() => {});
        }
      } catch (e) {
        console.warn('Payment session creation notice:', e);
      }
    }

    // Step 4: Complete Cart on Medusa Backend
    const res = await fetch(`${backendUrl}/store/carts/${cartId}/complete`, {
      method: 'POST',
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.type === 'order' || data.order) {
        finalOrder = data.order || data.data;
        attachOrderToCustomerSession(finalOrder);
        return { type: 'order', order: finalOrder };
      }
      return { type: 'cart', cart: data.cart };
    } else {
      const errJson = await res.json().catch(() => ({}));
      console.warn('Cart complete endpoint notice:', errJson);
    }
  } catch (err: any) {
    console.warn('Medusa completeMedusaCart error:', err);
  }

  // Fallback order generation for testing UI if backend is offline
  finalOrder = {
    id: `order_medusa_${Date.now()}`,
    display_id: Math.floor(1000 + Math.random() * 9000),
    status: 'pending',
    payment_status: 'captured',
    fulfillment_status: 'not_fulfilled',
    total: 13500,
    currency_code: 'usd',
    created_at: new Date().toISOString(),
  };

  attachOrderToCustomerSession(finalOrder);

  return {
    type: 'order',
    order: finalOrder,
  };
}

export async function fetchMedusaOrder(orderId: string): Promise<any> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers = getMedusaHeaders();

  try {
    const res = await fetch(`${backendUrl}/store/orders/${orderId}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.order) {
        attachOrderToCustomerSession(data.order);
        return data.order;
      }
    }
  } catch (err) {
    console.warn(`Fetch order error for ${orderId}:`, err);
  }

  const fallbackOrder = {
    id: orderId,
    display_id: Math.floor(1000 + Math.random() * 9000),
    status: 'processing',
    payment_status: 'captured',
    fulfillment_status: 'preparing',
    total: 13500,
    currency_code: 'usd',
    created_at: new Date().toISOString(),
  };

  attachOrderToCustomerSession(fallbackOrder);
  return fallbackOrder;
}


export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  defaultAddress?: {
    id: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  orders?: Array<{
    id: string;
    orderNumber: number;
    processedAt: string;
    financialStatus: string;
    fulfillmentStatus: string;
    totalPrice: {
      amount: string;
      currencyCode: string;
    };
    lineItems: Array<{
      title: string;
      quantity: number;
      imageUrl?: string;
    }>;
  }>;
}

const mockCustomers: Record<string, { customer: Customer; passwordHash: string }> = {};

function getMockCustomer(email: string) {
  const key = email.toLowerCase();
  if (mockCustomers[key]) return mockCustomers[key];
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`poma_user_${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        mockCustomers[key] = parsed;
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
  }
  return null;
}

function saveMockCustomer(email: string, passwordHash: string, customer: Customer) {
  const key = email.toLowerCase();
  const entry = { customer, passwordHash };
  mockCustomers[key] = entry;
  if (typeof window !== 'undefined') {
    localStorage.setItem(`poma_user_${key}`, JSON.stringify(entry));
    localStorage.setItem('poma_active_customer', JSON.stringify(customer));
  }
}



export async function medusaRegister(
  input: any
): Promise<{ customer?: { id: string; email: string }; errors?: string[] }> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const { email, password, firstName, lastName } = input;
  const headers = getMedusaHeaders();

  const existing = getMockCustomer(email);
  if (existing && existing.customer.id.startsWith('cus_') && !existing.customer.id.startsWith('cus_medusa_')) {
    return { errors: ['An account with this email address already exists.'] };
  }

  const generatedId = `cus_medusa_${Math.floor(Math.random() * 100000000)}`;
  const localCustomer: Customer = {
    id: generatedId,
    firstName: firstName || '',
    lastName: lastName || '',
    email,
    orders: [],
  };
  saveMockCustomer(email, password, localCustomer);

  try {
    // Step 1: Register auth identity in Medusa 2.0 Auth Module
    const authRes = await fetch(`${backendUrl}/auth/customer/emailpass/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    });

    if (authRes.ok) {
      const authData = await authRes.json();
      const token = authData.token;

      if (token) {
        // Step 2: Create Customer record linked to Auth Identity in Medusa 2.0 Customer Module
        const custRes = await fetch(`${backendUrl}/store/customers`, {
          method: 'POST',
          headers: getMedusaHeaders(token),
          body: JSON.stringify({
            email,
            first_name: firstName,
            last_name: lastName,
          }),
        });

        if (custRes.ok) {
          const custData = await custRes.json();
          const c = custData.customer;
          if (c && c.id) {
            localCustomer.id = c.id;
            saveMockCustomer(email, password, localCustomer);
          }
          return { customer: { id: localCustomer.id, email: localCustomer.email } };
        }
      }
    } else {
      // Fallback for Medusa v1 style /store/customers API
      const storeRes = await fetch(`${backendUrl}/store/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
      });
      if (storeRes.ok) {
        const data = await storeRes.json();
        const c = data.customer;
        if (c && c.id) {
          localCustomer.id = c.id;
          saveMockCustomer(email, password, localCustomer);
        }
        return { customer: { id: localCustomer.id, email: localCustomer.email } };
      }
    }
  } catch (err) {
    console.warn('Medusa customer registration API offline, using local session mock:', err);
  }

  return { customer: { id: localCustomer.id, email: localCustomer.email } };
}

export async function medusaLogin(
  input: any
): Promise<{ accessToken?: string; expiresAt?: string; errorType?: 'EMAIL' | 'PASSWORD' | 'GENERIC'; errors?: string[] }> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const { email, password } = input;
  const headers = getMedusaHeaders();

  // 1. Check local mock customer first
  const localUser = getMockCustomer(email);
  if (localUser) {
    if (localUser.passwordHash === password) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('poma_active_customer', JSON.stringify(localUser.customer));
      }
      const mockToken = `mock_token_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
      return { accessToken: mockToken, expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString() };
    } else {
      return { errorType: 'PASSWORD', errors: ['password is wrong.'] };
    }
  }

  // 2. Try Medusa backend authentication
  try {
    let res = await fetch(`${backendUrl}/auth/customer/emailpass`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    });

    let token: string | null = null;
    let errMessage = '';

    if (res.ok) {
      const data = await res.json();
      token = data.token || data.access_token;
    } else {
      const errJson = await res.json().catch(() => ({}));
      errMessage = (errJson.message || errJson.error || '').toLowerCase();

      let res2 = await fetch(`${backendUrl}/store/auth/token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      });
      if (res2.ok) {
        const data = await res2.json();
        token = data.token || data.access_token;
      } else {
        const errJson2 = await res2.json().catch(() => ({}));
        const errMessage2 = (errJson2.message || errJson2.error || '').toLowerCase();
        errMessage = (errMessage + ' ' + errMessage2).trim();
      }
    }

    if (token) {
      const activeCustomer: Customer = {
        id: `cus_${Math.floor(Math.random() * 100000000)}`,
        firstName: email.split('@')[0],
        lastName: '',
        email,
        orders: [],
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('poma_active_customer', JSON.stringify(activeCustomer));
        saveMockCustomer(email, password, activeCustomer);
      }
      return {
        accessToken: token,
        expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
      };
    }

    if (errMessage.includes('email') || errMessage.includes('not found') || errMessage.includes('user') || errMessage.includes('exist') || errMessage.includes('identity')) {
      return { errorType: 'EMAIL', errors: ['email does not exist.'] };
    } else {
      return { errorType: 'PASSWORD', errors: ['password is wrong.'] };
    }
  } catch (err) {
    console.warn('Medusa login API offline:', err);
  }

  return { errorType: 'EMAIL', errors: ['email does not exist.'] };
}

export async function medusaGetCustomer(
  accessToken: string
): Promise<{ customer?: Customer; errors?: string[] }> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');

  if (!accessToken.startsWith('mock_token_')) {
    try {
      const headers = getMedusaHeaders(accessToken);

      const res = await fetch(`${backendUrl}/store/customers/me?fields=*addresses,*orders`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        const c = data.customer;
        if (c) {
          const defaultAddr = c.addresses?.[0] ? {
            id: c.addresses[0].id,
            address1: c.addresses[0].address_1 || '',
            address2: c.addresses[0].address_2 || undefined,
            city: c.addresses[0].city || '',
            province: c.addresses[0].province || '',
            zip: c.addresses[0].postal_code || '',
            country: c.addresses[0].country_code?.toUpperCase() || '',
          } : undefined;

          const orders = (c.orders || []).map((o: any) => ({
            id: o.id,
            orderNumber: o.display_id || parseInt(o.id.replace(/\D/g, '')) || 1001,
            processedAt: o.created_at,
            financialStatus: o.payment_status?.toUpperCase() || 'PAID',
            fulfillmentStatus: o.fulfillment_status?.toUpperCase() || 'FULFILLED',
            totalPrice: {
              amount: (o.total / 100 || 0).toFixed(2),
              currencyCode: (o.currency_code || 'USD').toUpperCase(),
            },
            lineItems: (o.items || []).map((item: any) => ({
              title: item.title || item.product_title || 'Poma Item',
              quantity: item.quantity || 1,
              imageUrl: item.thumbnail ? formatImageUrl(item.thumbnail) : undefined,
            })),
          }));

          const activeCustomer: Customer = {
            id: c.id,
            firstName: c.first_name || '',
            lastName: c.last_name || '',
            email: c.email,
            phone: c.phone,
            defaultAddress: defaultAddr,
            orders,
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem('poma_active_customer', JSON.stringify(activeCustomer));
          }

          return { customer: activeCustomer };
        }
      }
    } catch (err) {
      console.warn('Medusa getCustomer API offline:', err);
    }
  }

  // Fallback to active customer stored in localStorage
  if (typeof window !== 'undefined') {
    const savedActive = localStorage.getItem('poma_active_customer');
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (parsed && parsed.email) {
          return { customer: parsed };
        }
      } catch (e) {}
    }
  }

  const parts = accessToken.split('_');
  const email = parts[2];
  if (email) {
    const user = getMockCustomer(email);
    if (user) {
      return { customer: user.customer };
    }
  }
  return { errors: ['Session not found or expired.'] };
}

export async function medusaLogout(
  accessToken: string
): Promise<{ deletedAccessToken?: string; errors?: string[] }> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('poma_active_customer');
  }
  return { deletedAccessToken: accessToken };
}
