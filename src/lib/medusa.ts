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
      title: 'Pomabrush',
      handle: 'pomabrush',
      description: "The brand's flagship minimalist sonic electric toothbrush featuring medical-grade silicone, charcoal-infused bristles, and a compact charging travel case.",
      priceRange: {
        minVariantPrice: {
          amount: '135.00',
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
            id: 'variant_medusa_pomabrush_black',
            title: 'Charcoal Black',
            price: '135.00',
            sku: 'PB-BLACK-01',
            availableForSale: true,
            quantityAvailable: 15,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_medusa_pomabrush_white',
            title: 'Cotton White',
            price: '135.00',
            sku: 'PB-WHITE-01',
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
      id: 'variant_medusa_pomafloss_901847102',
      title: 'Pomafloss',
      handle: 'pomafloss',
      description: 'A portable, compact water flosser designed for daily gum care and travel.',
      priceRange: {
        minVariantPrice: {
          amount: '39.00',
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
            id: 'variant_medusa_pomafloss_white',
            title: 'Cotton White',
            price: '39.00',
            sku: 'PF-WHITE-01',
            availableForSale: true,
            quantityAvailable: 20,
            selectedOptions: [{ name: 'Color', value: 'Cotton White' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomabru') {
    return {
      id: 'variant_medusa_pomabru_887711223',
      title: 'Pomabru',
      handle: 'pomabru',
      description: 'A compact, portable handheld travel espresso machine compatible with coffee capsules and ground coffee.',
      priceRange: {
        minVariantPrice: {
          amount: '135.00',
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
            id: 'variant_medusa_pomabru_black',
            title: 'Charcoal Black',
            price: '135.00',
            sku: 'PBRU-BLACK-01',
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
      id: 'variant_medusa_pbh_advanced',
      title: 'Pomabrush Heads – Advanced',
      handle: 'pomabrush-heads-advanced',
      description: 'Replacement brush heads engineered for deeper surface cleaning and plaque removal.',
      priceRange: {
        minVariantPrice: {
          amount: '25.00',
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
            id: 'variant_medusa_pbh_adv_black',
            title: 'Charcoal Black',
            price: '25.00',
            sku: 'PBH-ADV-BLACK',
            availableForSale: true,
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_medusa_pbh_adv_white',
            title: 'Cotton White',
            price: '25.00',
            sku: 'PBH-ADV-WHITE',
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
      id: 'variant_medusa_pbh_nylon_silicone',
      title: 'Pomabrush Heads – Nylon-Silicone',
      handle: 'pomabrush-heads-nylon-silicone',
      description: 'Hybrid replacement heads combining charcoal-infused nylon inner bristles with outer protective silicone loops.',
      priceRange: {
        minVariantPrice: {
          amount: '25.00',
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
            id: 'variant_medusa_pbh_nylon_black',
            title: 'Charcoal Black',
            price: '25.00',
            sku: 'PBH-NYLON-BLACK',
            availableForSale: true,
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_medusa_pbh_nylon_white',
            title: 'Cotton White',
            price: '25.00',
            sku: 'PBH-NYLON-WHITE',
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
      id: 'variant_medusa_pbh_pure_silicone',
      title: 'Pomabrush Heads – Pure Silicone',
      handle: handle,
      description: 'Ultra-gentle, all-silicone replacement heads tailored for sensitive teeth and gums.',
      priceRange: {
        minVariantPrice: {
          amount: '25.00',
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
            id: 'variant_medusa_pbh_sil_black',
            title: 'Charcoal Black',
            price: '25.00',
            sku: 'PBH-SIL-BLACK',
            availableForSale: true,
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
          },
          {
            id: 'variant_medusa_pbh_sil_white',
            title: 'Cotton White',
            price: '25.00',
            sku: 'PBH-SIL-WHITE',
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
      id: 'variant_medusa_pomaclip_1',
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
            id: 'variant_medusa_pomaclip_silver',
            title: 'Matte Silver',
            price: '19.00',
            sku: 'PCLIP-SILVER',
            availableForSale: true,
            quantityAvailable: 30,
            selectedOptions: [{ name: 'Color', value: 'Matte Silver' }],
          },
        ],
      },
    };
  }

  if (handle === 'pomacloth') {
    return {
      id: 'variant_medusa_pomacloth_1',
      title: 'Pomacloth',
      handle: 'pomacloth',
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
            id: 'variant_medusa_pomacloth_black',
            title: 'Charcoal Black',
            price: '12.00',
            sku: 'PCLOTH-BLACK',
            availableForSale: true,
            quantityAvailable: 50,
            selectedOptions: [{ name: 'Color', value: 'Charcoal Black' }],
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
    priceRange: { minVariantPrice: { amount: '25.00' } },
    images: { nodes: [{ url: '/assets/figma/accessory-1.png', altText: formattedTitle }] },
    variants: {
      nodes: [
        {
          id: `variant_medusa_mock_${handle}`,
          title: 'Standard',
          price: '25.00',
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
): Promise<{ accessToken?: string; expiresAt?: string; errors?: string[] }> {
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
  const { email, password } = input;
  const headers = getMedusaHeaders();

  try {
    // Try Medusa v2 /auth/customer/emailpass
    let res = await fetch(`${backendUrl}/auth/customer/emailpass`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // Fallback to /store/auth/token
      res = await fetch(`${backendUrl}/store/auth/token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      });
    }

    if (res.ok) {
      const data = await res.json();
      const token = data.token || data.access_token;
      if (token) {
        return {
          accessToken: token,
          expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('Medusa login API offline, using local session mock:', err);
  }

  const user = getMockCustomer(email);
  if (user && user.passwordHash === password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('poma_active_customer', JSON.stringify(user.customer));
    }
    const mockToken = `mock_token_${email}_${Date.now()}`;
    return { accessToken: mockToken, expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString() };
  }
  return { errors: ['Unidentified customer. Check your email and password.'] };
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
