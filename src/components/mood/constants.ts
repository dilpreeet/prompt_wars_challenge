export const MOOD_OPTIONS = [
  { id: "great", label: "Great", emoji: "😊" },
  { id: "okay", label: "Okay", emoji: "🙂" },
  { id: "meh", label: "Meh", emoji: "😐" },
  { id: "low", label: "Low", emoji: "😔" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
] as const;

export type MoodId = (typeof MOOD_OPTIONS)[number]["id"];

/** Maps mood id to default stress level for quick logging. */
export const MOOD_STRESS_DEFAULT: Record<MoodId, number> = {
  great: 1,
  okay: 2,
  meh: 3,
  low: 4,
  anxious: 5,
};

export const MOOD_ENERGY_DEFAULT: Record<MoodId, number> = {
  great: 5,
  okay: 4,
  meh: 3,
  low: 2,
  anxious: 2,
};
