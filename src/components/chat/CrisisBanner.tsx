"use client";

import { AlertTriangle, Phone } from "lucide-react";
import { CRISIS_HELPLINES } from "@/lib/safety";

/** Prominent helpline banner shown when crisis keywords are detected. */
export function CrisisBanner() {
  return (
    <div
      role="alert"
      className="w-full rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-4 text-sm text-amber-950 shadow-sm dark:border-amber-400/30 dark:from-amber-950/50 dark:to-orange-950/30 dark:text-amber-50"
    >
      <div className="mb-2 flex items-center gap-2 font-heading font-semibold">
        <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
        <span>You&apos;re not alone — help is available</span>
      </div>
      <p className="mb-3 leading-relaxed">
        I&apos;m really glad you reached out. What you&apos;re feeling matters, and you
        don&apos;t have to face this alone.
      </p>
      <ul className="space-y-1.5">
        {CRISIS_HELPLINES.map((h) => (
          <li key={h.number} className="flex flex-wrap items-baseline gap-1.5">
            <a
              href={`tel:${h.number}`}
              className="font-bold underline underline-offset-2 hover:no-underline"
              aria-label={`Call ${h.name} at ${h.number}`}
            >
              {h.name} — {h.number}
            </a>
            <span className="text-xs opacity-75">({h.description})</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-medium">
        If you are in immediate danger, call <strong>112</strong> or go to your
        nearest emergency room.
      </p>
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-200">
        <Phone className="size-3.5" aria-hidden="true" />
        These lines are free and confidential
      </div>
    </div>
  );
}
