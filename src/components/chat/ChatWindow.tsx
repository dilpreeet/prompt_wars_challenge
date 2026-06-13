"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { ChatStreamEvent, ChatUIMessage } from "@/components/chat/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  initialMessages?: ChatUIMessage[];
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

export function ChatWindow({ initialMessages = [] }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatUIMessage[]>(initialMessages);
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

  async function handleSend(event?: React.FormEvent) {
    event?.preventDefault();
    const trimmed = input.trim();
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

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="flex h-svh flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-base font-semibold">CalmCoach</h1>
            <p className="text-xs text-muted-foreground">
              Your exam-stress companion
            </p>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </header>

      <main id="main-content" className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
              <p className="text-sm font-medium">Welcome to CalmCoach</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Share what&apos;s on your mind — exam stress, burnout, or just
                needing someone to listen. I&apos;m here for you.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              crisisContent={
                message.role === "assistant" && activeCrisis && message.isStreaming
                  ? activeCrisis
                  : null
              }
            />
          ))}
        </div>
      </div>

      <footer className="border-t border-border bg-background/80 px-4 py-4 backdrop-blur-sm">
        <form
          onSubmit={handleSend}
          className="mx-auto flex max-w-2xl flex-col gap-2"
        >
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex items-end gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Message CalmCoach
            </label>
            <Textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How are you feeling today?"
              rows={2}
              disabled={isSending}
              className="min-h-[52px] resize-none"
              aria-describedby={error ? "chat-error" : undefined}
            />
            <Button
              type="submit"
              size="icon-lg"
              disabled={isSending || !input.trim()}
              aria-label={isSending ? "Sending message" : "Send message"}
              className={cn("shrink-0 rounded-full")}
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for a new line. Not a substitute
            for professional care.
          </p>
        </form>
      </footer>
      </main>
    </div>
  );
}
