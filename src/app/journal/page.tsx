import { redirect } from "next/navigation";
import { JournalPageClient } from "@/components/journal/JournalPageClient";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { JournalEntry } from "@/types";

export const metadata = {
  title: "Journal | CalmCoach",
  description: "Daily journaling with AI analysis",
};

export default async function JournalPage() {
  if (!isSupabaseConfigured) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <JournalPageClient
      initialEntries={(rows ?? []) as JournalEntry[]}
      userEmail={user.email ?? undefined}
    />
  );
}
