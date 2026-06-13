"use client";

import { useState } from "react";
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

/** Keyboard-accessible mood picker that logs to /api/mood. */
export function MoodSelector({ onLogged }: MoodSelectorProps) {
  const [selected, setSelected] = useState<MoodId | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

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

  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label="How are you feeling right now?"
        className="flex flex-wrap gap-2"
      >
        {MOOD_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={status === "saving"}
              onClick={() => logMood(option.id)}
              className={cn(
                "inline-flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl border px-3 py-2 text-sm transition-colors",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                isSelected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background hover:bg-muted/60",
              )}
            >
              <span className="text-xl" aria-hidden="true">
                {option.emoji}
              </span>
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>

      {status === "saving" && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          Saving mood…
        </p>
      )}
      {status === "saved" && (
        <p className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400" role="status">
          <Check className="size-3" aria-hidden="true" />
          Mood logged — nice check-in!
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-xs text-destructive">
          Could not save mood. Please try again.
        </p>
      )}
    </div>
  );
}
