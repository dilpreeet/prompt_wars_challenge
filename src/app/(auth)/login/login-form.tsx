"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  Loader2,
  Shield,
  Sparkles,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI wellness coach",
    description: "Talk through exam stress with a supportive companion",
  },
  {
    icon: Heart,
    title: "Daily mood tracking",
    description: "Spot patterns before burnout builds up",
  },
  {
    icon: Shield,
    title: "Private & secure",
    description: "Your entries stay between you and CalmCoach",
  },
] as const;

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
    <div className="card-elevated w-full max-w-md p-8">
      <div className="mb-8 space-y-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Heart className="size-7 fill-current" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Sign in to CalmCoach
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your campus wellness companion for exam prep and everyday stress
        </p>
      </div>

      {status === "sent" ? (
        <div
          role="status"
          className="flex flex-col items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"
        >
          <CheckCircle2
            className="size-10 text-primary"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <p className="font-heading font-semibold">Check your inbox</p>
            <p className="text-sm text-muted-foreground">
              If <span className="font-medium text-foreground">{email}</span> is
              a real inbox, we sent a magic link.{" "}
              <strong>Open that email on this device</strong> and tap the link.
            </p>
            <p className="text-xs text-muted-foreground">
              Used a fake email? Try guest mode below instead.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setStatus("idle")}
          >
            Try a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@university.edu"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11"
              aria-describedby={message ? "login-message" : undefined}
            />
          </div>

          {(message || linkError) && (
            <p
              id="login-message"
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
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
            className="h-11 w-full text-base"
            disabled={status === "sending" || status === "guest"}
          >
            {status === "sending" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Sending link…
              </>
            ) : (
              "Continue with email"
            )}
          </Button>
        </form>
      )}

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs font-medium text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="h-11 w-full"
        disabled={status === "guest" || status === "sending"}
        onClick={handleGuestLogin}
      >
        {status === "guest" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Starting guest session…
          </>
        ) : (
          <>
            <UserRound className="size-4" aria-hidden="true" />
            Continue as guest
          </>
        )}
      </Button>
      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
        Guest mode works instantly — no email needed. Data stays in this browser
        session only.
      </p>
    </div>
  );
}

function LoginHero() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-[oklch(0.45_0.12_190)] to-[oklch(0.38_0.1_220)] p-10 text-primary-foreground lg:flex lg:w-[480px] xl:w-[540px]">
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Heart className="size-5 fill-current" aria-hidden="true" />
          </div>
          <span className="font-heading text-xl font-bold">CalmCoach</span>
        </div>
        <div className="space-y-3 pt-4">
          <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
            Mental wellness built for students
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-primary-foreground/85">
            Trusted by campuses to support exam aspirants through stress,
            burnout, and the pressure to perform.
          </p>
        </div>
      </div>

      <ul className="relative z-10 space-y-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="mt-0.5 text-sm text-primary-foreground/80">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div
        className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-white/5 blur-2xl"
        aria-hidden="true"
      />
    </div>
  );
}

export function LoginPageClient() {
  return (
    <div className="flex min-h-svh w-full">
      <LoginHero />
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <Suspense
          fallback={
            <div className="card-elevated w-full max-w-md p-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
