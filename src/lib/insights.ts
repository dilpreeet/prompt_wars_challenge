import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  InsightsData,
  JournalAnalysis,
  JournalEntry,
  MoodLog,
  StressTrend,
  TriggerCount,
} from "@/types";

/** Exported for unit-testing. */
export function aggregateTriggers(entries: JournalEntry[]): TriggerCount[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const analysis = entry.ai_analysis as JournalAnalysis | null;
    if (!analysis?.stressTriggers) continue;

    for (const trigger of analysis.stressTriggers) {
      const key = trigger.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([trigger, count]) => ({
      trigger: trigger.charAt(0).toUpperCase() + trigger.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

/** Aggregates emotion frequencies across journal entries. Exported for unit-testing. */
export function aggregateEmotions(entries: JournalEntry[]): TriggerCount[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const analysis = entry.ai_analysis as JournalAnalysis | null;
    if (!analysis?.emotions) continue;

    for (const emotion of analysis.emotions) {
      const key = emotion.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([trigger, count]) => ({
      trigger: trigger.charAt(0).toUpperCase() + trigger.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

/** Aggregates mood trends and journal triggers for the dashboard. */
export async function getInsights(
  supabase: SupabaseClient,
  userId: string,
): Promise<InsightsData> {
  const [moodsResult, journalsResult] = await Promise.all([
    supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(14),
    supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const moods = (moodsResult.data ?? []) as MoodLog[];
  const journals = (journalsResult.data ?? []) as JournalEntry[];

  const moodTrend = moods.map((log) => ({
    date: log.created_at,
    mood: log.mood,
    energy: log.energy,
    stress: log.stress,
  }));

  const moodScores = journals
    .map((j) => j.mood_score ?? j.ai_analysis?.moodScore ?? null)
    .filter((s): s is number => s != null);

  const averageMoodScore =
    moodScores.length > 0
      ? Math.round(
          (moodScores.reduce((sum, s) => sum + s, 0) / moodScores.length) * 10,
        ) / 10
      : null;

  const latestSuggestion =
    journals.find((j) => j.ai_analysis?.suggestion)?.ai_analysis?.suggestion ??
    null;

  const stressTrend = computeStressTrend(moodTrend.map((p) => p.stress ?? null));

  return {
    moodTrend,
    recurringTriggers: aggregateTriggers(journals),
    recurringEmotions: aggregateEmotions(journals),
    averageMoodScore,
    journalCount: journals.length,
    latestSuggestion,
    stressTrend,
  };
}

function avg(nums: number[]): number {
  return nums.reduce((s, v) => s + v, 0) / nums.length;
}

/**
 * Compares the average stress of the most recent 3 logs vs the 3 before that.
 * Returns "insufficient" when there are fewer than 4 data points.
 */
export function computeStressTrend(stressValues: (number | null)[]): StressTrend {
  const scores = stressValues.filter((v): v is number => v !== null);
  if (scores.length < 4) return "insufficient";

  const recent = scores.slice(-3);
  const prior  = scores.slice(-6, -3);
  if (prior.length === 0) return "insufficient";

  const delta = avg(recent) - avg(prior);
  if (delta > 0.4) return "rising";
  if (delta < -0.4) return "easing";
  return "stable";
}
