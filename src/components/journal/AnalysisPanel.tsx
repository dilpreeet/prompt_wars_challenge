import { Sparkles } from "lucide-react";
import type { JournalAnalysis } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toPlainText } from "@/components/chat/types";

interface AnalysisPanelProps {
  analysis: JournalAnalysis;
}

/** Displays Gemini structured analysis for a journal entry. */
export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  return (
    <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold">AI reflection</p>
          <p className="text-xs text-muted-foreground">
            Mood score: {analysis.moodScore}/10 — not a clinical assessment
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {analysis.emotions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Emotions
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.emotions.map((emotion) => (
                <Badge key={emotion} variant="secondary" className="rounded-lg">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.stressTriggers.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stress triggers
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.stressTriggers.map((trigger) => (
                <Badge key={trigger} variant="outline" className="rounded-lg">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suggestion
          </p>
          <p className="leading-relaxed whitespace-pre-wrap text-foreground/90">
            {toPlainText(analysis.suggestion)}
          </p>
        </div>
      </div>
    </div>
  );
}
