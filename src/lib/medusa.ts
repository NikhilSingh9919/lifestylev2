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

export function getMockProduct(handle: string): MedusaProduct | null {
  if (handle === 'pomabrush-hero' || handle === 'pomabrush') {
    return {
      id: 'variant_medusa_pomabrush_421389028',
      title: 'pomabrush model 2.0',
      handle: handle,
      description: 'Engineered to perform beautifully, the pomabrush combines advanced sonic technology with sleek, travel-ready design.',
      priceRange: {
        minVariantPrice: {
          amount: '135.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/hero-featured.png',
            altText: 'pomabrush model 2.0',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_medusa_pomabrush_421389028',
            title: 'Charcoal Black',
            price: '135.00',
            sku: 'PB-BLACK-02',
            availableForSale: true,
            quantityAvailable: 15,
          },
        ],
      },
    };
  }

  if (handle === 'pomafloss-floating' || handle === 'pomafloss') {
    return {
      id: 'variant_medusa_pomafloss_901847102',
      title: 'pomafloss',
      handle: handle,
      description: 'Magnetic wall-mount dental floss dispenser. Weightless aesthetic, clean storage, and premium organic expanding floss.',
      priceRange: {
        minVariantPrice: {
          amount: '19.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/lineup-pomafloss.png',
            altText: 'PomaFloss Floating Dispenser',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_medusa_pomafloss_901847102',
            title: 'Satin Gold',
            price: '19.00',
            sku: 'PF-GOLD-02',
            availableForSale: true,
            quantityAvailable: 8,
          },
        ],
      },
    };
  }

  if (handle === 'pomabru') {
    return {
      id: 'variant_medusa_pomabru_887711223',
      title: 'pomabru espresso maker',
      handle: 'pomabru',
      description: 'From early flights to quiet mountain mornings, it reimagines the ritual of espresso for modern travel—combining convenience, precision, and the pleasure of a perfect cup, wherever you go.',
      priceRange: {
        minVariantPrice: {
          amount: '135.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/lineup-pomabru.png',
            altText: 'PomaBru Espresso Maker',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_medusa_pomabru_887711223',
            title: 'Travel Edition',
            price: '135.00',
            sku: 'PB-BRU-01',
            availableForSale: true,
            quantityAvailable: 5,
          },
        ],
      },
    };
  }

  if (handle === 'pomaaccessoris') {
    return {
      id: 'variant_medusa_pomaaccessoris_774433991',
      title: 'pomabrush advanced brush heads - pack of 4',
      handle: 'pomaaccessoris',
      description: 'Engineered to perform beautifully, the pomabrush combines advanced sonic technology with sleek, travel-ready design.',
      priceRange: {
        minVariantPrice: {
          amount: '35.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/figma/accessory-1.png',
            altText: 'pomabrush advanced brush heads - pack of 4',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'variant_medusa_pomaaccessoris_774433991',
            title: 'Charcoal Black',
            price: '35.00',
            sku: 'PB-ACC-01',
            availableForSale: true,
            quantityAvailable: 50,
          },
          {
            id: 'variant_medusa_pomaaccessoris_774433992',
            title: 'Cotton White',
            price: '35.00',
            sku: 'PB-ACC-02',
            availableForSale: true,
            quantityAvailable: 50,
          },
        ],
      },
    };
  }

  const formattedTitle = handle.replace(/[-_]/g, ' ');
  return {
    id: `variant_medusa_mock_${handle}`,
    title: formattedTitle,
    handle: handle,
    description: 'Poma Lifestyle premium curated item.',
    priceRange: { minVariantPrice: { amount: '35.00' } },
    images: { nodes: [{ url: '/assets/figma/accessory-1.png', altText: formattedTitle }] },
    variants: {
      nodes: [
        {
          id: `variant_medusa_mock_${handle}`,
          title: 'Standard',
          price: '35.00',
          sku: `MOCK-${handle.toUpperCase()}`,
          availableForSale: true,
          quantityAvailable: 25,
        },
      ],
    },
  };
}

export async function fetchMedusaProductByHandle(handle: string): Promise<MedusaProduct | null> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    // Try Medusa v2 /store/products endpoint with handle filter
    const res = await fetch(`${backendUrl}/store/products?handle=${encodeURIComponent(handle)}`, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const product = data.products?.[0];
      if (product) {
        return adaptMedusaProduct(product);
      }
    }
  } catch (err) {
    console.warn(`Medusa API offline at ${backendUrl}, using fallback product for '${handle}':`, err);
  }

  return getMockProduct(handle);
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
    image: v.thumbnail ? { url: v.thumbnail, altText: v.title || '' } : null,
  }));

  const images = (medusaProd.images || []).map((img: any) => ({
    url: img.url,
    altText: medusaProd.title || '',
  }));
  if (images.length === 0 && medusaProd.thumbnail) {
    images.push({ url: medusaProd.thumbnail, altText: medusaProd.title || '' });
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
        return `${backendUrl}/checkout?cart_id=${cartId}`;
      }
    }
  } catch (err) {
    console.warn('Medusa live cart API unavailable, generating mock checkout link:', err);
  }

  const cartParts = lineItems.map((item) => `${item.variantId}:${item.quantity}`).join(',');
  return `${backendUrl}/checkout?cart=${cartParts}`;
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

