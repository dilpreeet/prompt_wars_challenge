"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { MoodChart } from "@/components/mood/MoodChart";
import { MoodSelector } from "@/components/mood/MoodSelector";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/ui/fade-in";
import { toPlainText } from "@/components/chat/types";
import type { InsightsData } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
  insights: InsightsData;
  userEmail?: string;
}

export function DashboardView({ insights, userEmail }: DashboardViewProps) {
  const router = useRouter();

  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/30">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">CalmCoach</h1>
              {userEmail && (
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              )}
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-4xl space-y-6 px-4 py-8"
      >
        <FadeIn>
          <section aria-labelledby="mood-heading">
            <Card>
            <CardHeader>
              <CardTitle id="mood-heading">How are you feeling?</CardTitle>
              <CardDescription>
                Quick check-in — tap a mood to log it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MoodSelector onLogged={() => router.refresh()} />
            </CardContent>
          </Card>
        </section>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn delay={0.05}>
          <section aria-labelledby="trend-heading">
            <Card className="h-full">
              <CardHeader>
                <CardTitle id="trend-heading" className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-4" aria-hidden="true" />
                  Stress trend
                </CardTitle>
                <CardDescription>Last 7 mood check-ins</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodChart data={insights.moodTrend} />
              </CardContent>
            </Card>
          </section>
          </FadeIn>

          <FadeIn delay={0.1}>
          <section aria-labelledby="stats-heading">
            <Card className="h-full">
              <CardHeader>
                <CardTitle id="stats-heading" className="text-base">
                  Your snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-semibold">
                    {insights.averageMoodScore ?? "—"}
                    {insights.averageMoodScore != null && (
                      <span className="text-base font-normal text-muted-foreground">
                        /10 avg mood
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {insights.journalCount} journal{" "}
                    {insights.journalCount === 1 ? "entry" : "entries"} analyzed
                  </p>
                </div>

                {insights.recurringTriggers.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Recurring triggers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {insights.recurringTriggers.map((t) => (
                        <Badge key={t.trigger} variant="outline">
                          {t.trigger} ({t.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {insights.latestSuggestion && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Latest suggestion</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {toPlainText(insights.latestSuggestion).slice(0, 200)}
                      {insights.latestSuggestion.length > 200 ? "…" : ""}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
          </FadeIn>
        </div>

        <Separator />

        <FadeIn delay={0.15}>
        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="sr-only">
            Quick actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-auto flex-col items-start gap-2 px-5 py-5 text-left",
              )}
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              <span className="font-semibold">Talk to CalmCoach</span>
              <span className="text-xs font-normal opacity-90">
                Stream a supportive conversation about exam stress
              </span>
            </Link>
            <Link
              href="/journal"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto flex-col items-start gap-2 px-5 py-5 text-left",
              )}
            >
              <BookOpen className="size-5" aria-hidden="true" />
              <span className="font-semibold">Write in journal</span>
              <span className="text-xs font-normal text-muted-foreground">
                Reflect and get AI-powered insights on your entries
              </span>
            </Link>
          </div>
        </section>
        </FadeIn>
      </main>
    </div>
  );
}
