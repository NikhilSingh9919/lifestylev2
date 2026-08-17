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

export const MEDUSA_VARIANT_MAP: Record<string, string> = {
  'variant_medusa_pomabrush_black': 'variant_01M00Y58BV70RT2K6M5B2TSJ7T',
  'variant_medusa_pomabrush_white': 'variant_01M00Y58BWGKM55SHJVTWV9JTA',
  'variant_medusa_pomabrush_421389028': 'variant_01M00Y58BV70RT2K6M5B2TSJ7T',
  'variant_medusa_pomafloss_white': 'variant_01M00Y58BWDN2D84F0XT62G8F9',
  'variant_medusa_pomafloss_black': 'variant_01M00Y58BWKB4XEA6K7Q91QN8D',
  'variant_medusa_pomafloss_901847102': 'variant_01M00Y58BWDN2D84F0XT62G8F9',
  'variant_medusa_pomabru_black': 'variant_01M00Y58BWHHV2GSCG0ZTAXAX2',
  'variant_medusa_pomabru_887711223': 'variant_01M00Y58BWHHV2GSCG0ZTAXAX2',
  'variant_medusa_pbh_advanced': 'variant_01M00Y58BW8ZQDAWQ2XPX00CRY',
  'variant_medusa_pbh_adv_black': 'variant_01M00Y58BWY3NBDGFNYZHTT4YY',
  'variant_medusa_pbh_adv_white': 'variant_01M00Y58BW8ZQDAWQ2XPX00CRY',
  'variant_medusa_pbh_nylon_silicone': 'variant_01M00Y58BW27HMMB8F4VXRFT9F',
  'variant_medusa_pbh_nylon_black': 'variant_01M00Y58BW9KS65BG16X36G0HA',
  'variant_medusa_pbh_nylon_white': 'variant_01M00Y58BW27HMMB8F4VXRFT9F',
  'variant_medusa_pbh_pure_silicone': 'variant_01M00Y58BW9900AW6TVYRG0V7D',
  'variant_medusa_pbh_sil_black': 'variant_01M00Y58BWEBBRX594YQQPJ1RE',
  'variant_medusa_pbh_sil_white': 'variant_01M00Y58BW9900AW6TVYRG0V7D',
  'variant_medusa_pomaclip_1': 'variant_01M00Y58BW01ZFJZTZW3EJ4KA3',
  'variant_medusa_pomaclip_silver': 'variant_01M00Y58BWNMK0MES2V7M9TV5V',
  'variant_medusa_pomacloth_1': 'variant_01M00Y58BWNPSQWAFKDNBD1EMG',
  'variant_medusa_pomacloth_black': 'variant_01M00Y58BWNPSQWAFKDNBD1EMG',
};

