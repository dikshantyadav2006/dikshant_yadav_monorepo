import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default('dikshant_yadav_blog_secret_key_change_me_in_prod'),
  COOKIE_DOMAIN: z.string().default('.dikshantyadav.in'),
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// Allow parsing fallback for local environment checks if not completely populated
export const env = envSchema.parse({
  ...process.env,
  // Fallbacks if not defined, to prevent startup crashes in development
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dikshant_db?schema=public',
});
