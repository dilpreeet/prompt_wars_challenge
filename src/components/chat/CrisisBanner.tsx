"use client";

import { AlertTriangle, Phone } from "lucide-react";
import { toPlainText } from "@/components/chat/types";

interface CrisisBannerProps {
  content: string;
}

/** Prominent helpline banner shown when crisis keywords are detected. */
export function CrisisBanner({ content }: CrisisBannerProps) {
  return (
    <div
      role="alert"
      className="w-full rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-4 text-sm text-amber-950 shadow-sm dark:border-amber-400/30 dark:from-amber-950/50 dark:to-orange-950/30 dark:text-amber-50"
    >
      <div className="mb-2 flex items-center gap-2 font-heading font-semibold">
        <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
        <span>You&apos;re not alone — help is available</span>
      </div>
      <p className="whitespace-pre-wrap leading-relaxed">{toPlainText(content)}</p>
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-200">
        <Phone className="size-3.5" aria-hidden="true" />
        Reach out anytime — these lines are free and confidential
      </div>
    </div>
  );
}
