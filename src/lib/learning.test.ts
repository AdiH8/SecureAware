import { describe, expect, it } from "vitest";

import { evaluateTestScore, isSelectedAnswerCorrect, isTestUnlocked } from "@/lib/learning";
import { TestOption } from "@/lib/types";

describe("learning helpers", () => {
  it("keeps test locked until video or text is marked done", () => {
    expect(isTestUnlocked({ videoCompleted: false, textCompleted: false })).toBe(false);
    expect(isTestUnlocked({ videoCompleted: true, textCompleted: false })).toBe(true);
    expect(isTestUnlocked({ videoCompleted: false, textCompleted: true })).toBe(true);
  });

  it("applies pass threshold correctly at 80%", () => {
    const pass = evaluateTestScore({
      correctCount: 8,
      total: 10,
      thresholdPercent: 80,
    });
    const fail = evaluateTestScore({
      correctCount: 7,
      total: 10,
      thresholdPercent: 80,
    });
    expect(pass.passed).toBe(true);
    expect(pass.scorePercent).toBe(80);
    expect(fail.passed).toBe(false);
    expect(fail.scorePercent).toBe(70);
  });

  it("validates image question answer same as standard multiple choice", () => {
    const options: TestOption[] = [
      { id: "o1", questionId: "q_img_1", label: "A", text: "Wrong", isCorrect: false, isArchived: false, archivedAt: null, updatedAt: "2026-03-07T00:00:00.000Z" },
      { id: "o2", questionId: "q_img_1", label: "B", text: "Correct", isCorrect: true, isArchived: false, archivedAt: null, updatedAt: "2026-03-07T00:00:00.000Z" },
    ];
    expect(isSelectedAnswerCorrect(options, "o2")).toBe(true);
    expect(isSelectedAnswerCorrect(options, "o1")).toBe(false);
  });
});


