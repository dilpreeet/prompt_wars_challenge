import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { moodLogSchema } from "@/lib/validation";
import type { MoodLog } from "@/types";

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

/** GET /api/mood — recent mood logs for the signed-in user. */
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(14);

  if (error) {
    return Response.json({ error: "Failed to load mood logs" }, { status: 500 });
  }

  return Response.json({ logs: data as MoodLog[] });
}

/** POST /api/mood — log today's mood. */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = moodLogSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("mood_logs")
    .insert({
      user_id: user.id,
      ...parsed.data,
    })
    .select("*")
    .single();

  if (error || !data) {
    return Response.json({ error: "Failed to save mood log" }, { status: 500 });
  }

  return Response.json({ log: data as MoodLog });
}
