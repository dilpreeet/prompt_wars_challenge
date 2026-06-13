import { buildSystemPrompt } from "@/lib/prompts";
import { loadChatContext } from "@/lib/chat-context";
import { isGeminiConfigured, streamChatCompletion } from "@/lib/gemini";
import {
  detectCrisis,
  formatHelplineMessage,
} from "@/lib/safety";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { chatRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

type StreamEvent =
  | { type: "crisis"; content: string }
  | { type: "token"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

function sseLine(payload: StreamEvent): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

/**
 * POST /api/chat
 *
 * Streams a Gemini reply as Server-Sent Events. Requires an authenticated
 * Supabase session. Persists user + assistant messages to chat_messages.
 *
 * SSE event shapes:
 *   { type: "crisis", content: string }  — helpline banner (crisis detected)
 *   { type: "token", content: string }   — streamed text chunk
 *   { type: "done" }                     — stream finished
 *   { type: "error", message: string }   — unrecoverable error
 */
export async function POST(request: Request) {
  if (!isGeminiConfigured) {
    return Response.json(
      { error: "Gemini API is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY." },
      { status: 503 },
    );
  }

  if (!isSupabaseConfigured) {
    return Response.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { message, history } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const crisis = detectCrisis(message);
  const context = await loadChatContext(supabase, user.id);
  const systemInstruction = buildSystemPrompt({
    context,
    isCrisis: crisis.isCrisis,
  });

  const { error: userInsertError } = await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "user",
    content: message,
  });

  if (userInsertError) {
    return Response.json(
      { error: "Failed to save message" },
      { status: 500 },
    );
  }

  const helplineText = crisis.isCrisis ? formatHelplineMessage() : "";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(sseLine(event)));
      };

      let assistantText = "";

      try {
        if (crisis.isCrisis) {
          send({ type: "crisis", content: helplineText });
        }

        for await (const chunk of streamChatCompletion({
          systemInstruction,
          history,
          userMessage: message,
        })) {
          assistantText += chunk;
          send({ type: "token", content: chunk });
        }

        send({ type: "done" });

        const contentToSave = crisis.isCrisis
          ? `${helplineText}\n\n${assistantText}`
          : assistantText;

        if (contentToSave.trim()) {
          await supabase.from("chat_messages").insert({
            user_id: user.id,
            role: "assistant",
            content: contentToSave,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Chat stream failed";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
