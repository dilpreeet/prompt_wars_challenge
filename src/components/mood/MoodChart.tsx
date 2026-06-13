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
      <p className="text-sm text-muted-foreground">
        Log your mood to see your stress trend here.
      </p>
    );
  }

  const maxStress = 5;

  return (
    <div
      className="flex items-end justify-between gap-2"
      role="img"
      aria-label="Stress level trend over recent mood check-ins"
    >
      {data.slice(-7).map((point) => {
        const stress = point.stress ?? 3;
        const height = `${(stress / maxStress) * 100}%`;

        return (
          <div
            key={point.date}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-24 w-full items-end justify-center rounded-md bg-muted/40 px-1">
              <div
                className={cn(
                  "w-full max-w-8 rounded-t-md transition-all",
                  stress <= 2 && "bg-emerald-500/70",
                  stress === 3 && "bg-amber-500/70",
                  stress >= 4 && "bg-rose-500/70",
                )}
                style={{ height }}
                title={`${point.mood} — stress ${stress}/5`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {formatDay(point.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
