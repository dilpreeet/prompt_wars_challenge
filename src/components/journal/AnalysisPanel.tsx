import type { JournalAnalysis } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toPlainText } from "@/components/chat/types";

interface AnalysisPanelProps {
  analysis: JournalAnalysis;
}

/** Displays Gemini structured analysis for a journal entry. */
export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">AI reflection</CardTitle>
        <CardDescription>
          Mood score: {analysis.moodScore}/10 — not a clinical assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {analysis.emotions.length > 0 && (
          <div>
            <p className="mb-2 font-medium text-muted-foreground">Emotions</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.emotions.map((emotion) => (
                <Badge key={emotion} variant="secondary">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.stressTriggers.length > 0 && (
          <div>
            <p className="mb-2 font-medium text-muted-foreground">
              Stress triggers
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.stressTriggers.map((trigger) => (
                <Badge key={trigger} variant="outline">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-1 font-medium text-muted-foreground">Suggestion</p>
          <p className="leading-relaxed whitespace-pre-wrap">
            {toPlainText(analysis.suggestion)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
