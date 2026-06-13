export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether the public Supabase env vars are present. Used to gracefully degrade
 * (e.g. skip auth/session work) before the project has been configured, so the
 * app never hard-crashes during local dev or the first deploy.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
