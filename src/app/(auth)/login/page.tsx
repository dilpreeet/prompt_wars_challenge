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
    <main
      id="main-content"
      className="flex min-h-svh items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4 py-12"
    >
      <LoginPageClient />
    </main>
  );
}
