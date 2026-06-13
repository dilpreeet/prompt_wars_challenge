import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimitsForTests } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
  });

  it("allows requests under the limit", () => {
    const first = checkRateLimit("user-1", 3, 60_000);
    const second = checkRateLimit("user-1", 3, 60_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks requests over the limit", () => {
    checkRateLimit("user-2", 2, 60_000);
    checkRateLimit("user-2", 2, 60_000);
    const blocked = checkRateLimit("user-2", 2, 60_000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    checkRateLimit("a", 1, 60_000);
    const blockedA = checkRateLimit("a", 1, 60_000);
    const allowedB = checkRateLimit("b", 1, 60_000);

    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });
});
