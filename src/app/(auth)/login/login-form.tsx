"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Sparkles, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function LoginForm() {
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "guest" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleGuestLogin() {
    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage("Add Supabase keys to .env.local first.");
      return;
    }

    setStatus("guest");
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInAnonymously();

      if (error) {
        setStatus("error");
        setMessage(
          error.message.includes("anonymous") ||
            error.message.includes("Anonymous")
            ? "Guest sign-in is disabled. In Supabase go to Authentication → Providers → Anonymous Sign-Ins and enable it."
            : error.message,
        );
        return;
      }

      // Full navigation ensures auth cookies are picked up by the server
      window.location.assign("/");
    } catch {
      setStatus("error");
      setMessage(
        "Could not reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and your internet connection.",
      );
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage(
        "Authentication isn't configured yet. Add your Supabase keys to .env.local.",
      );
      return;
    }

    setStatus("sending");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl">Welcome to CalmCoach</CardTitle>
        <CardDescription>
          A calmer space for exam stress. Sign in with a magic link or continue
          as a guest to try the app instantly.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === "sent" ? (
          <div
            role="status"
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/40 p-6 text-center"
          >
            <CheckCircle2
              className="size-8 text-emerald-500"
              aria-hidden="true"
            />
            <p className="font-medium">Check your inbox</p>
            <p className="text-sm text-muted-foreground">
              If <span className="font-medium text-foreground">{email}</span> is
              a real inbox, we sent a magic link.{" "}
              <strong>Open that email on this device</strong> and tap the link —
              you are not signed in until you do.
            </p>
            <p className="text-xs text-muted-foreground">
              Used a fake email? Use guest mode below instead.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full"
              onClick={() => setStatus("idle")}
            >
              Try a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@gmail.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby={message ? "login-message" : undefined}
              />
            </div>

            {(message || linkError) && (
              <p
                id="login-message"
                role="alert"
                className="flex items-start gap-2 text-sm text-destructive"
              >
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {message ??
                    "That sign-in link was invalid or expired. Please request a new one."}
                </span>
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={status === "sending" || status === "guest"}
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Sending link&hellip;
                </>
              ) : (
                "Send magic link"
              )}
            </Button>
          </form>
        )}

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={status === "guest" || status === "sending"}
          onClick={handleGuestLogin}
        >
          {status === "guest" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Starting guest session&hellip;
            </>
          ) : (
            <>
              <UserRound className="size-4" aria-hidden="true" />
              Continue as guest
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Guest mode signs you in immediately — no email needed. Your data stays
          private to this browser session.
        </p>
      </CardContent>
    </Card>
  );
}

export function LoginPageClient() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Loading…
          </CardContent>
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