export function getMockProduct(handle: string): MedusaProduct | null {
  if (handle === 'pomabrush-hero' || handle === 'pomabrush') {
    return {
      id: 'prod_01M00Y589N2SMCJ71C8FESQEZQ',
      title: 'Pomabrush',
      handle: 'pomabrush',
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
            quantityAvailable: 15,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BWGKM55SHJVTWV9JTA',
            title: 'Cotton White',
            price: '129.00',
            sku: 'PL-PB02-WHT',
            availableForSale: true,
            quantityAvailable: 15,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomafloss-floating' || handle === 'pomafloss') {
    return {
      id: 'prod_01M00Y589N525B6V073E5F36T0',
      title: 'Pomafloss',
      handle: 'pomafloss',
      description: 'A portable, compact water flosser designed for daily gum care and travel.',
      priceRange: {
        minVariantPrice: {
          amount: '64.50',
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
            id: 'variant_01M00Y58BWDN2D84F0XT62G8F9',
            title: 'Cotton White',
            price: '64.50',
            sku: 'PL-PF01-WHT',
            availableForSale: true,
            quantityAvailable: 20,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
          {
            id: 'variant_01M00Y58BWKB4XEA6K7Q91QN8D',
            title: 'Charcoal Black',
            price: '64.50',
            sku: 'PL-PF01-BLK',
            availableForSale: true,
            quantityAvailable: 20,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomabru') {
    return {
      id: 'prod_01M00Y589N3YVAYY9K42W4Q830',
      title: 'Pomabru',
      handle: 'pomabru',
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
            title: 'Charcoal Black',
            price: '199.95',
            sku: 'PL-PBRU01-BLK',
            availableForSale: true,
            quantityAvailable: 10,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomabrush-heads-advanced') {
    return {
      id: 'prod_01M00Y589NZ37RBN0104AR4H5G',
      title: 'Pomabrush Heads – Advanced',
      handle: 'pomabrush-heads-advanced',
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
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BW8ZQDAWQ2XPX00CRY',
            title: 'Cotton White',
            price: '22.00',
            sku: 'PL-BH02ADNY4PC-WHT',
            availableForSale: true,
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomabrush-heads-nylon-silicone') {
    return {
      id: 'prod_01M00Y589NW0G960XQG631WCKF',
      title: 'Pomabrush Heads – Nylon-Silicone',
      handle: 'pomabrush-heads-nylon-silicone',
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
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BW27HMMB8F4VXRFT9F',
            title: 'Cotton White',
            price: '14.50',
            sku: 'PL-BH01NY4PC-WHT',
            availableForSale: true,
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomabrush-heads-pure-silicone' || handle === 'pomaaccessoris') {
    return {
      id: 'prod_01M00Y589NX6H4P866P6X7V8X1',
      title: 'Pomabrush Heads – Pure Silicone',
      handle: handle,
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
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_01M00Y58BW9900AW6TVYRG0V7D',
            title: 'Cotton White',
            price: '9.00',
            sku: 'PL-BH01SIL2PC-WHT',
            availableForSale: true,
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomaclip') {
    return {
      id: 'prod_01M00Y589NYY0Y5VXZ2974V4Q9',
      title: 'Pomaclip',
      handle: 'pomaclip',
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
            title: 'Black',
            price: '19.00',
            sku: 'PMD-CLBLK01',
            availableForSale: true,
            quantityAvailable: 30,
            selectedOptions: [{ name: 'Color', value: 'Black' }],
          },
          {
            id: 'variant_01M00Y58BWNMK0MES2V7M9TV5V',
            title: 'White',
            price: '19.00',
            sku: 'PMD-CLWHT01',
            availableForSale: true,
            quantityAvailable: 30,
            selectedOptions: [{ name: 'Color', value: 'White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomacloth') {
    return {
      id: 'prod_01M00Y589N1A2B3C4D5E6F7G8H',
      title: 'Pomacloth',
      handle: 'pomacloth',
      description: 'A premium, soft microfiber cleaning cloth designed to wipe down and maintain Poma devices and travel cases.',
      priceRange: {
        minVariantPrice: {
          amount: '5.00',
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
            price: '5.00',
            sku: 'PL-MCC01-BLK',
            availableForSale: true,
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
        ],
      },
    };
  }

  return {
    id: `prod_01M00Y589N2SMCJ71C8FESQEZQ`,
    title: 'Pomabrush',
    handle: handle,
    description: 'Poma Lifestyle premium curated item.',
    priceRange: { minVariantPrice: { amount: '129.00' } },
    images: { nodes: [{ url: '/assets/figma/hero-featured.png', altText: 'Pomabrush' }] },
    variants: {
      nodes: [
        {
          id: 'variant_01M00Y58BV70RT2K6M5B2TSJ7T',
          title: 'Charcoal Black',
          price: '129.00',
          sku: 'PL-PB02-BLK',
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

export async function generateCheckoutLink(
  lineItems: Array<{ variantId: string; quantity: number }>,
  customerAccessToken?: string
): Promise<string> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
  }
  if (customerAccessToken) {
    headers['Authorization'] = `Bearer ${customerAccessToken}`;
  }

  try {
    const res = await fetch(`${backendUrl}/store/carts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items: lineItems.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const cartId = data.cart?.id;
      if (cartId) {
        return `/checkout?cart_id=${cartId}`;
      }
    }
  } catch (err) {
    console.warn('Medusa live cart API unavailable, generating mock checkout link:', err);
  }

  const cartParts = lineItems.map((item) => `${item.variantId}:${item.quantity}`).join(',');
  return `/checkout?cart=${encodeURIComponent(cartParts)}`;
}

export interface PlaceOrderInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: string;
  apartment?: string;
  city: string;
  postalCode: string;
  countryCode?: string;
  items: Array<{ variantId: string; quantity: number; title?: string; price?: string; imageUrl?: string }>;
  customerAccessToken?: string;
  providerId?: string;
}

export function normalizeCountryCode(countryStr?: string): string {
  if (!countryStr) return 'gb';
  const clean = countryStr.trim().toLowerCase();
  const map: Record<string, string> = {
    'united kingdom': 'gb',
    'uk': 'gb',
    'great britain': 'gb',
    'ireland': 'ie',
    'india': 'in',
  };
  if (map[clean]) return map[clean];
  if (clean === 'gb' || clean === 'ie' || clean === 'in') return clean;
  return 'gb';
}

export async function createAndCompleteMedusaOrder(input: PlaceOrderInput): Promise<{
  order?: {
    id: string;
    displayId: number;
    orderNumber: number;
    totalPrice: { amount: string; currencyCode: string };
    financialStatus: string;
    fulfillmentStatus: string;
    processedAt: string;
    lineItems: Array<{ title: string; quantity: number; imageUrl?: string }>;
  };
  errors?: string[];
}> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers = getMedusaHeaders(input.customerAccessToken);

  try {
    // 1. Fetch available regions & supported countries
    const regionsRes = await fetch(`${backendUrl}/store/regions`, { headers });
    let regionId = 'reg_01M00QXFJVRCW7WM713T2YX12B';
    let supportedCountries: string[] = ['gb', 'ie', 'in'];
    if (regionsRes.ok) {
      const regionsData = await regionsRes.json();
      if (regionsData.regions && regionsData.regions.length > 0) {
        const firstReg = regionsData.regions[0];
        regionId = firstReg.id;
        if (firstReg.countries && firstReg.countries.length > 0) {
          supportedCountries = firstReg.countries.map((c: any) => (c.iso_2 || c.code || '').toLowerCase()).filter(Boolean);
        }
      }
    }

    // 2. Fetch live products from Medusa backend to discover valid variant IDs
    let liveVariantIds: string[] = [];
    try {
      const prodRes = await fetch(`${backendUrl}/store/products?fields=*variants`, { headers });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        for (const p of prodData.products || []) {
          for (const v of p.variants || []) {
            if (v.id) liveVariantIds.push(v.id);
          }
        }
      }
    } catch {}

    // Resolve input item variant IDs against MEDUSA_VARIANT_MAP and live DB variants
    const resolvedItems = input.items.map((item) => {
      let variantId = item.variantId;
      if (MEDUSA_VARIANT_MAP[variantId]) {
        variantId = MEDUSA_VARIANT_MAP[variantId];
      }
      // If variantId is not in live DB variants and we have live DB variants, fallback to first available live variant
      if (liveVariantIds.length > 0 && !liveVariantIds.includes(variantId)) {
        variantId = liveVariantIds[0];
      }
      return {
        variant_id: variantId,
        quantity: item.quantity || 1,
        title: item.title,
        imageUrl: item.imageUrl,
      };
    });

    const requestedCountry = normalizeCountryCode(input.countryCode);
    const cartCountry = supportedCountries.includes(requestedCountry)
      ? requestedCountry
      : (supportedCountries[0] || 'gb');

    const shippingAddressObj = {
      first_name: input.firstName || 'Valued',
      last_name: input.lastName || 'Customer',
      address_1: input.address || '123 Order St',
      address_2: input.apartment || undefined,
      city: input.city || 'London',
      postal_code: input.postalCode || 'SW1A 1AA',
      country_code: cartCountry,
      phone: input.phone || undefined,
    };

    // 3. Create Medusa Cart WITH customer email and address directly
    let cartRes = await fetch(`${backendUrl}/store/carts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        region_id: regionId,
        email: input.email,
        shipping_address: shippingAddressObj,
        billing_address: shippingAddressObj,
        items: resolvedItems.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity })),
      }),
    });

    if (!cartRes.ok) {
      // If creation failed and we have live variants, try with the first live variant as a safe fallback
      if (liveVariantIds.length > 0) {
        cartRes = await fetch(`${backendUrl}/store/carts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            region_id: regionId,
            email: input.email,
            shipping_address: shippingAddressObj,
            billing_address: shippingAddressObj,
            items: [{ variant_id: liveVariantIds[0], quantity: 1 }],
          }),
        });
      }
    }

    if (!cartRes.ok) {
      const errText = await cartRes.text().catch(() => '');
      throw new Error(`Failed to create Medusa cart: ${errText || cartRes.statusText}`);
    }

    const cartData = await cartRes.json();
    const cartId = cartData.cart?.id;

    if (!cartId) {
      throw new Error('Medusa cart creation response missing cart ID.');
    }

    // 4. Update cart with customer details & shipping address to ensure it is saved
    const updateCartRes = await fetch(`${backendUrl}/store/carts/${cartId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: input.email,
        shipping_address: shippingAddressObj,
        billing_address: shippingAddressObj,
      }),
    });

    if (!updateCartRes.ok) {
      const errText = await updateCartRes.text().catch(() => '');
      console.warn('Failed to update Medusa cart address:', errText);
    }

    // 5. Fetch and set Shipping Method
    let shippingMethodAdded = false;
    const shippingOptsRes = await fetch(`${backendUrl}/store/shipping-options?cart_id=${cartId}`, { headers });
    if (shippingOptsRes.ok) {
      const shippingOptsData = await shippingOptsRes.json();
      const options = shippingOptsData.shipping_options || [];
      for (const opt of options) {
        if (!opt.id) continue;
        const addSmRes = await fetch(`${backendUrl}/store/carts/${cartId}/shipping-methods`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ option_id: opt.id }),
        });
        if (addSmRes.ok) {
          shippingMethodAdded = true;
          break;
        }
      }
    }

    if (!shippingMethodAdded) {
      try {
        const allOptsRes = await fetch(`${backendUrl}/store/shipping-options?is_return=false`, { headers });
        if (allOptsRes.ok) {
          const allOptsData = await allOptsRes.json();
          const allOptions = allOptsData.shipping_options || [];
          for (const opt of allOptions) {
            if (!opt.id) continue;
            const addSmRes = await fetch(`${backendUrl}/store/carts/${cartId}/shipping-methods`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ option_id: opt.id }),
            });
            if (addSmRes.ok) {
              shippingMethodAdded = true;
              break;
            }
          }
        }
      } catch (err) {
        console.warn('Fallback shipping option attachment failed:', err);
      }
    }

    if (!shippingMethodAdded) {
      throw new Error(`Failed to attach a valid shipping method to cart ${cartId}.`);
    }

    // 6. Create Payment Collection and Session
    const payColRes = await fetch(`${backendUrl}/store/payment-collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ cart_id: cartId }),
    });

    if (payColRes.ok) {
      const payColData = await payColRes.json();
      const payColId = payColData.payment_collection?.id;

      if (payColId) {
        await fetch(`${backendUrl}/store/payment-collections/${payColId}/payment-sessions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ provider_id: input.providerId || 'pp_system_default' }),
        });
      }
    }

    // 7. Complete Cart to create the Medusa Order
    const completeRes = await fetch(`${backendUrl}/store/carts/${cartId}/complete`, {
      method: 'POST',
      headers,
    });

    if (completeRes.ok) {
      const completeData = await completeRes.json();
      if (completeData.type === 'order' && completeData.order) {
        const o = completeData.order;
        const displayNum = o.display_id || 1;
        const mappedOrder = {
          id: o.id,
          displayId: displayNum,
          orderNumber: displayNum,
          totalPrice: {
            amount: ((o.total || o.subtotal || 0) / 100).toFixed(2),
            currencyCode: (o.currency_code || 'GBP').toUpperCase(),
          },
          financialStatus: (o.payment_status || 'paid').toUpperCase(),
          fulfillmentStatus: (o.fulfillment_status || 'not_fulfilled').toUpperCase(),
          processedAt: o.created_at || new Date().toISOString(),
          lineItems: (o.items || []).map((item: any) => ({
            title: item.title || item.product_title || 'Poma Item',
            quantity: item.quantity || 1,
            imageUrl: item.thumbnail ? formatImageUrl(item.thumbnail) : undefined,
          })),
        };

        // Save into local active customer profile for instantaneous UI synchronization
        if (typeof window !== 'undefined') {
          const savedActive = localStorage.getItem('poma_active_customer');
          if (savedActive) {
            try {
              const parsed = JSON.parse(savedActive);
              parsed.orders = [mappedOrder, ...(parsed.orders || []).filter((prevO: any) => prevO.id !== mappedOrder.id)];
              localStorage.setItem('poma_active_customer', JSON.stringify(parsed));
            } catch {}
          }
        }

        return { order: mappedOrder };
      } else {
        const errText = JSON.stringify(completeData);
        console.warn('Medusa cart completion returned non-order:', errText);
        throw new Error(completeData.message || 'Medusa cart completion did not return an order object.');
      }
    } else {
      const errText = await completeRes.text().catch(() => '');
      throw new Error(`Medusa cart completion failed (${completeRes.status}): ${errText}`);
    }
  } catch (error: any) {
    console.error('Medusa direct order placement error:', error);
    return { errors: [error.message || 'Order creation failed on Medusa backend.'] };
  }
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
    displayId?: number;
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

      const res = await fetch(`${backendUrl}/store/customers/me?fields=*addresses`, {
        headers,
      });

      // Query live orders directly from Medusa Orders module for this customer
      let liveOrders: any[] = [];
      try {
        const ordersRes = await fetch(`${backendUrl}/store/orders?fields=*items,*customer,*shipping_address,*summary,*fulfillments`, {
          headers,
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          liveOrders = ordersData.orders || [];
        }
      } catch {}

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

          const orders = liveOrders.map((o: any) => {
            let finStatus = 'PAID';
            if (o.payment_status) {
              const ps = o.payment_status.toLowerCase();
              if (ps === 'captured' || ps === 'paid') finStatus = 'PAID';
              else if (ps === 'refunded') finStatus = 'REFUNDED';
              else if (ps === 'partially_refunded') finStatus = 'PARTIALLY REFUNDED';
              else finStatus = ps.toUpperCase();
            }

            let fulStatus = 'UNFULFILLED';
            if (o.fulfillments && o.fulfillments.length > 0) {
              const isDelivered = o.fulfillments.some((f: any) => f.delivered_at && !f.canceled_at);
              const isShipped = o.fulfillments.some((f: any) => f.shipped_at && !f.canceled_at);
              const isCanceled = o.fulfillments.every((f: any) => f.canceled_at);

              if (isDelivered) {
                fulStatus = 'DELIVERED';
              } else if (isShipped) {
                fulStatus = 'SHIPPED';
              } else if (isCanceled) {
                fulStatus = 'CANCELED';
              } else {
                fulStatus = 'FULFILLED';
              }
            } else if (o.fulfillment_status) {
              const fs = o.fulfillment_status.toLowerCase();
              if (fs === 'delivered') fulStatus = 'DELIVERED';
              else if (fs === 'fulfilled') fulStatus = 'FULFILLED';
              else if (fs === 'shipped') fulStatus = 'SHIPPED';
              else if (fs === 'partially_fulfilled' || fs === 'partially_shipped') fulStatus = 'PARTIALLY FULFILLED';
              else fulStatus = 'UNFULFILLED';
            }

            return {
              id: o.id,
              orderNumber: o.display_id || 1,
              displayId: o.display_id || 1,
              processedAt: o.created_at,
              financialStatus: finStatus,
              fulfillmentStatus: fulStatus,
              totalPrice: {
                amount: ((o.total || o.subtotal || 0) / (o.total > 1000 ? 100 : 1)).toFixed(2),
                currencyCode: (o.currency_code || 'GBP').toUpperCase(),
              },
              lineItems: (o.items || []).map((item: any) => ({
                title: item.title || item.product_title || 'Poma Item',
                quantity: item.quantity || 1,
                imageUrl: item.thumbnail ? formatImageUrl(item.thumbnail) : undefined,
              })),
            };
          });

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
    let activeCust: Customer | null = null;
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (parsed && parsed.email) {
          activeCust = parsed;
        }
      } catch (e) {}
    }

    const parts = accessToken.split('_');
    const emailFromToken = parts[2];
    const targetEmail = activeCust?.email || emailFromToken;

    if (targetEmail) {
      const userEntry = getMockCustomer(targetEmail);
      if (userEntry?.customer) {
        const userCust = userEntry.customer;
        const mergedOrders = [
          ...(activeCust?.orders || []),
          ...(userCust.orders || []).filter((uO: any) => !(activeCust?.orders || []).some((aO: any) => aO.id === uO.id)),
        ];

        const combinedCustomer: Customer = {
          ...userCust,
          ...activeCust,
          orders: mergedOrders,
        };

        localStorage.setItem('poma_active_customer', JSON.stringify(combinedCustomer));
        return { customer: combinedCustomer };
      }
    }

    if (activeCust) {
      return { customer: activeCust };
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
