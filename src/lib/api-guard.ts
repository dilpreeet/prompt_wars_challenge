import { checkRateLimit } from "@/lib/rate-limit";

const LIMITS: Record<string, { limit: number; windowMs: number }> = {
  chat:    { limit: 20, windowMs: 60_000 },
  journal: { limit: 10, windowMs: 60_000 },
  tts:     { limit: 10, windowMs: 60_000 },
  mood:    { limit: 30, windowMs: 60_000 },
};

/** Applies per-user rate limiting; returns a 429 Response or null if allowed. */
export function enforceRateLimit(
  userId: string,
  route: "chat" | "tts" | "journal" | "mood",
): Response | null {
  const { limit, windowMs } = LIMITS[route]!;
  const result = checkRateLimit(`${route}:${userId}`, limit, windowMs);

  if (result.allowed) return null;

  return Response.json(
    {
      error: "Too many requests. Please wait before trying again.",
      retryAfterSec: result.retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSec ?? 60),
      },
    },
  );
}
