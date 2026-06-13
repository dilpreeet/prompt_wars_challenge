"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "/chat", label: "Coach", icon: MessageCircle, match: (p: string) => p.startsWith("/chat") },
  { href: "/journal", label: "Journal", icon: BookOpen, match: (p: string) => p.startsWith("/journal") },
] as const;

interface AppShellProps {
  children: React.ReactNode;
  userEmail?: string;
  /** Full-height layout without outer padding (chat). */
  fullBleed?: boolean;
}

function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", compact && "justify-center")}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
        <Heart className="size-4 fill-current" aria-hidden="true" />
      </div>
      {!compact && (
        <div>
          <p className="font-heading text-base font-semibold leading-none tracking-tight">
            CalmCoach
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Student wellness
          </p>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children, userEmail, fullBleed }: AppShellProps) {
  const pathname = usePathname();
  const displayName = userEmail?.split("@")[0] ?? "Guest";

  return (
    <div className="flex min-h-svh app-surface">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/80 bg-sidebar lg:flex">
        <div className="border-b border-border/80 px-5 py-5">
          <BrandMark />
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Main">
          {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/80 p-4">
          <div className="mb-3 rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="truncate text-sm font-medium capitalize">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {userEmail ?? "Guest session"}
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" className="w-full justify-start gap-2">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border/80 bg-card/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <BrandMark compact />
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          </form>
        </header>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            !fullBleed && "px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
          )}
        >
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav
          className="flex border-t border-border/80 bg-card/95 px-2 py-2 backdrop-blur-md lg:hidden"
          aria-label="Main"
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
