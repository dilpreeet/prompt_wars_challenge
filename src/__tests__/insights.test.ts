import { describe, expect, it } from "vitest";
import { aggregateTriggers, aggregateEmotions, computeStressTrend } from "@/lib/insights";
import type { JournalEntry } from "@/types";

function makeEntry(stressTriggers: string[], emotions: string[]): JournalEntry {
  return {
    id: crypto.randomUUID(),
    user_id: "user-1",
    content: "test entry",
    mood_score: 5,
    ai_analysis: {
      stressTriggers,
      emotions,
      moodScore: 5,
      suggestion: "Take a break.",
    },
    created_at: new Date().toISOString(),
  };
}

function makeEntryNoAnalysis(): JournalEntry {
  return {
    id: crypto.randomUUID(),
    user_id: "user-1",
    content: "test",
    mood_score: null,
    ai_analysis: null,
    created_at: new Date().toISOString(),
  };
}

describe("aggregateTriggers", () => {
  it("counts the same trigger appearing across multiple entries", () => {
    const entries = [
      makeEntry(["exam pressure", "time management"], []),
      makeEntry(["exam pressure"], []),
      makeEntry(["sleep deprivation"], []),
    ];
    const result = aggregateTriggers(entries);
    const examTrigger = result.find((t) => t.trigger.toLowerCase() === "exam pressure");
    expect(examTrigger?.count).toBe(2);
  });

  it("is case-insensitive — 'Exam Pressure' and 'exam pressure' merge", () => {
    const entries = [
      makeEntry(["Exam Pressure"], []),
      makeEntry(["exam pressure"], []),
    ];
    const result = aggregateTriggers(entries);
    expect(result).toHaveLength(1);
    expect(result[0]?.count).toBe(2);
  });

  it("returns an empty array when all entries have no analysis", () => {
    expect(aggregateTriggers([makeEntryNoAnalysis()])).toEqual([]);
  });

  it("returns an empty array for an empty input", () => {
    expect(aggregateTriggers([])).toEqual([]);
  });

  it("sorts results by frequency descending", () => {
    const entries = [
      makeEntry(["a"], []),
      makeEntry(["b"], []),
      makeEntry(["b"], []),
      makeEntry(["b"], []),
      makeEntry(["a"], []),
    ];
    const result = aggregateTriggers(entries);
    expect(result[0]!.trigger.toLowerCase()).toBe("b");
    expect(result[0]!.count).toBe(3);
  });

  it("capitalises the first letter of each trigger label", () => {
    const entries = [makeEntry(["exam pressure"], [])];
    const result = aggregateTriggers(entries);
    expect(result[0]?.trigger).toBe("Exam pressure");
  });

  it("returns at most 8 results", () => {
    const triggers = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    const entries = triggers.map((t) => makeEntry([t], []));
    const result = aggregateTriggers(entries);
    expect(result.length).toBeLessThanOrEqual(8);
  });

  it("ignores blank/whitespace trigger strings", () => {
    const entries = [makeEntry(["  ", "", "exam pressure"], [])];
    const result = aggregateTriggers(entries);
    expect(result.every((t) => t.trigger.trim().length > 0)).toBe(true);
  });
});

describe("aggregateEmotions", () => {
  it("counts the same emotion appearing across multiple entries", () => {
    const entries = [
      makeEntry([], ["anxious", "fatigued"]),
      makeEntry([], ["anxious"]),
      makeEntry([], ["sad"]),
    ];
    const result = aggregateEmotions(entries);
    const anxious = result.find((e) => e.trigger.toLowerCase() === "anxious");
    expect(anxious?.count).toBe(2);
  });

  it("returns an empty array when no entries have emotions", () => {
    const entries = [makeEntry(["exam"], [])];
    expect(aggregateEmotions(entries)).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(aggregateEmotions([])).toEqual([]);
  });

  it("sorts by frequency descending", () => {
    const entries = [
      makeEntry([], ["sad", "anxious", "anxious"]),
      makeEntry([], ["anxious"]),
    ];
    const result = aggregateEmotions(entries);
    expect(result[0]!.trigger.toLowerCase()).toBe("anxious");
    expect(result[0]!.count).toBe(3);
  });

  it("returns at most 6 results", () => {
    const emotions = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const entries = emotions.map((e) => makeEntry([], [e]));
    const result = aggregateEmotions(entries);
    expect(result.length).toBeLessThanOrEqual(6);
  });
});

describe("computeStressTrend", () => {
  it("returns 'insufficient' when fewer than 4 data points", () => {
    expect(computeStressTrend([3, 4, 5])).toBe("insufficient");
    expect(computeStressTrend([])).toBe("insufficient");
    expect(computeStressTrend([null, null, null, null])).toBe("insufficient");
  });

  it("returns 'rising' when recent stress significantly higher than prior", () => {
    // prior avg = 2, recent avg = 4.67 → delta > 0.4
    expect(computeStressTrend([1, 2, 3, 4, 5, 5])).toBe("rising");
  });

  it("returns 'easing' when recent stress significantly lower than prior", () => {
    // prior avg = 5, recent avg = 1.67 → delta < -0.4
    expect(computeStressTrend([5, 5, 5, 1, 2, 2])).toBe("easing");
  });

  it("returns 'stable' when delta within ±0.4", () => {
    expect(computeStressTrend([3, 3, 3, 3, 3, 3])).toBe("stable");
  });

  it("ignores null values when computing averages", () => {
    // [null, 3, null, 3, null, 3] — only 3 non-null → insufficient
    expect(computeStressTrend([null, 3, null, 3, null, 3])).toBe("insufficient");
  });
});
