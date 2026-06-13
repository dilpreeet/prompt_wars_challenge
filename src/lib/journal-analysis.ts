import { z } from "zod";
import type { JournalAnalysis } from "@/types";
import { getModel } from "./gemini";

export const journalAnalysisSchema = z.object({
  stressTriggers: z.array(z.string()).max(10),
  emotions: z.array(z.string()).max(10),
  moodScore: z.number().min(1).max(10),
  suggestion: z.string().max(1000),
});

const ANALYSIS_PROMPT = `You analyze private journal entries from Indian exam aspirants (NEET, JEE, CUET, CAT, GATE, UPSC).

Return ONLY valid JSON with this exact shape:
{
  "stressTriggers": ["string array of identified stress triggers"],
  "emotions": ["string array of emotions detected"],
  "moodScore": number from 1 (very low) to 10 (great),
  "suggestion": "one practical, empathetic coping suggestion (2-3 sentences max)"
}

Rules:
- Never diagnose medical or psychiatric conditions.
- Be supportive and exam-context aware.
- Keep triggers and emotions concise (1-4 words each).`;

/**
 * Lightweight keyword-based fallback used when Gemini is unavailable or fails.
 * Provides exam-aware trigger/emotion extraction and a grounding suggestion
 * without calling any external API — ensures the app stays fully functional
 * in demo/offline mode.
 */
export function getFallbackAnalysis(content: string): JournalAnalysis {
  const lower = content.toLowerCase();

  const stressTriggers: string[] = [];
  if (/exam|test|mock|revision|study|syllabus|chapter|topic/.test(lower))
    stressTriggers.push("exam pressure");
  if (/sleep|tired|exhausted|rest|insomnia/.test(lower))
    stressTriggers.push("sleep deprivation");
  if (/parent|family|pressure|expect|disappoint/.test(lower))
    stressTriggers.push("family expectations");
  if (/rank|score|mark|result|percentile|cut.?off/.test(lower))
    stressTriggers.push("performance anxiety");
  if (/time|deadline|schedule|behind|backlog|late/.test(lower))
    stressTriggers.push("time management");
  if (stressTriggers.length === 0) stressTriggers.push("general stress");

  const emotions: string[] = [];
  if (/anxious|nervous|worried|scared|fear/.test(lower)) emotions.push("anxious");
  if (/sad|low|down|unhappy|hopeless/.test(lower)) emotions.push("sad");
  if (/angry|frustrated|annoyed|irritated/.test(lower)) emotions.push("frustrated");
  if (/happy|great|excited|motivated|confident|proud/.test(lower)) emotions.push("motivated");
  if (/tired|exhausted|burned|burnout|drained/.test(lower)) emotions.push("fatigued");
  if (/overwhelmed|too much|lot|swamped/.test(lower)) emotions.push("overwhelmed");
  if (emotions.length === 0) emotions.push("reflective");

  const negCount = (
    lower.match(/stress|anxious|fail|bad|terrible|can't|cannot|hate|difficult|hard|worst/g) ?? []
  ).length;
  const posCount = (
    lower.match(/good|great|happy|confident|ready|manage|better|well|success|achieve/g) ?? []
  ).length;
  const moodScore = Math.max(2, Math.min(8, 5 + posCount - negCount));

  return {
    stressTriggers: stressTriggers.slice(0, 5),
    emotions: emotions.slice(0, 5),
    moodScore,
    suggestion:
      "Take a 5-minute break with box breathing (inhale 4 counts, hold 4, exhale 4). " +
      "Remember: showing up consistently matters more than perfection. " +
      "You are making progress — one chapter, one day at a time.",
  };
}

/** Runs Gemini structured analysis on a journal entry. */
export async function analyzeJournalEntry(
  content: string,
): Promise<JournalAnalysis> {
  const model = getModel(ANALYSIS_PROMPT);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: content }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const raw = result.response.text();

  let parsed;
  try {
    parsed = journalAnalysisSchema.safeParse(JSON.parse(raw));
  } catch {
    throw new Error("Gemini returned non-JSON response");
  }

  if (!parsed.success) {
    throw new Error("Gemini returned invalid journal analysis JSON");
  }

  return parsed.data;
}
