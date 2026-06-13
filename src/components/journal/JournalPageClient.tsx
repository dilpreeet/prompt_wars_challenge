"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EntryCard } from "@/components/journal/EntryCard";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { buttonVariants } from "@/components/ui/button";
import type { JournalEntry } from "@/types";

interface JournalPageClientProps {
  initialEntries: JournalEntry[];
}

export function JournalPageClient({ initialEntries }: JournalPageClientProps) {
  const [entries, setEntries] = useState(initialEntries);

  function handleSaved(entry: JournalEntry) {
    setEntries((prev) => [entry, ...prev]);
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/30">
      <header className="border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-base font-semibold">Journal</h1>
            <p className="text-xs text-muted-foreground">
              Reflect &amp; get AI insights
            </p>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        <JournalEditor onSaved={handleSaved} />

        {entries.length > 0 && (
          <section aria-labelledby="entries-heading" className="space-y-4">
            <h2 id="entries-heading" className="text-sm font-semibold">
              Past entries
            </h2>
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
