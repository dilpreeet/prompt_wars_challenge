import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/prompts";

describe("buildSystemPrompt", () => {
  it("includes CalmCoach persona and exam context", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("CalmCoach");
    expect(prompt).toContain("NEET");
    expect(prompt).toContain("JEE");
    expect(prompt).toContain("exam aspirants");
  });

  it("includes safety instructions and helplines", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("Never provide instructions for self-harm");
    expect(prompt).toContain("Tele-MANAS 14416");
    expect(prompt).toContain("AASRA 9820466726");
    expect(prompt).toContain("Never diagnose conditions");
  });

  it("adds crisis mode instructions when isCrisis is true", () => {
    const prompt = buildSystemPrompt({ isCrisis: true });
    expect(prompt).toContain("CRISIS MODE");
    expect(prompt).toContain("grounding");
  });

  it("includes user context when mood and journal data provided", () => {
    const prompt = buildSystemPrompt({
      context: {
        recentMoods: [
          {
            mood: "Anxious",
            energy: 2,
            stress: 4,
            note: "Mock test tomorrow",
            created_at: "2026-06-13T00:00:00Z",
          },
        ],
        recentJournals: [
          {
            content: "Feeling overwhelmed with syllabus backlog.",
            mood_score: 4,
            ai_analysis: {
              stressTriggers: ["backlog", "mock tests"],
              emotions: ["anxiety"],
              moodScore: 4,
              suggestion: "Break revision into 25-minute blocks.",
            },
            created_at: "2026-06-12T00:00:00Z",
          },
        ],
      },
    });

    expect(prompt).toContain("Recent mood logs");
    expect(prompt).toContain("Anxious");
    expect(prompt).toContain("Recent journal snippets");
    expect(prompt).toContain("backlog");
  });
});
