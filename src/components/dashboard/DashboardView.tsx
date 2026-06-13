"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  MessageCircle,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MindfulnessCard } from "@/components/dashboard/MindfulnessCard";
import { MoodChart } from "@/components/mood/MoodChart";
import { MoodSelector } from "@/components/mood/MoodSelector";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { toPlainText } from "@/components/chat/types";
import { getTimeGreeting } from "@/lib/greeting";
import { cn } from "@/lib/utils";
import type { InsightsData } from "@/types";

interface DashboardViewProps {
  insights: InsightsData;
  userEmail?: string;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "teal" | "violet" | "amber";
}) {
  const accents = {
    teal: "bg-primary/10 text-primary",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="card-elevated flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            accents[accent],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </div>
      <div>
        <p className="font-heading text-3xl font-semibold tracking-tight">{value}</p>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon: Icon,
  variant,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group card-elevated flex flex-col gap-4 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md",
        variant === "primary" &&
          "border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card hover:border-primary/30",
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl",
          variant === "primary"
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
            : "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex-1 space-y-1.5">
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
        Open
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

export function DashboardView({ insights, userEmail }: DashboardViewProps) {
  const router = useRouter();
  const greeting = getTimeGreeting();
  const displayName = userEmail?.split("@")[0] ?? "there";

  return (
    <AppShell userEmail={userEmail}>
      <main id="main-content" className="mx-auto w-full max-w-5xl space-y-8">
        <FadeIn>
          <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
            <div className="relative z-10 max-w-xl space-y-2">
              <p className="text-sm font-medium text-primary">{greeting}</p>
              <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back,{" "}
                <span className="capitalize text-gradient-brand">{displayName}</span>
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Take a moment to check in with yourself. Small steps today build
                resilience for tomorrow&apos;s exams.
              </p>
            </div>
            <Sparkles
              className="pointer-events-none absolute -right-4 -top-4 size-32 text-primary/10"
              aria-hidden="true"
            />
          </section>
        </FadeIn>

        <FadeIn delay={0.05}>
          <section aria-labelledby="mood-heading" className="card-elevated overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
              <h2 id="mood-heading" className="font-heading text-lg font-semibold">
                Daily check-in
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                How are you feeling right now? Tap a mood to log it.
              </p>
            </div>
            <div className="px-6 py-6">
              <MoodSelector onLogged={() => router.refresh()} />
            </div>
          </section>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-3">
          <FadeIn delay={0.08}>
            <StatCard
              label="Average mood"
              value={insights.averageMoodScore ?? "—"}
              sub={
                insights.averageMoodScore != null ? "out of 10 this week" : "Log moods to see"
              }
              icon={Brain}
              accent="teal"
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <StatCard
              label="Journal entries"
              value={insights.journalCount}
              sub={
                insights.journalCount === 1
                  ? "entry analyzed"
                  : "entries analyzed"
              }
              icon={BookOpen}
              accent="violet"
            />
          </FadeIn>
          <FadeIn delay={0.12}>
            <StatCard
              label="Stress trend"
              value={
                insights.stressTrend === "rising"  ? "↑ Rising"  :
                insights.stressTrend === "easing"  ? "↓ Easing"  :
                insights.stressTrend === "stable"  ? "→ Stable"  :
                insights.moodTrend.length > 0      ? "Tracking…" : "—"
              }
              sub={
                insights.stressTrend === "insufficient" && insights.moodTrend.length > 0
                  ? "Log 4+ check-ins to see trend"
                  : insights.moodTrend.length > 0
                    ? `Based on ${insights.moodTrend.length} check-ins`
                    : "Start logging today"
              }
              icon={insights.stressTrend === "easing" ? TrendingDown : TrendingUp}
              accent="amber"
            />
          </FadeIn>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <FadeIn delay={0.14} className="lg:col-span-3">
            <section aria-labelledby="trend-heading" className="card-elevated h-full p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2
                    id="trend-heading"
                    className="font-heading text-lg font-semibold"
                  >
                    Stress over time
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your last 7 mood check-ins
                  </p>
                </div>
              </div>
              <MoodChart data={insights.moodTrend} />
            </section>
          </FadeIn>

          <FadeIn delay={0.16} className="lg:col-span-2">
            <section aria-labelledby="insights-heading" className="card-elevated h-full p-6">
              <h2
                id="insights-heading"
                className="font-heading text-lg font-semibold"
              >
                Your insights
              </h2>

              <div className="mt-5 space-y-5">
                {insights.recurringTriggers.length > 0 ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Recurring triggers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {insights.recurringTriggers.map((t) => (
                        <Badge
                          key={t.trigger}
                          variant="secondary"
                          className="rounded-lg px-2.5 py-1"
                        >
                          {t.trigger}
                          <span className="ml-1 opacity-60">×{t.count}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Journal regularly to uncover patterns in your stress triggers.
                  </p>
                )}

                {insights.recurringEmotions.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Emotion pattern
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {insights.recurringEmotions.map((e) => (
                        <Badge
                          key={e.trigger}
                          variant="outline"
                          className="rounded-lg px-2.5 py-1"
                        >
                          {e.trigger}
                          <span className="ml-1 opacity-60">×{e.count}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {insights.latestSuggestion && (
                  <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                      Latest suggestion
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {toPlainText(insights.latestSuggestion).slice(0, 220)}
                      {insights.latestSuggestion.length > 220 ? "…" : ""}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </FadeIn>
        </div>

        <FadeIn delay={0.17}>
          <section aria-labelledby="mindfulness-heading">
            <h2 id="mindfulness-heading" className="sr-only">
              Daily coping tip
            </h2>
            <MindfulnessCard />
          </section>
        </FadeIn>

        <FadeIn delay={0.18}>
          <section aria-labelledby="actions-heading" className="space-y-4">
            <h2 id="actions-heading" className="font-heading text-lg font-semibold">
              Continue your wellness journey
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ActionCard
                href="/chat"
                title="Talk to CalmCoach"
                description="A supportive AI companion for exam stress, burnout, and everyday worries."
                icon={MessageCircle}
                variant="primary"
              />
              <ActionCard
                href="/journal"
                title="Write in your journal"
                description="Reflect on your day and receive personalized AI insights on your entries."
                icon={BookOpen}
                variant="secondary"
              />
            </div>
          </section>
        </FadeIn>
      </main>
    </AppShell>
  );
}
