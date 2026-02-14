import { z } from 'zod';

/**
 * Environment variable schema — only require what the app actually uses.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  ANTHROPIC_API_KEY: z.string().optional(),
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
