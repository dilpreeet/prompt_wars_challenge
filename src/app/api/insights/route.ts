import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getInsights } from "@/lib/insights";

export const runtime = "nodejs";

/** GET /api/insights — mood trends and recurring stress triggers. */
export async function GET() {
  if (!isSupabaseConfigured) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const insights = await getInsights(supabase, user.id);
    return Response.json(insights);
  } catch {
    return Response.json({ error: "Failed to load insights" }, { status: 500 });
  }
}
