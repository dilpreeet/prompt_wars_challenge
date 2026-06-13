import { analyzeJournalEntry, getFallbackAnalysis } from "@/lib/journal-analysis";
import { isGeminiConfigured } from "@/lib/gemini";
import { detectCrisis, formatHelplineMessage } from "@/lib/safety";
import { enforceRateLimit } from "@/lib/api-guard";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { journalCreateSchema } from "@/lib/validation";
import type { JournalAnalysis, JournalEntry } from "@/types";

export const runtime = "nodejs";

async function requireUser() {
  if (!isSupabaseConfigured) {
    return { error: Response.json({ error: "Supabase is not configured." }, { status: 503 }) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { supabase, user };
}

/** GET /api/journal — list recent journal entries for the signed-in user. */
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return Response.json({ error: "Failed to load entries" }, { status: 500 });
  }

  return Response.json({ entries: data as JournalEntry[] });
}

/** POST /api/journal — save entry and run Gemini analysis (falls back gracefully). */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  const rateLimited = enforceRateLimit(user.id, "journal");
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = journalCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { content, mood_score } = parsed.data;
  const crisis = detectCrisis(content);

  let ai_analysis: JournalAnalysis;
  let moodScore = mood_score ?? null;
  let usedFallback = false;

  if (isGeminiConfigured) {
    try {
      const analysis = await analyzeJournalEntry(content);
      ai_analysis = analysis;
      moodScore = mood_score ?? analysis.moodScore;
    } catch {
      // Gemini unavailable or returned bad data — use keyword fallback so the
      // entry is always saved with useful analysis rather than blocking the user.
      ai_analysis = getFallbackAnalysis(content);
      moodScore = mood_score ?? ai_analysis.moodScore;
      usedFallback = true;
    }
  } else {
    // Demo / no-key mode: offline keyword analysis keeps the app fully usable.
    ai_analysis = getFallbackAnalysis(content);
    moodScore = mood_score ?? ai_analysis.moodScore;
    usedFallback = true;
  }

  if (crisis.isCrisis) {
    ai_analysis = {
      ...ai_analysis,
      suggestion: `${formatHelplineMessage()}\n\n${ai_analysis.suggestion}`,
    };
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: user.id,
      content,
      mood_score: moodScore,
      ai_analysis,
    })
    .select("*")
    .single();

  if (error || !data) {
    return Response.json({ error: "Failed to save entry" }, { status: 500 });
  }

  return Response.json({
    entry: data as JournalEntry,
    crisis: crisis.isCrisis,
    analysisSource: usedFallback ? "fallback" : "gemini",
  });
}
