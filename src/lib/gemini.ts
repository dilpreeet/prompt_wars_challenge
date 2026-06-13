import {
  GoogleGenerativeAI,
  type Content,
  type GenerativeModel,
  type Part,
} from "@google/generative-ai";

export const GEMINI_MODEL = "gemini-2.0-flash";

export const isGeminiConfigured = Boolean(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY,
);

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
