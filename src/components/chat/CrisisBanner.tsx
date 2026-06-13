"use client";

import { AlertTriangle } from "lucide-react";
import { toPlainText } from "@/components/chat/types";

interface CrisisBannerProps {
  content: string;
}

/** Prominent helpline banner shown when crisis keywords are detected. */
export function CrisisBanner({ content }: CrisisBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-50"
    >
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        <span>You&apos;re not alone — help is available</span>
      </div>
      <p className="whitespace-pre-wrap leading-relaxed">{toPlainText(content)}</p>
    </div>
  );
}
