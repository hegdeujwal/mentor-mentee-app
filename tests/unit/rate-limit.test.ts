import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("blocks attempts beyond the limit inside the window", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect([1, 2, 3].map(() => limiter.hit("k", 0).allowed)).toEqual([true, true, true]);
    const blocked = limiter.hit("k", 10);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(990);
  });

  it("opens again after the window expires", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.hit("k", 0);
    expect(limiter.hit("k", 500).allowed).toBe(false);
    expect(limiter.hit("k", 1000).allowed).toBe(true);
  });

  it("tracks keys separately and can be reset", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.hit("a", 0);
    expect(limiter.hit("b", 0).allowed).toBe(true);
    limiter.reset("a");
    expect(limiter.hit("a", 1).allowed).toBe(true);
  });
});
