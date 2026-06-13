"use client";

import { cn } from "@/lib/utils";

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
}

/** Renders chat text with an optional blinking cursor while streaming. */
export function StreamingText({
  text,
  isStreaming = false,
  className,
}: StreamingTextProps) {
  return (
    <span className={cn("whitespace-pre-wrap break-words", className)}>
      {text}
      {isStreaming && (
        <span
          className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
