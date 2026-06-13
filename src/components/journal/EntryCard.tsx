import type { JournalEntry } from "@/types";
import { AnalysisPanel } from "@/components/journal/AnalysisPanel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EntryCardProps {
  entry: JournalEntry;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EntryCard({ entry }: EntryCardProps) {
  return (
    <article>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journal entry</CardTitle>
          <CardDescription>{formatDate(entry.created_at)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {entry.content}
          </p>
          {entry.ai_analysis && (
            <AnalysisPanel analysis={entry.ai_analysis} />
          )}
        </CardContent>
      </Card>
    </article>
  );
}
