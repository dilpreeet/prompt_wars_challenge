"use client";

import { useState } from "react";
import { Loader2, PenLine } from "lucide-react";
import { CrisisBanner } from "@/components/chat/CrisisBanner";
import { AnalysisPanel } from "@/components/journal/AnalysisPanel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JournalEntry } from "@/types";

interface JournalEditorProps {
  onSaved?: (entry: JournalEntry) => void;
}

export function JournalEditor({ onSaved }: JournalEditorProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(null);
  const [crisis, setCrisis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || status === "saving") return;

    setStatus("saving");
    setError(null);
    setCrisis(false);
    setSavedEntry(null);

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const payload = (await response.json()) as {
        entry?: JournalEntry;
        crisis?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save entry");
      }

      setSavedEntry(payload.entry ?? null);
      setCrisis(Boolean(payload.crisis));
      setContent("");
      setStatus("done");
      if (payload.entry) onSaved?.(payload.entry);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="journal-content">What&apos;s on your mind?</Label>
          <Textarea
            id="journal-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely about your day, study stress, wins, or worries…"
            rows={6}
            disabled={status === "saving"}
            className="min-h-[140px] resize-y"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={status === "saving" || !content.trim()}>
          {status === "saving" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            <>
              <PenLine className="size-4" aria-hidden="true" />
              Save &amp; analyze
            </>
          )}
        </Button>
      </form>

      {crisis && savedEntry?.ai_analysis && (
        <CrisisBanner
          content={
            "If you're going through a difficult time, please reach out for support. Tele-MANAS: 14416 | AASRA: 9820466726"
          }
        />
      )}

      {status === "done" && savedEntry?.ai_analysis && (
        <AnalysisPanel analysis={savedEntry.ai_analysis} />
      )}
    </div>
  );
}
