import { describe, expect, it } from "vitest";

import { buildFollowUpAssignment, shouldTriggerRule } from "@/lib/adaptive";
import { AssignmentRule, Attempt, Scenario } from "@/lib/types";

const scenario: Scenario = {
  id: "scn_test",
  moduleId: "mod_test",
  category: "PHISHING",
  severity: "HIGH",
  title: "Scenario",
  prompt: "Prompt",
  timeLimitSec: 20,
};

const attemptWrong: Attempt = {
  id: "att_1",
  organizationId: "org_1",
  userId: "user_1",
  scenarioId: "scn_test",
  selectedOptionId: "opt_1",
  responseTimeMs: 21000,
  isCorrect: false,
  knowledgeScore: 30,
  reactionRiskScore: 90,
  behavioralRisk: "HIGH",
  createdAt: new Date().toISOString(),
};

const rule: AssignmentRule = {
  id: "rule_1",
  category: "PHISHING",
  trigger: "WRONG_ANSWER",
  moduleId: "mini_phishing",
  dueInDays: 7,
  retestInDays: 14,
};

describe("adaptive assignment rules", () => {
  it("triggers for wrong answer in matching category", () => {
    expect(
      shouldTriggerRule({
        rule,
        attempt: attemptWrong,
        scenario,
      })
    ).toBe(true);
  });

  it("builds assignment with due and retest dates", () => {
    const now = new Date("2026-03-07T12:00:00.000Z");
    const assignment = buildFollowUpAssignment({
      organizationId: "org_1",
      userId: "user_1",
      rule,
      reason: "Rule triggered",
      now,
    });
    expect(assignment.moduleId).toBe("mini_phishing");
    expect(assignment.status).toBe("PENDING");
    expect(assignment.dueAt).toContain("2026-03-14");
    expect(assignment.retestAt).toContain("2026-03-21");
  });
});
