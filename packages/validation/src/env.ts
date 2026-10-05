import { z } from 'zod';

export const webEnvSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1, 'TURSO_DATABASE_URL is required'),
  TURSO_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const botEnvSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1, 'TURSO_DATABASE_URL is required'),
  TURSO_AUTH_TOKEN: z.string().optional(),
  DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
  DISCORD_GUILD_ID: z.string().min(1, 'DISCORD_GUILD_ID is required'),
  SYNC_INTERVAL: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return 43200000;
      return typeof val === 'number' ? val : parseInt(val, 10);
    })
    .refine((val) => Number.isFinite(val) && val > 0, {
      message: 'SYNC_INTERVAL must be a positive finite number of milliseconds',
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export type WebEnv = z.infer<typeof webEnvSchema>;
export type BotEnv = z.infer<typeof botEnvSchema>;

export function validateBotEnv(env: Record<string, unknown> = process.env): BotEnv {
  const parsed = botEnvSchema.safeParse(env);
  if (!parsed.success) {
    const invalidFields = parsed.error.issues
      .map((issue) => issue.path.join('.') || 'root')
      .filter((v, idx, arr) => arr.indexOf(v) === idx);
    throw new Error(
      `Bot startup configuration error: invalid or missing environment variables [${invalidFields.join(', ')}]`
    );
  }
  return parsed.data;
}

export function validateWebEnv(env: Record<string, unknown> = process.env): WebEnv {
  const parsed = webEnvSchema.safeParse(env);
  if (!parsed.success) {
    const invalidFields = parsed.error.issues
      .map((issue) => issue.path.join('.') || 'root')
      .filter((v, idx, arr) => arr.indexOf(v) === idx);
    throw new Error(
      `Web startup configuration error: invalid or missing environment variables [${invalidFields.join(', ')}]`
    );
  }
  return parsed.data;
}
