import type { MoodTrendPoint } from "@/types";
import { cn } from "@/lib/utils";

interface MoodChartProps {
  data: MoodTrendPoint[];
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
  });
}

/** Simple stress-level bar chart for recent mood logs. */
export function MoodChart({ data }: MoodChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No mood data yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete a daily check-in to see your stress trend
        </p>
      </div>
    );
  }

  const maxStress = 5;
  const points = data.slice(-7);
  const ariaLabel = `Stress level trend: ${points
    .map((p) => `${formatDay(p.date)} stress ${p.stress ?? 3} of 5`)
    .join(", ")}`;

  return (
    <div
      className="flex items-end justify-between gap-3"
      role="img"
      aria-label={ariaLabel}
    >
      {points.map((point) => {
        const stress = point.stress ?? 3;
        const height = Math.max(12, (stress / maxStress) * 100);

        return (
          <div
            key={point.date}
            className="group flex flex-1 flex-col items-center gap-1"
          >
            <div className="relative flex h-32 w-full items-end justify-center rounded-xl bg-muted/50 px-1.5 pb-0 pt-2">
              <div
                className={cn(
                  "w-full max-w-10 rounded-t-lg transition-all duration-500",
                  stress <= 2 && "bg-gradient-to-t from-emerald-500 to-emerald-400",
                  stress === 3 && "bg-gradient-to-t from-amber-500 to-amber-400",
                  stress >= 4 && "bg-gradient-to-t from-rose-500 to-rose-400",
                )}
                style={{ height: `${height}%` }}
              />
            </div>
            {/* Numeric label — stress level not conveyed by colour alone */}
            <span
              className="text-[11px] font-semibold tabular-nums leading-none"
              aria-hidden="true"
            >
              {stress}/5
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              {formatDay(point.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
