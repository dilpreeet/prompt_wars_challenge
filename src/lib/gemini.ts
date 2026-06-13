import {
  GoogleGenerativeAI,
  type Content,
  type GenerativeModel,
  type Part,
} from "@google/generative-ai";

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export const isGeminiConfigured = Boolean(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY,
);

/** Maps raw Gemini SDK errors to user-friendly messages. */
export function formatGeminiError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);

  if (text.includes("429") || text.includes("quota") || text.includes("Quota")) {
    return "CalmCoach hit the Gemini API rate limit. Wait about a minute and try again, or check your quota at aistudio.google.com.";
  }

  if (text.includes("404") || text.includes("not found")) {
    return `The AI model "${GEMINI_MODEL}" is unavailable. Set GEMINI_MODEL=gemini-2.5-flash (or gemini-3.1-flash-lite) in your .env file.`;
  }

  if (text.includes("API key") || text.includes("API_KEY")) {
    return "Invalid Gemini API key. Check GOOGLE_GENERATIVE_AI_API_KEY in your .env file.";
  }

  return text.length > 200 ? "AI request failed. Please try again." : text;
}

function getApiKey(): string {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env.local.",
    );
  }
  return key;
}

/** Returns a configured Gemini generative model instance. */
export function getModel(systemInstruction?: string): GenerativeModel {
  const genAI = new GoogleGenerativeAI(getApiKey());
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemInstruction || undefined,
  });
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function toGeminiContents(history: ChatTurn[], userMessage: string): Content[] {
  const contents: Content[] = history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.content } satisfies Part],
  }));

  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  return contents;
}

/**
 * Streams Gemini chat completion chunks. Yields plain-text deltas as they
 * arrive from the model.
 */
export async function* streamChatCompletion(options: {
  systemInstruction: string;
  history: ChatTurn[];
  userMessage: string;
}): AsyncGenerator<string> {
  const model = getModel(options.systemInstruction);
  const contents = toGeminiContents(options.history, options.userMessage);

  const result = await model.generateContentStream({ contents });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}
