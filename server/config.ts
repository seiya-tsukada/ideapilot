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
  /** `mock` returns canned results without calling Gemini. Defaults to `gemini` when a key is set. */
  AI_BACKEND: z.enum(['gemini', 'mock']).optional(),
});

const env = envSchema.parse(process.env);

export const config = {
  isProduction: env.NODE_ENV === 'production',
  port: env.PORT,
  aiBackend: env.AI_BACKEND ?? (env.GEMINI_API_KEY ? 'gemini' : 'mock'),
  gemini: {
    apiKey: env.GEMINI_API_KEY || undefined,
    model: env.GEMINI_MODEL,
  },
} as const;
