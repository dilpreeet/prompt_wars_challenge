"use client";

import { Wind } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const COPING_TIPS = [
  {
    title: "Box Breathing",
    body: "Inhale 4 counts → hold 4 → exhale 4 → hold 4. Repeat 4×. Activates your parasympathetic nervous system and calms pre-exam jitters in under 2 minutes.",
  },
  {
    title: "5-4-3-2-1 Grounding",
    body: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Anchors you to the present moment and interrupts anxious spiralling.",
  },
  {
    title: "Pomodoro Study Reset",
    body: "Study 25 min → break 5 min, repeat 4×, then a 20-min break. Science-backed for retention, focus recovery, and long-term burnout prevention.",
  },
  {
    title: "Celebrate Small Wins",
    body: "Finished a chapter? That's real progress. Write down 3 things you did well today — it trains your brain to recognise growth, not just gaps.",
  },
  {
    title: "Hydration & Movement",
    body: "Dehydration raises cortisol. Drink a full glass of water right now, then walk for 5 minutes. Your working memory and focus will reset noticeably.",
  },
  {
    title: "Progressive Muscle Relaxation",
    body: "Tense each muscle group 5 seconds, then release — feet → calves → thighs → abdomen → shoulders → hands. Releases physical exam tension in 10 minutes.",
  },
  {
    title: "Positive Reframing",
    body: "Replace 'I can\u2019t do this' with 'I haven\u2019t mastered this yet.' Sustained growth mindset reduces test anxiety over time and protects your motivation.",
  },
] as const;

export function MindfulnessCard() {
  const tip = COPING_TIPS[new Date().getDay() % COPING_TIPS.length];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Wind className="size-4 text-primary" aria-hidden="true" />
          Today&apos;s coping tip
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm font-medium">{tip.title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
      </CardContent>
    </Card>
  );
}
