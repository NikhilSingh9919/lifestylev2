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
  if (handle === 'pomabrush-hero') {
    return {
      id: 'gid://shopify/ProductVariant/421389028', // Mock Shopify Variant ID
      title: 'PomaBrush Sonic Toothbrush',
      handle: 'pomabrush-hero',
      description: 'Sleek, lightweight, and ultra-quiet sonic toothbrush. Up to 4 months of battery life on a single charge. Finished in premium anodized aluminum.',
      priceRange: {
        minVariantPrice: {
          amount: '79.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/products/pomabrush-hero.png',
            altText: 'PomaBrush Sonic Toothbrush',
          },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'gid://shopify/ProductVariant/421389028',
            title: 'Charcoal Black',
            price: '79.00',
            sku: 'PB-BLACK-01',
            availableForSale: true,
            quantityAvailable: 15,
          },
        ],
      },
    };
  }

  if (handle === 'pomafloss-floating') {
    return {
      id: 'gid://shopify/ProductVariant/901847102', // Mock Shopify Variant ID
      title: 'PomaFloss Floating Dispenser',
      handle: 'pomafloss-floating',
      description: 'Magnetic wall-mount dental floss dispenser. Weightless aesthetic, clean storage, and premium organic expanding floss.',
      priceRange: {
        minVariantPrice: {
          amount: '19.00',
        },
      },
      images: {
        nodes: [
          {
            url: '/assets/products/pomafloss-floating.png',
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
            sku: 'PF-GOLD-01',
            availableForSale: true,
            quantityAvailable: 8,
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
