import { analyzeJournalEntry } from "@/lib/journal-analysis";
import { formatGeminiError, isGeminiConfigured } from "@/lib/gemini";
import { detectCrisis, formatHelplineMessage } from "@/lib/safety";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { journalCreateSchema } from "@/lib/validation";
import type { JournalEntry } from "@/types";

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

/** POST /api/journal — save entry and run Gemini analysis. */
export async function POST(request: Request) {
  if (!isGeminiConfigured) {
    return Response.json(
      { error: "Gemini API is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY." },
      { status: 503 },
    );
  }

  const auth = await requireUser();
  if ("error" in auth) return auth.error;

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

  const { supabase, user } = auth;

  let ai_analysis = null;
  let moodScore = mood_score ?? null;

  try {
    const analysis = await analyzeJournalEntry(content);
    ai_analysis = analysis;
    moodScore = mood_score ?? analysis.moodScore;

    if (crisis.isCrisis) {
      ai_analysis = {
        ...analysis,
        suggestion: `${formatHelplineMessage()}\n\n${analysis.suggestion}`,
      };
    }
  } catch (error) {
    return Response.json(
      { error: formatGeminiError(error) },
      { status: 502 },
    );
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

  return Response.json({ entry: data as JournalEntry, crisis: crisis.isCrisis });
}
