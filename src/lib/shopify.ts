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

// In-memory mock customer database for Sandbox/Mock mode
const mockCustomers: Record<string, { customer: Customer; passwordHash: string }> = {
  'test@example.com': {
    customer: {
      id: 'gid://shopify/Customer/123456789',
      firstName: 'Nikhil',
      lastName: 'Singh',
      email: 'test@example.com',
      phone: '+1 (555) 019-2834',
      defaultAddress: {
        id: 'gid://shopify/MailingAddress/12345',
        address1: '123 Premium Lane',
        address2: 'Apt 4B',
        city: 'New York',
        province: 'NY',
        zip: '10001',
        country: 'United States',
      },
      orders: [
        {
          id: 'gid://shopify/Order/1111',
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
        {
          id: 'gid://shopify/Order/2222',
          orderNumber: 1002,
          processedAt: '2026-07-11T02:15:00Z',
          financialStatus: 'PAID',
          fulfillmentStatus: 'UNFULFILLED',
          totalPrice: { amount: '19.00', currencyCode: 'USD' },
          lineItems: [
            {
              title: 'pomafloss (Satin Gold)',
              quantity: 1,
              imageUrl: '/assets/figma/lineup-pomafloss.png',
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
  const domain = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN;
  if (env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN.startsWith('mock_')) {
    const { email, password, firstName, lastName } = input;
    if (mockCustomers[email]) {
      return { errors: ['An account with this email address already exists.'] };
    }
    const id = `gid://shopify/Customer/${Math.floor(Math.random() * 100000000)}`;
    mockCustomers[email] = {
      customer: {
        id,
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        orders: [],
      },
      passwordHash: password,
    };
    return { customer: { id, email } };
  }

  try {
    const query = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables: { input } }),
    });

    if (!res.ok) throw new Error(`HTTP registration error: ${res.status}`);
    const json = await res.json();
    if (json.errors) return { errors: json.errors.map((e: any) => e.message) };

    const errors = json.data?.customerCreate?.customerUserErrors || [];
    if (errors.length > 0) {
      return { errors: errors.map((e: any) => e.message) };
    }

    return { customer: json.data?.customerCreate?.customer };
  } catch (err: any) {
    console.warn('Shopify Registration API failed, falling back to mock registration:', err);
    const { email, password, firstName, lastName } = input;
    if (mockCustomers[email]) {
      return { errors: ['An account with this email address already exists.'] };
    }
    const id = `gid://shopify/Customer/${Math.floor(Math.random() * 100000000)}`;
    mockCustomers[email] = {
      customer: {
        id,
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        orders: [],
      },
      passwordHash: password,
    };
    return { customer: { id, email } };
  }
}

export async function shopifyLogin(
  input: any
): Promise<{ accessToken?: string; expiresAt?: string; errors?: string[] }> {
  const domain = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN;
  if (env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN.startsWith('mock_')) {
    const { email, password } = input;
    const user = mockCustomers[email];
    if (user && user.passwordHash === password) {
      const mockToken = `mock_token_${email}_${Date.now()}`;
      return { accessToken: mockToken, expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString() };
    }
    return { errors: ['Unidentified customer. Check your email and password.'] };
  }

  try {
    const query = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables: { input } }),
    });

    if (!res.ok) throw new Error(`HTTP login error: ${res.status}`);
    const json = await res.json();
    if (json.errors) return { errors: json.errors.map((e: any) => e.message) };

    const errors = json.data?.customerAccessTokenCreate?.customerUserErrors || [];
    if (errors.length > 0) {
      return { errors: errors.map((e: any) => e.message) };
    }

    const customerAccessToken = json.data?.customerAccessTokenCreate?.customerAccessToken;
    if (customerAccessToken) {
      return { accessToken: customerAccessToken.accessToken, expiresAt: customerAccessToken.expiresAt };
    }
    return { errors: ['Failed to retrieve login session.'] };
  } catch (err: any) {
    console.warn('Shopify Login API failed, falling back to mock login:', err);
    const { email, password } = input;
    const user = mockCustomers[email];
    if (user && user.passwordHash === password) {
      const mockToken = `mock_token_${email}_${Date.now()}`;
      return { accessToken: mockToken, expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString() };
    }
    return { errors: ['Unidentified customer. Check your email and password.'] };
  }
}

export async function shopifyGetCustomer(
  accessToken: string
): Promise<{ customer?: Customer; errors?: string[] }> {
  const domain = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN;
  if (accessToken.startsWith('mock_token_')) {
    const parts = accessToken.split('_');
    const email = parts[2];
    const user = mockCustomers[email];
    if (user) {
      return { customer: user.customer };
    }
    return { errors: ['Session not found or expired.'] };
  }

  try {
    const query = `
      query getCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          firstName
          lastName
          email
          phone
          defaultAddress {
            id
            address1
            address2
            city
            province
            zip
            country
          }
          orders(first: 10) {
            edges {
              node {
                id
                orderNumber
                processedAt
                financialStatus
                fulfillmentStatus
                totalPrice {
                  amount
                  currencyCode
                }
                lineItems(first: 5) {
                  edges {
                    node {
                      title
                      quantity
                      variant {
                        image {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables: { customerAccessToken: accessToken } }),
    });

    if (!res.ok) throw new Error(`HTTP fetch customer profile error: ${res.status}`);
    const json = await res.json();
    if (json.errors) return { errors: json.errors.map((e: any) => e.message) };

    const customerData = json.data?.customer;
    if (!customerData) {
      return { errors: ['Customer details not found.'] };
    }

    const customer: Customer = {
      id: customerData.id,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      defaultAddress: customerData.defaultAddress,
      orders: customerData.orders?.edges?.map((edge: any) => {
        const order = edge.node;
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          processedAt: order.processedAt,
          financialStatus: order.financialStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          totalPrice: {
            amount: order.totalPrice.amount,
            currencyCode: order.totalPrice.currencyCode,
          },
          lineItems: order.lineItems?.edges?.map((lineEdge: any) => {
            const line = lineEdge.node;
            return {
              title: line.title,
              quantity: line.quantity,
              imageUrl: line.variant?.image?.url || undefined,
            };
          }),
        };
      }) || [],
    };

    return { customer };
  } catch (err: any) {
    console.warn('Shopify Profile Fetch API failed, falling back to mock profile:', err);
    const parts = accessToken.split('_');
    const email = parts[2];
    const user = mockCustomers[email];
    if (user) {
      return { customer: user.customer };
    }
    return { errors: ['Session not found or expired.'] };
  }
}

export async function shopifyLogout(
  accessToken: string
): Promise<{ deletedAccessToken?: string; errors?: string[] }> {
  const domain = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN;
  if (accessToken.startsWith('mock_token_')) {
    return { deletedAccessToken: accessToken };
  }

  try {
    const query = `
      mutation customerAccessTokenDelete($customerAccessToken: String!) {
        customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
          deletedAccessToken
          deletedCustomerAccessTokenId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables: { customerAccessToken: accessToken } }),
    });

    if (!res.ok) throw new Error(`HTTP logout error: ${res.status}`);
    const json = await res.json();
    if (json.errors) return { errors: json.errors.map((e: any) => e.message) };

    const errors = json.data?.customerAccessTokenDelete?.userErrors || [];
    if (errors.length > 0) {
      return { errors: errors.map((e: any) => e.message) };
    }

    return { deletedAccessToken: json.data?.customerAccessTokenDelete?.deletedAccessToken };
  } catch (err: any) {
    console.warn('Shopify Logout API failed, falling back to mock logout:', err);
    return { deletedAccessToken: accessToken };
  }
}