const mockCustomers: Record<string, { customer: Customer; passwordHash: string }> = {
  'test@example.com': {
    customer: {
      id: 'cus_medusa_123456789',
      firstName: 'Nikhil',
      lastName: 'Singh',
      email: 'test@example.com',
      phone: '+1 (555) 019-2834',
      defaultAddress: {
        id: 'addr_medusa_12345',
        address1: '123 Premium Lane',
        address2: 'Apt 4B',
        city: 'New York',
        province: 'NY',
        zip: '10001',
        country: 'United States',
      },
      orders: [
        {
          id: 'order_medusa_1111',
          orderNumber: 1001,
          processedAt: '2026-07-10T14:30:00Z',
          financialStatus: 'PAID',
          fulfillmentStatus: 'FULFILLED',
          totalPrice: { amount: '270.00', currencyCode: 'USD' },
          lineItems: [
            {
              title: 'pomabrush model 2.0 (Charcoal Black)',
              quantity: 2,
              imageUrl: '/assets/figma/hero-featured.png',
            },
          ],
        },
      ],
    },
    passwordHash: 'password123',
  },
};

export async function shopifyRegister(
  input: any
): Promise<{ customer?: { id: string; email: string }; errors?: string[] }> {
  return medusaRegister(input);
}

export async function medusaRegister(
  input: any
): Promise<{ customer?: { id: string; email: string }; errors?: string[] }> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const { email, password, firstName, lastName } = input;

  try {
    const res = await fetch(`${backendUrl}/store/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
    });
    if (res.ok) {
      const data = await res.json();
      return { customer: { id: data.customer.id, email: data.customer.email } };
    }
  } catch (err) {
    console.warn('Medusa customer registration API offline, using local session mock:', err);
  }

  if (mockCustomers[email]) {
    return { errors: ['An account with this email address already exists.'] };
  }
  const id = `cus_medusa_${Math.floor(Math.random() * 100000000)}`;
  mockCustomers[email] = {
    customer: { id, firstName: firstName || '', lastName: lastName || '', email, orders: [] },
    passwordHash: password,
  };
  return { customer: { id, email } };
}

export async function shopifyLogin(
  input: any
): Promise<{ accessToken?: string; expiresAt?: string; errors?: string[] }> {
  return medusaLogin(input);
}

export async function medusaLogin(
  input: any
): Promise<{ accessToken?: string; expiresAt?: string; errors?: string[] }> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const { email, password } = input;

  try {
    const res = await fetch(`${backendUrl}/store/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
      };
    }
  } catch (err) {
    console.warn('Medusa login API offline, using local session mock:', err);
  }

  const user = mockCustomers[email];
  if (user && user.passwordHash === password) {
    const mockToken = `mock_token_${email}_${Date.now()}`;
    return { accessToken: mockToken, expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString() };
  }
  return { errors: ['Unidentified customer. Check your email and password.'] };
}

export async function shopifyGetCustomer(
  accessToken: string
): Promise<{ customer?: Customer; errors?: string[] }> {
  return medusaGetCustomer(accessToken);
}

export async function medusaGetCustomer(
  accessToken: string
): Promise<{ customer?: Customer; errors?: string[] }> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');

  if (!accessToken.startsWith('mock_token_')) {
    try {
      const res = await fetch(`${backendUrl}/store/customers/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const c = data.customer;
        return {
          customer: {
            id: c.id,
            firstName: c.first_name || '',
            lastName: c.last_name || '',
            email: c.email,
            phone: c.phone,
            orders: [],
          },
        };
      }
    } catch (err) {
      console.warn('Medusa getCustomer API offline:', err);
    }
  }

  const parts = accessToken.split('_');
  const email = parts[2] || 'test@example.com';
  const user = mockCustomers[email] || mockCustomers['test@example.com'];
  if (user) {
    return { customer: user.customer };
  }
  return { errors: ['Session not found or expired.'] };
}

export async function shopifyLogout(
  accessToken: string
): Promise<{ deletedAccessToken?: string; errors?: string[] }> {
  return medusaLogout(accessToken);
}

export async function medusaLogout(
  accessToken: string
): Promise<{ deletedAccessToken?: string; errors?: string[] }> {
  return { deletedAccessToken: accessToken };
}
