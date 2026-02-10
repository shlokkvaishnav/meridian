import { z } from 'zod';

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // Encryption
  ENCRYPTION_KEY: z.string().min(32),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // GitHub App (Optional)
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  
  // Anthropic AI
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // App configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Cron authentication
  CRON_SECRET: z.string().min(16).optional(),
  
  // Observability (Optional)
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

/**
 * Validated environment variables
 * Throws an error on app startup if required variables are missing
 * SAFELY HANDLES BUILD TIME: Returns mock values if validation fails during build
 */
const getEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    // Check if we are in a build environment (Vercel builds set CI=1)
    // or if we are just running `next build` locally
    const isBuild = process.env.npm_lifecycle_event === 'build' || 
                    process.env.CI === '1' || 
                    process.env.NEXT_PHASE === 'phase-production-build';
    
    if (isBuild) {
      console.warn('⚠️  Build environment detected. Skipping strict env validation.');
      // Return a mock object that satisfies the schema schema types but contains dummy values
      // This allows the build to proceed (e.g. static generation) without crashing
      return {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/meridian',
        ENCRYPTION_KEY: '0'.repeat(32),
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-key',
        SUPABASE_SERVICE_ROLE_KEY: 'mock-key',
        // Optional fields don't need to be mocked
      } as z.infer<typeof envSchema>;
    }
    
    // In runtime, we want to crash if env vars are missing
    throw error;
  }
};

export const env = getEnv();

export type Env = z.infer<typeof envSchema>;
