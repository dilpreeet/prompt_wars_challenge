"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  MOOD_ENERGY_DEFAULT,
  MOOD_OPTIONS,
  MOOD_STRESS_DEFAULT,
  type MoodId,
} from "@/components/mood/constants";
import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  onLogged?: () => void;
}

const MOOD_COLORS: Record<MoodId, string> = {
  great: "hover:border-emerald-300 hover:bg-emerald-50 data-[selected=true]:border-emerald-400 data-[selected=true]:bg-emerald-50 data-[selected=true]:text-emerald-800",
  okay: "hover:border-sky-300 hover:bg-sky-50 data-[selected=true]:border-sky-400 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-800",
  meh: "hover:border-amber-300 hover:bg-amber-50 data-[selected=true]:border-amber-400 data-[selected=true]:bg-amber-50 data-[selected=true]:text-amber-800",
  low: "hover:border-orange-300 hover:bg-orange-50 data-[selected=true]:border-orange-400 data-[selected=true]:bg-orange-50 data-[selected=true]:text-orange-800",
  anxious: "hover:border-rose-300 hover:bg-rose-50 data-[selected=true]:border-rose-400 data-[selected=true]:bg-rose-50 data-[selected=true]:text-rose-800",
};

/** Keyboard-accessible mood picker that logs to /api/mood. */
export function MoodSelector({ onLogged }: MoodSelectorProps) {
  const [selected, setSelected] = useState<MoodId | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  async function logMood(moodId: MoodId) {
    setSelected(moodId);
    setStatus("saving");

    const option = MOOD_OPTIONS.find((m) => m.id === moodId)!;

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: option.label,
          energy: MOOD_ENERGY_DEFAULT[moodId],
          stress: MOOD_STRESS_DEFAULT[moodId],
        }),
      });

      if (!response.ok) throw new Error("Failed to log mood");

      setStatus("saved");
      onLogged?.();
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  function handleRadioKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % MOOD_OPTIONS.length;
      event.preventDefault();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + MOOD_OPTIONS.length) % MOOD_OPTIONS.length;
      event.preventDefault();
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      void logMood(MOOD_OPTIONS[index]!.id);
      return;
    } else {
      return;
    }
    optionRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="space-y-4">
      <div
        role="radiogroup"
        aria-label="How are you feeling right now?"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
      >
        {MOOD_OPTIONS.map((option, index) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              data-selected={isSelected}
              disabled={status === "saving"}
              onClick={() => logMood(option.id)}
              onKeyDown={(event) => handleRadioKeyDown(event, index)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 border-border/60 bg-card px-4 py-5 text-sm transition-all",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                "disabled:opacity-60",
                MOOD_COLORS[option.id],
              )}
            >
              <span className="text-3xl" aria-hidden="true">
                {option.emoji}
              </span>
              <span className="text-sm font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>

      {status === "saving" && (
        <p
          className="flex items-center gap-2 text-sm text-muted-foreground"
          role="status"
        >
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Saving your check-in…
        </p>
      )}
      {status === "saved" && (
        <p
          className="flex items-center gap-2 text-sm font-medium text-emerald-600"
          role="status"
        >
          <Check className="size-3.5" aria-hidden="true" />
          Mood logged — great job checking in with yourself!
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          Could not save mood. Please try again.
        </p>
      )}
    </div>
  );
}
