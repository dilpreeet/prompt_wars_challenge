"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error-reporting service in production
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">Something went wrong</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          An unexpected error occurred. Your journal entries and chat history are
          safe — please try refreshing the page.
        </p>
      </div>
      <Button onClick={reset} className="gap-2">
        <RefreshCcw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
