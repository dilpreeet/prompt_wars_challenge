import { redirect } from "next/navigation";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { ChatUIMessage } from "@/components/chat/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Chat | CalmCoach",
  description: "Talk to your mental wellness companion",
};

export default async function ChatPage() {
  if (!isSupabaseConfigured) {
    return <ChatWindow initialMessages={[]} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .order("created_at", { ascending: true })
    .limit(50);

  const initialMessages: ChatUIMessage[] = (rows ?? []).map((row) => ({
    id: row.id,
    role: row.role as "user" | "assistant",
    content: row.content,
  }));

  return <ChatWindow initialMessages={initialMessages} />;
}
