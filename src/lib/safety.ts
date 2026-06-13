export interface Helpline {
  name: string;
  number: string;
  description: string;
}

/** India-focused crisis helplines shown when distress keywords are detected. */
export const CRISIS_HELPLINES: Helpline[] = [
  {
    name: "Tele-MANAS",
    number: "14416",
    description: "24/7 national mental-health helpline ( toll-free )",
  },
  {
    name: "AASRA",
    number: "9820466726",
    description: "24/7 suicide prevention helpline",
  },
  {
    name: "iCall",
    number: "9152987821",
    description: "Counselling helpline ( Mon–Sat, 8 am–10 pm )",
  },
];

/**
 * Lowercase keyword/phrase patterns that suggest acute distress or self-harm.
 * Kept intentionally broad for a wellness product; false positives are handled
 * by steering toward grounding + professional help rather than alarm.
 */
const CRISIS_PATTERNS: RegExp[] = [
  /\b(kill|hurt|harm|end)\s+(my\s*self|myself)\b/i,
  /\bsuicid(e|al)\b/i,
  /\b(want|going)\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive)\b/i,
  /\b(no\s+reason\s+to\s+live|better\s+off\s+dead)\b/i,
  /\b(cut(ting)?|slash(ing)?)\s+(my\s*)?(self|wrists?)\b/i,
  /\bself[\s-]?harm\b/i,
  /\boverdose\b/i,
  /\bend\s+it\s+all\b/i,
  /\bcan'?t\s+go\s+on\b/i,
];

export interface CrisisCheckResult {
  isCrisis: boolean;
  matchedPattern?: string;
}

/** Returns whether `text` matches any crisis keyword pattern. */
export function detectCrisis(text: string): CrisisCheckResult {
  const normalized = text.trim();
  if (!normalized) {
    return { isCrisis: false };
  }

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isCrisis: true, matchedPattern: pattern.source };
    }
  }

  return { isCrisis: false };
}

/** Human-readable helpline block prepended to crisis responses. */
export function formatHelplineMessage(): string {
  const lines = CRISIS_HELPLINES.map(
    (h) => `• **${h.name}** — ${h.number} (${h.description})`,
  );
  return [
    "I'm really glad you reached out. What you're feeling matters, and you don't have to face this alone.",
    "",
    "**Immediate support in India:**",
    ...lines,
    "",
    "If you are in immediate danger, please call **112** or go to your nearest emergency room.",
  ].join("\n");
}

/** Extra system instructions injected when a crisis is detected. */
export function buildCrisisSystemAddendum(): string {
  return [
    "CRISIS MODE: The user may be in acute distress.",
    "Respond with warmth, validation, and grounding — never diagnose or minimize.",
    "Prioritize safety: encourage reaching Tele-MANAS (14416) or AASRA (9820466726) now.",
    "Offer one simple grounding exercise (5-4-3-2-1 senses or box breathing).",
    "Keep the reply concise, calm, and non-judgmental. Do not provide methods of self-harm.",
  ].join(" ");
}
