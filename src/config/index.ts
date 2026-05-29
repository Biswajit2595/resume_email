import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.coerce.number().default(4000),

  BASE_URL: z.string().url().default('http://localhost:4000'),

  MONGODB_URI: z.string().min(1),

  GEMINI_API_KEY: z.string().min(1),
  GEMINI_API_URL: z.string().url(),
  GROQ_API_KEY: z.string().min(1),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1),
  R2_API_TOKEN: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),

  REQUESTS_PER_MINUTE: z.coerce.number().default(60),

  SENTRY_DSN: z.string().optional(),
});

// New modifications
export const config = {
  groq: {
    apiKey:       process.env.GROQ_API_KEY!,
    model:        "llama-3.3-70b-versatile",
    modelVersion: "llama-3.3-70b-versatile@v1",
    maxChars:     12000,
    maxRetries:   2,
  },
  resume: {
    maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["application/pdf", "application/msword",
                       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  },
} as const;

export const env = envSchema.parse(process.env);
