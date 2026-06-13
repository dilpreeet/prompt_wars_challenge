interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
  remaining: number;
}

/**
 * Simple in-memory per-key rate limiter for API routes.
 * Resets on cold starts (serverless) — good enough for hackathon/demo guard.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

/** Clears all buckets — exposed for unit tests only. */
export function resetRateLimitsForTests(): void {
  buckets.clear();
}
