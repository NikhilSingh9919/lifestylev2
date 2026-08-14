import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: z
    .string()
    .min(1, 'Medusa Backend URL is required')
    .default('http://localhost:9000'),
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z
    .string()
    .optional()
    .default('pk_mock_medusa_key_12345'),
  // Backwards compatibility for existing Shopify fields
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN: z
    .string()
    .optional()
    .default('pomalifestyle.myshopify.com'),
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: z
    .string()
    .optional()
    .default('mock_storefront_token_poma_lifestyle_12345'),
});

const envResult = envSchema.safeParse({
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || undefined,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || undefined,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || undefined,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || undefined,
});

if (!envResult.success) {
  console.error('⚠️ Environment configuration failed validation:', envResult.error.format());
  throw new Error('Invalid environment configurations.');
}

export const env = envResult.data;

