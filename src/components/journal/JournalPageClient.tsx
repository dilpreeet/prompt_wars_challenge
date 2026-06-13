"use client";

import { useState } from "react";
import { BookOpen, PenLine } from "lucide-react";
import { EntryCard } from "@/components/journal/EntryCard";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { AppShell } from "@/components/layout/AppShell";
import type { JournalEntry } from "@/types";

interface JournalPageClientProps {
  initialEntries: JournalEntry[];
  userEmail?: string;
}

export function JournalPageClient({
  initialEntries,
  userEmail,
}: JournalPageClientProps) {
  const [entries, setEntries] = useState(initialEntries);

  function handleSaved(entry: JournalEntry) {
    setEntries((prev) => [entry, ...prev]);
  }

  function handleDeleted(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <AppShell userEmail={userEmail}>
      <main id="main-content" className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <BookOpen className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                Journal
              </h1>
              <p className="text-sm text-muted-foreground">
                Reflect freely — AI insights help you understand patterns over time
              </p>
            </div>
          </div>
        </header>

        <section
          aria-labelledby="write-heading"
          className="card-elevated overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-6 py-4">
            <PenLine className="size-4 text-primary" aria-hidden="true" />
            <h2 id="write-heading" className="font-heading text-base font-semibold">
              New entry
            </h2>
          </div>
          <div className="p-6">
            <JournalEditor onSaved={handleSaved} />
          </div>
        </section>

        {entries.length > 0 && (
          <section aria-labelledby="entries-heading" className="space-y-4">
            <h2 id="entries-heading" className="font-heading text-lg font-semibold">
              Past entries
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({entries.length})
              </span>
            </h2>
            <div className="space-y-4">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onDelete={handleDeleted} />
              ))}
            </div>
          </section>
        )}
      </main>
    </AppShell>
  );
}
