"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { ChatStreamEvent, ChatUIMessage } from "@/components/chat/types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "I'm feeling overwhelmed before my exam",
  "I can't focus while studying today",
  "I had a good study session and want to reflect",
  "I'm comparing myself to other aspirants",
] as const;

const WELCOME_ID = "calmcoach-welcome";

const WELCOME_MESSAGE: ChatUIMessage = {
  id: WELCOME_ID,
  role: "assistant",
  content:
    "Hi! I'm CalmCoach — your private, judgment-free companion for NEET, JEE, CAT, GATE, UPSC, and other high-stakes exams. Whether you're feeling overwhelmed, burnt out, or just need to think out loud, I'm here. What's on your mind today?",
};

interface ChatWindowProps {
  initialMessages?: ChatUIMessage[];
  userEmail?: string;
}

function parseSseChunk(raw: string): ChatStreamEvent | null {
  const line = raw.trim();
  if (!line.startsWith("data:")) return null;
  try {
    return JSON.parse(line.slice(5).trim()) as ChatStreamEvent;
  } catch {
    return null;
  }
}

function initMessages(initial: ChatUIMessage[]): ChatUIMessage[] {
  return initial.length > 0 ? initial : [WELCOME_MESSAGE];
}

export function ChatWindow({ initialMessages = [], userEmail }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatUIMessage[]>(() =>
    initMessages(initialMessages),
  );
  const [latestCompletedId, setLatestCompletedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCrisis, setActiveCrisis] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setError(null);
    setActiveCrisis(null);
    setIsSending(true);
    setInput("");

    const userMessage: ChatUIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const assistantId = crypto.randomUUID();
    const assistantPlaceholder: ChatUIMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Chat request failed");
      }

      if (!response.body) {
        throw new Error("No response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const event = parseSseChunk(part);
          if (!event) continue;

          if (event.type === "crisis") {
            setActiveCrisis(event.content);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, isCrisis: true } : m,
              ),
            );
          } else if (event.type === "token") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + event.content }
                  : m,
              ),
            );
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        ),
      );
      // Signal VoiceButton to auto-play this response.
      setLatestCompletedId(assistantId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  async function handleSend(event?: React.FormEvent) {
    event?.preventDefault();
    await sendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <AppShell userEmail={userEmail} fullBleed>
      <main
        id="main-content"
        className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col"
      >
        <div className="hidden border-b border-border/60 px-6 py-4 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold">CalmCoach</h1>
              <p className="text-sm text-muted-foreground">
                Your private space to talk through exam stress
              </p>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
          aria-relevant="additions text"
        >
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                crisisContent={
                  message.role === "assistant" && message.isCrisis
                    ? activeCrisis
                    : null
                }
                autoPlay={message.id === latestCompletedId}
              />
            ))}

            {/* Starter prompts — visible only before the user sends their first message */}
            {!messages.some((m) => m.role === "user") && !isSending && (
              <div className="mx-auto mt-2 flex w-full max-w-lg flex-wrap justify-center gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isSending}
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-full border border-border/80 bg-card px-4 py-2 text-left text-sm text-foreground/90 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="border-t border-border/80 bg-card/80 px-4 py-4 backdrop-blur-md sm:px-6">
          <form
            onSubmit={handleSend}
            className="mx-auto flex max-w-2xl flex-col gap-2"
          >
            {error && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-background p-2 shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
              <label htmlFor="chat-input" className="sr-only">
                Message CalmCoach
              </label>
              <Textarea
                id="chat-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind…"
                rows={2}
                disabled={isSending}
                className="min-h-[48px] flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="icon-lg"
                disabled={isSending || !input.trim()}
                aria-label={isSending ? "Sending message" : "Send message"}
                className={cn("shrink-0 rounded-xl")}
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Enter to send · Shift+Enter for new line · Not a substitute for
              professional care
            </p>
          </form>
        </footer>
      </main>
    </AppShell>
  );
}
