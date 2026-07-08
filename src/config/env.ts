import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN: z
    .string()
    .min(1, 'Shopify Storefront Domain is required')
    .default('pomalifestyle.myshopify.com'),
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: z
    .string()
    .min(1, 'Shopify Storefront Access Token is required')
    .default('mock_storefront_token_poma_lifestyle_12345'),
});

const envResult = envSchema.safeParse({
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || undefined,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || undefined,
});

if (!envResult.success) {
  console.error('⚠️ Shopify Environment configuration failed validation:', envResult.error.format());
  throw new Error('Invalid Shopify storefront environment configurations.');
}

export const env = envResult.data;
