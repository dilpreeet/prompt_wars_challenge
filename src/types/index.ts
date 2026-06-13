export type ChatRole = "user" | "assistant";

/** Structured analysis produced by Gemini for a journal entry. */
export interface JournalAnalysis {
  stressTriggers: string[];
  emotions: string[];
  moodScore: number;
  suggestion: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood_score: number | null;
  ai_analysis: JournalAnalysis | null;
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  mood: string;
  energy: number | null;
  stress: number | null;
  note: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

/**
 * Minimal typed surface of the Supabase schema, usable as the generic for
 * `createClient<Database>()` so queries are type-checked against our tables.
 */
export interface Database {
  public: {
    Tables: {
      journal_entries: {
        Row: JournalEntry;
        Insert: Omit<JournalEntry, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<JournalEntry, "id" | "user_id">>;
      };
      mood_logs: {
        Row: MoodLog;
        Insert: Omit<MoodLog, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<MoodLog, "id" | "user_id">>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ChatMessage, "id" | "user_id">>;
      };
    };
  };
}
