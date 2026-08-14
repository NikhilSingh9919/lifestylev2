'use client';

import { useState, useEffect } from 'react';
import {
  MedusaProduct,
  mockInventoryStore,
  fetchMedusaProductByHandle,
} from '@/lib/medusa';

export function useMedusaProduct(handle: string) {
  const [product, setProduct] = useState<MedusaProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryQty, setInventoryQty] = useState<number>(() => mockInventoryStore.get(handle));

  useEffect(() => {
    const unsubscribe = mockInventoryStore.subscribe(() => {
      setInventoryQty(mockInventoryStore.get(handle));
    });

    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        const fetchedProduct = await fetchMedusaProductByHandle(handle);
        if (active) {
          if (fetchedProduct) {
            setProduct(fetchedProduct);
          } else {
            setError('Product not found in Medusa');
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to fetch product from Medusa');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

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
          nodes: product.variants.nodes.map((v) => ({
            ...v,
            quantityAvailable: inventoryQty,
            availableForSale: inventoryQty > 0,
          })),
        },
      }
    : null;

  const isOutOfStock = activeProduct
    ? activeProduct.variants.nodes.every((v) => !v.availableForSale)
    : false;

  return { product: activeProduct, loading, error, isOutOfStock };
}
