// Fixed-window limiter kept in process memory. It is enough for a single
// server instance; a multi-instance deployment would need a shared store (e.g. Redis).
type Bucket = { count: number; resetAt: number };

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();

  return {
    /** Records one attempt and reports whether it is allowed. */
    hit(key: string, now = Date.now()) {
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
      }
      bucket.count += 1;
      const allowed = bucket.count <= limit;
      return {
        allowed,
        remaining: Math.max(0, limit - bucket.count),
        retryAfterMs: allowed ? 0 : bucket.resetAt - now,
      };
    },
    reset(key: string) {
      buckets.delete(key);
    },
  };
}

/** At most 5 sign-in attempts per 15 minutes for each email + IP pair; a success clears the counter. */
export const loginLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });
