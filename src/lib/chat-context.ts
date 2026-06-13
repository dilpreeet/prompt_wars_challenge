import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatContext } from "@/lib/prompts";

/** Loads recent mood logs and journal snippets for chat personalization. */
export async function loadChatContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<ChatContext> {
  const [moodsResult, journalsResult] = await Promise.all([
    supabase
      .from("mood_logs")
      .select("mood, energy, stress, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("journal_entries")
      .select("content, mood_score, ai_analysis, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return {
    recentMoods: moodsResult.data ?? undefined,
    recentJournals: journalsResult.data ?? undefined,
  };
}
