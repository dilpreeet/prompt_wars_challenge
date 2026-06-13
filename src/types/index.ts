export type ChatRole = "user" | "assistant";

/** Supabase-compatible empty relationships list (avoids `never[]` inference). */
type TableRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type NoRelationships = TableRelationship[];

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

export interface MoodTrendPoint {
  date: string;
  mood: string;
  energy: number | null;
  stress: number | null;
}

export interface TriggerCount {
  trigger: string;
  count: number;
}

export interface InsightsData {
  moodTrend: MoodTrendPoint[];
  recurringTriggers: TriggerCount[];
  recurringEmotions: TriggerCount[];
  averageMoodScore: number | null;
  journalCount: number;
  latestSuggestion: string | null;
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
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          mood_score?: number | null;
          ai_analysis?: JournalAnalysis | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          mood_score?: number | null;
          ai_analysis?: JournalAnalysis | null;
        };
        Relationships: NoRelationships;
      };
      mood_logs: {
        Row: MoodLog;
        Insert: {
          id?: string;
          user_id: string;
          mood: string;
          energy?: number | null;
          stress?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          mood?: string;
          energy?: number | null;
          stress?: number | null;
          note?: string | null;
        };
        Relationships: NoRelationships;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: {
          id?: string;
          user_id: string;
          role: ChatRole;
          content: string;
          created_at?: string;
        };
        Update: {
          role?: ChatRole;
          content?: string;
        };
        Relationships: NoRelationships;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
