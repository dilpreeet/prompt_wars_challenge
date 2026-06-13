import { enforceRateLimit } from "@/lib/api-guard";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isTtsConfigured, synthesizeSpeech } from "@/lib/tts";
import { ttsRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

/** POST /api/tts — convert text to speech via ElevenLabs (auth required). */
export async function POST(request: Request) {
  if (!isTtsConfigured) {
    return Response.json(
      {
        error:
          "TTS is not configured. Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.",
      },
      { status: 503 },
    );
  }

  if (!isSupabaseConfigured) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ttsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = enforceRateLimit(user.id, "tts");
  if (rateLimited) return rateLimited;

  try {
    const audio = await synthesizeSpeech(parsed.data.text);
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "TTS failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
