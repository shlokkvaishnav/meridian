/**
 * In-memory sliding-window rate limiter.
 *
 * Deliberately dependency-free rather than pulling in Redis/Upstash for a
 * single rate-limit check. Real limitation: on Vercel serverless, each
 * function instance has its own memory, so the limit is per-instance, not
 * global, and resets on cold start. Still meaningfully raises the bar
 * against basic abuse (credential stuffing on /api/auth/setup, hammering
 * the AI/sync endpoints) within a warm instance's lifetime. If this needs
 * to be a hard global limit, swap the Map below for Upstash Redis.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

// Prevent unbounded memory growth from one-off callers.
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      buckets.clear();
    }
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Best-effort client identifier from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
