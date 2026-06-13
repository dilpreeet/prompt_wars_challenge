"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Trash2 } from "lucide-react";
import type { JournalEntry } from "@/types";
import { AnalysisPanel } from "@/components/journal/AnalysisPanel";
import { Button } from "@/components/ui/button";

interface EntryCardProps {
  entry: JournalEntry;
  onDelete?: (id: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EntryCard({ entry, onDelete }: EntryCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/journal/${entry.id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Delete failed");
      }
      onDelete?.(entry.id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete entry");
      setDeleting(false);
    }
  }

  return (
    <article className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-6 py-3.5">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
          <time className="text-sm font-medium text-muted-foreground" dateTime={entry.created_at}>
            {formatDate(entry.created_at)}
          </time>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={deleting}
          onClick={handleDelete}
          aria-label="Delete this journal entry"
          className="text-muted-foreground hover:text-destructive"
        >
          {deleting ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-3.5" aria-hidden="true" />
          )}
        </Button>
      </div>
      {deleteError && (
        <p role="alert" className="px-6 pt-3 text-xs text-destructive">
          {deleteError}
        </p>
      )}
      <div className="space-y-5 px-6 py-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {entry.content}
        </p>
        {entry.ai_analysis && <AnalysisPanel analysis={entry.ai_analysis} />}
      </div>
    </article>
  );
}
