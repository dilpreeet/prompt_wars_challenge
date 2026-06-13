export interface ChatUIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  /** Set when a crisis SSE event was received for this message; persists after streaming ends. */
  isCrisis?: boolean;
}

export type ChatStreamEvent =
  | { type: "crisis"; content: string }
  | { type: "token"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

/** Strips basic markdown bold markers for plain-text display. */
export function toPlainText(content: string): string {
  return content.replace(/\*\*(.*?)\*\*/g, "$1");
}
