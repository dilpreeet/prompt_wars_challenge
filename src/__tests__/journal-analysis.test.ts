import { describe, expect, it } from "vitest";
import { getFallbackAnalysis, journalAnalysisSchema } from "@/lib/journal-analysis";

describe("getFallbackAnalysis", () => {
  it("returns a structure that passes the Zod schema", () => {
    const result = getFallbackAnalysis("I'm stressed about my NEET exam tomorrow.");
    const parsed = journalAnalysisSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("detects exam pressure as a trigger from exam keywords", () => {
    const result = getFallbackAnalysis("I haven't finished the syllabus and the mock test is tomorrow.");
    expect(result.stressTriggers).toContain("exam pressure");
  });

  it("detects family expectations from parental pressure keywords", () => {
    const result = getFallbackAnalysis("My parents have very high expectations from me for JEE.");
    expect(result.stressTriggers).toContain("family expectations");
  });

  it("detects sleep deprivation trigger", () => {
    const result = getFallbackAnalysis("I'm so tired — I've barely slept in three days.");
    expect(result.stressTriggers).toContain("sleep deprivation");
  });

  it("detects time management trigger from deadline keywords", () => {
    const result = getFallbackAnalysis("I'm way behind schedule and can't catch up on the backlog.");
    expect(result.stressTriggers).toContain("time management");
  });

  it("detects anxious emotion", () => {
    const result = getFallbackAnalysis("I'm really nervous and anxious about the result.");
    expect(result.emotions).toContain("anxious");
  });

  it("detects fatigued emotion", () => {
    const result = getFallbackAnalysis("Feeling completely burned out and exhausted.");
    expect(result.emotions).toContain("fatigued");
  });

  it("detects overwhelmed emotion", () => {
    const result = getFallbackAnalysis("There is just too much to cover, I feel overwhelmed.");
    expect(result.emotions).toContain("overwhelmed");
  });

  it("always returns at least one trigger and one emotion for empty-ish input", () => {
    const result = getFallbackAnalysis("abc xyz");
    expect(result.stressTriggers.length).toBeGreaterThan(0);
    expect(result.emotions.length).toBeGreaterThan(0);
  });

  it("mood score stays within 1–10 for very negative content", () => {
    const result = getFallbackAnalysis(
      "terrible bad stress anxious fail can't can't can't hate hate worst",
    );
    expect(result.moodScore).toBeGreaterThanOrEqual(1);
    expect(result.moodScore).toBeLessThanOrEqual(10);
  });

  it("mood score stays within 1–10 for very positive content", () => {
    const result = getFallbackAnalysis(
      "great good happy confident ready manage success achieve well better",
    );
    expect(result.moodScore).toBeGreaterThanOrEqual(1);
    expect(result.moodScore).toBeLessThanOrEqual(10);
  });

  it("higher positive keywords yield a better mood score than high negative keywords", () => {
    const pos = getFallbackAnalysis("great happy confident success");
    const neg = getFallbackAnalysis("terrible fail stress hate");
    expect(pos.moodScore).toBeGreaterThan(neg.moodScore);
  });

  it("always returns a non-empty suggestion", () => {
    const result = getFallbackAnalysis("Just a regular day.");
    expect(result.suggestion.trim().length).toBeGreaterThan(0);
  });

  it("limits stressTriggers to at most 5 items", () => {
    const result = getFallbackAnalysis(
      "exam sleep parent rank time deadline score mark tired study",
    );
    expect(result.stressTriggers.length).toBeLessThanOrEqual(5);
  });
});

describe("journalAnalysisSchema", () => {
  it("accepts a valid analysis shape", () => {
    expect(
      journalAnalysisSchema.safeParse({
        stressTriggers: ["exam pressure"],
        emotions: ["anxious"],
        moodScore: 4,
        suggestion: "Try box breathing.",
      }).success,
    ).toBe(true);
  });

  it("rejects moodScore of 0", () => {
    expect(
      journalAnalysisSchema.safeParse({
        stressTriggers: [],
        emotions: [],
        moodScore: 0,
        suggestion: "ok",
      }).success,
    ).toBe(false);
  });

  it("rejects moodScore of 11", () => {
    expect(
      journalAnalysisSchema.safeParse({
        stressTriggers: [],
        emotions: [],
        moodScore: 11,
        suggestion: "ok",
      }).success,
    ).toBe(false);
  });

  it("rejects suggestion exceeding 1000 characters", () => {
    expect(
      journalAnalysisSchema.safeParse({
        stressTriggers: [],
        emotions: [],
        moodScore: 5,
        suggestion: "x".repeat(1001),
      }).success,
    ).toBe(false);
  });

  it("accepts empty stressTriggers and emotions arrays", () => {
    expect(
      journalAnalysisSchema.safeParse({
        stressTriggers: [],
        emotions: [],
        moodScore: 5,
        suggestion: "Keep going.",
      }).success,
    ).toBe(true);
  });
});
