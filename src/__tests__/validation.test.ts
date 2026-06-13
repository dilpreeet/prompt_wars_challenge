import { describe, expect, it } from "vitest";
import {
  chatRequestSchema,
  journalCreateSchema,
  moodLogSchema,
  ttsRequestSchema,
} from "@/lib/validation";

describe("chatRequestSchema", () => {
  it("accepts a valid chat payload", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello CalmCoach",
      history: [{ role: "user", content: "Hi" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages", () => {
    const result = chatRequestSchema.safeParse({ message: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects oversized messages", () => {
    const result = chatRequestSchema.safeParse({
      message: "a".repeat(4001),
    });
    expect(result.success).toBe(false);
  });
});

describe("journalCreateSchema", () => {
  it("accepts a valid journal entry", () => {
    const result = journalCreateSchema.safeParse({
      content: "Today was hard but I studied for 3 hours.",
      mood_score: 6,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty journal content", () => {
    const result = journalCreateSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects oversized journal content", () => {
    const result = journalCreateSchema.safeParse({
      content: "x".repeat(8001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects mood scores outside 1–10", () => {
    expect(
      journalCreateSchema.safeParse({ content: "Valid", mood_score: 0 }).success,
    ).toBe(false);
    expect(
      journalCreateSchema.safeParse({ content: "Valid", mood_score: 11 }).success,
    ).toBe(false);
  });
});

describe("moodLogSchema", () => {
  it("accepts a valid mood log", () => {
    const result = moodLogSchema.safeParse({
      mood: "Anxious",
      energy: 2,
      stress: 4,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty mood label", () => {
    const result = moodLogSchema.safeParse({ mood: "  " });
    expect(result.success).toBe(false);
  });
});

describe("ttsRequestSchema", () => {
  it("rejects empty TTS text", () => {
    const result = ttsRequestSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("rejects text over 2000 characters", () => {
    const result = ttsRequestSchema.safeParse({ text: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });
});
