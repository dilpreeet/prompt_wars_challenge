import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { getInsights } from "@/lib/insights";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "CalmCoach — Mental Wellness Tracker",
  description:
    "GenAI-powered mental wellness companion for Indian exam aspirants",
};

export default async function HomePage() {
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

  const insights = await getInsights(supabase, user.id);

  return (
    <DashboardView insights={insights} userEmail={user.email} />
  );
}
