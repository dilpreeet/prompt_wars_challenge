import type { JournalEntry, MoodLog } from "@/types";
import { buildCrisisSystemAddendum } from "./safety";

export interface ChatContext {
  recentMoods?: Pick<MoodLog, "mood" | "energy" | "stress" | "note" | "created_at">[];
  recentJournals?: Pick<
    JournalEntry,
    "content" | "mood_score" | "ai_analysis" | "created_at"
  >[];
}

const BASE_PERSONA = `You are CalmCoach, a warm and empathetic mental-wellness companion for Indian exam aspirants preparing for NEET, JEE, CUET, CAT, GATE, UPSC, and similar high-stakes exams.

Your role:
- Listen without judgment and validate feelings (exam anxiety, burnout, comparison stress, parental pressure, fear of failure).
- Offer practical, exam-context coping strategies: Pomodoro breaks, spaced revision, sleep hygiene, mindfulness, positive self-talk, and realistic goal-setting.
- Suggest brief grounding exercises when stress is high (box breathing, 5-4-3-2-1 senses, progressive muscle relaxation).
- Celebrate small wins and encourage sustainable study habits over toxic hustle culture.

Boundaries (always follow):
- You are NOT a therapist, psychiatrist, or doctor. Never diagnose conditions or prescribe medication.
- Do not claim certainty about mental-health labels. Use supportive, non-clinical language.
- If the user mentions self-harm, suicide, or acute crisis, prioritize safety and professional help immediately.
- Keep replies focused and readable (roughly 2–4 short paragraphs unless they ask for more detail).
- Use simple English; occasional Hindi/Hinglish is fine if the user does.`;

const SAFETY_INSTRUCTIONS = `Safety rules:
- Never provide instructions for self-harm or dangerous behaviour.
- Encourage professional support when distress is severe or persistent.
- For India: Tele-MANAS 14416, AASRA 9820466726, emergency 112.`;

function formatContextBlock(context?: ChatContext): string {
  if (!context) return "";

  const parts: string[] = [];

  if (context.recentMoods?.length) {
    const moodLines = context.recentMoods.map((m) => {
      const extras = [
        m.energy != null ? `energy ${m.energy}/5` : null,
        m.stress != null ? `stress ${m.stress}/5` : null,
        m.note ? `note: "${m.note.slice(0, 120)}"` : null,
      ]
        .filter(Boolean)
        .join(", ");
      return `- ${m.mood}${extras ? ` (${extras})` : ""}`;
    });
    parts.push(`Recent mood logs:\n${moodLines.join("\n")}`);
  }

  if (context.recentJournals?.length) {
    const journalLines = context.recentJournals.map((j) => {
      const score = j.mood_score != null ? ` mood ${j.mood_score}/10` : "";
      const snippet = j.content.slice(0, 200).replace(/\s+/g, " ");
      const triggers = j.ai_analysis?.stressTriggers?.length
        ? ` triggers: ${j.ai_analysis.stressTriggers.join(", ")}`
        : "";
      return `- "${snippet}…"${score}${triggers}`;
    });
    parts.push(`Recent journal snippets:\n${journalLines.join("\n")}`);
  }

  if (!parts.length) return "";

  return `\n\nUser context (use to personalize, do not quote verbatim unless helpful):\n${parts.join("\n\n")}`;
}

/** Builds the full system instruction sent to Gemini. */
export function buildSystemPrompt(options?: {
  context?: ChatContext;
  isCrisis?: boolean;
}): string {
  const { context, isCrisis = false } = options ?? {};

  const sections = [BASE_PERSONA, SAFETY_INSTRUCTIONS];

  if (isCrisis) {
    sections.push(buildCrisisSystemAddendum());
  }

  sections.push(formatContextBlock(context));

  return sections.filter(Boolean).join("\n\n");
}
