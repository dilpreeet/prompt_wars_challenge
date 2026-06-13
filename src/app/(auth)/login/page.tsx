import { redirect } from "next/navigation";
import { LoginPageClient } from "@/app/(auth)/login/login-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function LoginPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/");
    }
  }

  return (
    <main id="main-content" className="min-h-svh app-surface">
      <LoginPageClient />
    </main>
  );
}
