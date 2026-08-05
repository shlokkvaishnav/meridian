import { z } from 'zod';

/**
 * Environment variable schema — only require what the app actually uses.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    ANTHROPIC_API_KEY: z.string().optional(),
    // Required in production — protects the cron and webhook endpoints from
    // running unauthenticated. Optional in dev for local testing convenience.
    CRON_SECRET: z.string().min(16, 'CRON_SECRET must be at least 16 characters').optional(),
    GITHUB_WEBHOOK_SECRET: z
      .string()
      .min(16, 'GITHUB_WEBHOOK_SECRET must be at least 16 characters')
      .optional(),
    // Optional — only used for realtime dashboard updates; feature degrades
    // gracefully when unset.
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'production') return;

    if (!data.CRON_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CRON_SECRET'],
        message: 'CRON_SECRET is required in production to protect /api/cron/sync',
      });
    }
    if (!data.GITHUB_WEBHOOK_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GITHUB_WEBHOOK_SECRET'],
        message: 'GITHUB_WEBHOOK_SECRET is required in production to protect /api/webhooks/github',
      });
    }
  });

const getEnv = () => {
  // Skip validation during build
  if (process.env.SKIP_ENV_VALIDATION || process.env.npm_lifecycle_event === 'build') {
    return {
      NODE_ENV: 'production' as const,
      DATABASE_URL: 'postgresql://localhost/meridian',
      ENCRYPTION_KEY: '0'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    } as z.infer<typeof envSchema>;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    throw new Error('Invalid environment variables');
  }

  return result.data;
};

export const env = getEnv();
export type Env = z.infer<typeof envSchema>;
