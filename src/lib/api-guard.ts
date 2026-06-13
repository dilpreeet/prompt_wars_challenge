import { checkRateLimit } from "@/lib/rate-limit";

const CHAT_LIMIT = 20;
const CHAT_WINDOW_MS = 60_000;
const TTS_LIMIT = 10;
const TTS_WINDOW_MS = 60_000;
const JOURNAL_LIMIT = 10;
const JOURNAL_WINDOW_MS = 60_000;

/** Applies per-user rate limiting; returns a 429 Response or null if allowed. */
export function enforceRateLimit(
  userId: string,
  route: "chat" | "tts" | "journal",
): Response | null {
  const limit =
    route === "chat" ? CHAT_LIMIT : route === "journal" ? JOURNAL_LIMIT : TTS_LIMIT;
  const windowMs =
    route === "chat"
      ? CHAT_WINDOW_MS
      : route === "journal"
        ? JOURNAL_WINDOW_MS
        : TTS_WINDOW_MS;
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

/** Fallback key when auth is unavailable (should not happen on protected routes). */
export function clientIpKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
