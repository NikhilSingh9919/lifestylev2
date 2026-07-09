import { env } from '@/config/env';

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  sku: string;
  availableForSale: boolean;
  quantityAvailable: number;
}

export interface ShopifyProduct {
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

export function getMockProduct(handle: string): ShopifyProduct | null {
  if (handle === 'pomabrush-hero' || handle === 'pomabrush') {
    return {
      id: 'gid://shopify/ProductVariant/421389028',
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
            id: 'gid://shopify/ProductVariant/421389028',
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
      id: 'gid://shopify/ProductVariant/901847102',
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
            id: 'gid://shopify/ProductVariant/901847102',
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
      id: 'gid://shopify/ProductVariant/887711223',
      title: 'pomabru espresso maker',
      handle: 'pomabru',
      description: 'From early flights to quiet mountain mornings, it reimagines the ritual of espresso for modern travel-combining convenience, precision, and the pleasure of a perfect cup, wherever you go.',
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
            id: 'gid://shopify/ProductVariant/887711223',
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
      id: 'gid://shopify/ProductVariant/774433991',
      title: 'pomabrush advanced brush heads - pack of 4',
      handle: 'pomaaccessoris',
      description: 'Engineered to perform beautifully, the pomabrush combines advanced sonic technology with sleek, travel-ready design.',
      priceRange: {
        minVariantPrice: {
          amount: '135.00',
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
            id: 'gid://shopify/ProductVariant/774433991',
            title: 'Carbon Brush Heads',
            price: '135.00',
            sku: 'PB-ACC-01',
            availableForSale: true,
            quantityAvailable: 50,
          },
        ],
      },
    };
  }

  return null;
}

export async function generateCheckoutLink(
  lineItems: Array<{ variantId: string; quantity: number }>
): Promise<string> {
  const domain = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN;
  
  if (env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN.startsWith('mock_')) {
    const cartParts = lineItems.map((item) => `${extractVariantId(item.variantId)}:${item.quantity}`).join(',');
    return `https://${domain}/cart/${cartParts}`;
  }

  try {
    const query = `
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            webUrl
          }
          checkoutUserErrors {
            message
          }
        }
      }
    `;

    const input = {
      lineItems: lineItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables: { input } }),
    });

    if (!res.ok) throw new Error(`HTTP checkout error: ${res.status}`);
    const json = await res.json();
    const webUrl = json.data?.checkoutCreate?.checkout?.webUrl;
    if (webUrl) return webUrl;

    throw new Error('GraphQL checkout creation empty response');
  } catch (err) {
    console.warn('Checkout API failed, falling back to permalink:', err);
    const cartParts = lineItems.map((item) => `${extractVariantId(item.variantId)}:${item.quantity}`).join(',');
    return `https://${domain}/cart/${cartParts}`;
  }
}

function extractVariantId(variantId: string): string {
  const matches = variantId.match(/ProductVariant\/(\d+)/);
  if (matches && matches[1]) {
    return matches[1];
  }
  return variantId.replace('gid://shopify/ProductVariant/', '');
}
