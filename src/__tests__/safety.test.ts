import { describe, expect, it } from "vitest";
import {
  CRISIS_HELPLINES,
  detectCrisis,
  formatHelplineMessage,
} from "@/lib/safety";

describe("detectCrisis", () => {
  it("flags explicit self-harm and suicide language", () => {
    expect(detectCrisis("I want to kill myself").isCrisis).toBe(true);
    expect(detectCrisis("I've been feeling suicidal lately").isCrisis).toBe(
      true,
    );
    expect(detectCrisis("I don't want to live anymore").isCrisis).toBe(true);
    expect(detectCrisis("I can't go on like this").isCrisis).toBe(true);
    expect(detectCrisis("thinking about self-harm").isCrisis).toBe(true);
  });

  it("does not flag normal exam-stress messages", () => {
    expect(detectCrisis("I'm stressed about NEET revision").isCrisis).toBe(
      false,
    );
    expect(detectCrisis("Failed my mock test again, feeling low").isCrisis).toBe(
      false,
    );
    expect(detectCrisis("Need motivation for JEE prep").isCrisis).toBe(false);
    expect(detectCrisis("").isCrisis).toBe(false);
    expect(detectCrisis("   ").isCrisis).toBe(false);
  });

  it("returns matched pattern when crisis is detected", () => {
    const result = detectCrisis("I want to end it all");
    expect(result.isCrisis).toBe(true);
    expect(result.matchedPattern).toBeTruthy();
  });
});

describe("formatHelplineMessage", () => {
  it("includes India crisis helpline numbers", () => {
    const message = formatHelplineMessage();
    for (const helpline of CRISIS_HELPLINES) {
      expect(message).toContain(helpline.number);
      expect(message).toContain(helpline.name);
    }
    expect(message).toContain("112");
  });
});
