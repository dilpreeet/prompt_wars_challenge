"use client";

import { Bot, User } from "lucide-react";
import { CrisisBanner } from "@/components/chat/CrisisBanner";
import { StreamingText } from "@/components/chat/StreamingText";
import { VoiceButton } from "@/components/chat/VoiceButton";
import type { ChatUIMessage } from "@/components/chat/types";
import { toPlainText } from "@/components/chat/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatUIMessage;
  crisisContent?: string | null;
}

export function MessageBubble({ message, crisisContent }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const displayText = toPlainText(message.content);

  return (
    <article
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
      aria-label={isUser ? "Your message" : "Assistant message"}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground shadow-primary/20"
            : "border border-border/60 bg-card text-primary",
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-2 sm:max-w-[78%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        {!isUser && crisisContent && <CrisisBanner content={crisisContent} />}

        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground shadow-sm shadow-primary/15"
              : "rounded-tl-md border border-border/60 bg-card text-card-foreground shadow-sm",
          )}
        >
          <StreamingText text={displayText} isStreaming={message.isStreaming} />
        </div>

        {!isUser && !message.isStreaming && displayText.trim() && (
          <VoiceButton text={displayText} />
        )}
      </div>
    </article>
  );
}
