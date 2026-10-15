import { z } from 'zod';

export const envSchema = z.object({
  // App
  APP_NAME: z.string().default('TaskFlow'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  API_PREFIX: z.string().default('api'),

  // Database
  DATABASE_URL: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Redis (supports standard local envs and Railway Redis envs)
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_PRIVATE_URL: z.string().optional(),
  REDISHOST: z.string().optional(),
  REDISPORT: z.coerce.number().optional(),
  REDISPASSWORD: z.string().optional(),
  REDISUSER: z.string().optional(),

  // Email / Brevo API
  BREVO_API_KEY: z.string().optional(),
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  MAIL_SECURE: z.coerce.boolean().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.coerce.boolean().optional(),
});

export function validate(config: Record<string, unknown>) {
  return envSchema.parse(config);
}

export type Env = z.infer<typeof envSchema>;
