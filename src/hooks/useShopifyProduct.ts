'use client';

import { useState, useEffect } from 'react';
import { env } from '@/config/env';
import {
  ShopifyProduct,
  mockInventoryStore,
  getMockProduct,
} from '@/lib/shopify';

export function useShopifyProduct(handle: string) {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryQty, setInventoryQty] = useState<number>(() => mockInventoryStore.get(handle));

  useEffect(() => {
    const unsubscribe = mockInventoryStore.subscribe(() => {
      setInventoryQty(mockInventoryStore.get(handle));
    });

    let active = true;

    async function fetchProduct() {
      try {
        setLoading(true);
        if (env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN.startsWith('mock_')) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (!active) return;

          const mockProduct = getMockProduct(handle);
          if (mockProduct) {
            setProduct(mockProduct);
          } else {
            setError('Product not found');
          }
          setLoading(false);
          return;
        }

        const query = `
          query getProductByHandle($handle: String!) {
            product(handle: $handle) {
              id
              title
              handle
              description
              tags
              priceRange {
                minVariantPrice {
                  amount
                }
              }
              images(first: 10) {
                nodes {
                  url
                  altText
                }
              }
              variants(first: 100) {
                nodes {
                  id
                  title
                  price {
                    amount
                  }
                  sku
                  availableForSale
                  quantityAvailable
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                  }
                }
              }
              metafields(identifiers: [
                {namespace: "custom", key: "key_features"},
                {namespace: "custom", key: "additional_information"},
                {namespace: "custom", key: "poma_policies"},
                {namespace: "custom", key: "inside_the_box"},
                {namespace: "custom", key: "compatible_with"},
                {namespace: "custom", key: "shipping"},
                {namespace: "custom", key: "product_description"},
                {namespace: "custom", key: "warranty"},
                {namespace: "custom", key: "promo_video"}
              ]) {
                key
                value
                reference {
                  ... on Video {
                    sources {
                      url
                      mimeType
                    }
                  }
                }
              }
            }
          }
        `;

        const res = await fetch(`https://${env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
          },
          body: JSON.stringify({ query, variables: { handle } }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors[0].message);
        }

        const fetchedProduct = json.data?.product;
        if (!fetchedProduct) {
          throw new Error('Product not found in Shopify Storefront API');
        }

        if (active) {
          const adaptedProduct: ShopifyProduct = {
            id: fetchedProduct.id,
            title: fetchedProduct.title,
            handle: fetchedProduct.handle,
            description: fetchedProduct.description,
            priceRange: fetchedProduct.priceRange,
            images: fetchedProduct.images,
            tags: fetchedProduct.tags,
            variants: {
              nodes: fetchedProduct.variants.nodes.map((v: any) => ({
                id: v.id,
                title: v.title,
                price: v.price.amount,
                sku: v.sku || 'MOCK-SKU',
                availableForSale: v.availableForSale,
                quantityAvailable: v.quantityAvailable ?? 10,
                selectedOptions: v.selectedOptions,
                image: v.image,
              })),
            },
            metafields: fetchedProduct.metafields,
          };
          setProduct(adaptedProduct);
        }
      } catch (err: any) {
        console.warn('Shopify live API failed, falling back to mock product:', err.message);
        if (active) {
          const mockProduct = getMockProduct(handle);
          if (mockProduct) {
            setProduct(mockProduct);
          } else {
            setError(err.message || 'Failed to fetch product');
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [handle]);

  const activeProduct = product
    ? {
        ...product,
        variants: {
          ...product.variants,
          nodes: product.variants.nodes.map((v) => {
            const isMockMode = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN.startsWith('mock_');
            return {
              ...v,
              quantityAvailable: isMockMode ? inventoryQty : v.quantityAvailable,
              availableForSale: isMockMode ? (inventoryQty > 0) : v.availableForSale,
            };
          }),
        },
      }
    : null;

  const isOutOfStock = activeProduct
    ? activeProduct.variants.nodes.every((v) => !v.availableForSale)
    : false;

  return { product: activeProduct, loading, error, isOutOfStock };
}
