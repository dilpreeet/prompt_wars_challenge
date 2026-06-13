"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  text: string;
  className?: string;
  /** When true the button auto-plays once — used after streaming completes. */
  autoPlay?: boolean;
}

/**
 * Reads assistant text aloud.
 * Primary: ElevenLabs via /api/tts.
 * Fallback: browser Web Speech API (SpeechSynthesis) when ElevenLabs is
 * unavailable or returns an error — keeps TTS working in demo / no-key mode.
 */
export function VoiceButton({ text, className, autoPlay = false }: VoiceButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const usingBrowserTtsRef = useRef(false);
  const didAutoPlayRef = useRef(false);

  const stopAll = useCallback(() => {
    if (usingBrowserTtsRef.current) {
      window.speechSynthesis.cancel();
      usingBrowserTtsRef.current = false;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  const playBrowserTts = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      setStatus("error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 2000));
    utterance.rate = 0.95;
    utterance.onend = () => {
      usingBrowserTtsRef.current = false;
      setStatus("idle");
    };
    utterance.onerror = () => {
      usingBrowserTtsRef.current = false;
      setStatus("idle");
    };
    usingBrowserTtsRef.current = true;
    window.speechSynthesis.speak(utterance);
    setStatus("playing");
  }, [text]);

  const handleClick = useCallback(async () => {
    if (status === "playing") {
      stopAll();
      setStatus("idle");
      return;
    }

    stopAll();
    setStatus("loading");

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 2000) }),
      });

      if (!response.ok) {
        // ElevenLabs unavailable or not configured — silently use browser TTS.
        playBrowserTts();
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        stopAll();
        setStatus("idle");
      };
      audio.onerror = () => {
        stopAll();
        setStatus("error");
      };
      await audio.play();
      setStatus("playing");
    } catch {
      playBrowserTts();
    }
  }, [status, text, stopAll, playBrowserTts]);

  // Keep a stable ref to handleClick so the autoPlay effect below doesn't
  // need handleClick in its dependency array (avoids retriggering on re-renders).
  const handleClickRef = useRef(handleClick);
  useEffect(() => {
    handleClickRef.current = handleClick;
  });

  // Trigger playback exactly once when autoPlay becomes true.
  useEffect(() => {
    if (!autoPlay || didAutoPlayRef.current || !text.trim()) return;
    didAutoPlayRef.current = true;
    void handleClickRef.current();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

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
      onClick={() => void handleClick()}
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
