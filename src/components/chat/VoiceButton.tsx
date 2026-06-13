"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  text: string;
  className?: string;
}

/** Reads assistant text aloud via /api/tts (ElevenLabs). */
export function VoiceButton({ text, className }: VoiceButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">(
    "idle",
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  async function handleClick() {
    if (status === "playing") {
      cleanup();
      setStatus("idle");
      return;
    }

    cleanup();
    setStatus("loading");

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 2000) }),
      });

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        cleanup();
        setStatus("idle");
      };
      audio.onerror = () => {
        cleanup();
        setStatus("error");
      };

      await audio.play();
      setStatus("playing");
    } catch {
      cleanup();
      setStatus("error");
    }
  }

  const label =
    status === "playing"
      ? "Stop reading aloud"
      : status === "loading"
        ? "Loading audio"
        : status === "error"
          ? "Retry reading aloud"
          : "Read message aloud";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      disabled={status === "loading" || !text.trim()}
      aria-label={label}
      title={label}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      {status === "loading" ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : status === "playing" ? (
        <VolumeX className="size-3.5" aria-hidden="true" />
      ) : (
        <Volume2 className="size-3.5" aria-hidden="true" />
      )}
    </Button>
  );
}
