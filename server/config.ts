import { z } from 'zod';

try {
  process.loadEnvFile();
} catch {
  // No .env file — rely on the process environment.
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  GEMINI_API_KEY: z.string().trim().optional(),
  GEMINI_MODEL: z.string().trim().min(1).default('gemini-4-hydrogen'),
});

const env = envSchema.parse(process.env);

export const config = {
  isProduction: env.NODE_ENV === 'production',
  port: env.PORT,
  gemini: {
    apiKey: env.GEMINI_API_KEY || undefined,
    model: env.GEMINI_MODEL,
  },
} as const;
