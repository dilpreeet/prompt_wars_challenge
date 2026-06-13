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
  const parsed = journalAnalysisSchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    throw new Error("Gemini returned invalid journal analysis JSON");
  }

  return parsed.data;
}
