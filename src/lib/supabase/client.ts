import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Supabase client for use in Client Components (browser). Safe to expose: it
 * only ever uses the public anon key, and Row Level Security enforces access.
 */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
