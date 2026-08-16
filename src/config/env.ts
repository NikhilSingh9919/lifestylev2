import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: z
    .string()
    .min(1, 'Medusa Backend URL is required')
    .default('http://localhost:9000'),
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z
    .string()
    .optional()
    .default('pk_659d8e4863ae8e42500da9365796d43bb13c5a33b937ac0a6945ade6579ddd71'),
  NEXT_PUBLIC_STRIPE_KEY: z
    .string()
    .optional()
    .default('pk_test_51PomaLifestylePlaceholderStripePubKeyForTesting1234567890'),
});

const envResult = envSchema.safeParse({
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || undefined,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || undefined,
  NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY || undefined,
});

if (!envResult.success) {
  console.error('⚠️ Environment configuration failed validation:', envResult.error.format());
  throw new Error('Invalid environment configurations.');
}

export const env = envResult.data;

