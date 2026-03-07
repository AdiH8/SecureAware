import { describe, expect, it } from "vitest";

import { computeAttemptResult } from "@/lib/risk-engine";
import { Scenario, ScenarioOption } from "@/lib/types";

const scenario: Scenario = {
  id: "scn_1",
  moduleId: "mod_1",
  category: "PHISHING",
  severity: "HIGH",
  title: "Test",
  prompt: "Test prompt",
  timeLimitSec: 20,
};

const correctOption: ScenarioOption = {
  id: "opt_correct",
  scenarioId: "scn_1",
  label: "D",
  text: "Report",
  isCorrect: true,
  weight: 5,
  actionType: "REPORT_TO_IT",
  explanation: "Correct action",
};

const wrongOption: ScenarioOption = {
  id: "opt_wrong",
  scenarioId: "scn_1",
  label: "A",
  text: "Open attachment",
  isCorrect: false,
  weight: 1,
  actionType: "OPEN_ATTACHMENT",
  explanation: "Wrong action",
};

describe("risk engine", () => {
  it("returns secure behavior for correct and fast action", () => {
    const result = computeAttemptResult({
      scenario,
      selectedOption: correctOption,
      responseTimeMs: 6500,
    });
    expect(result.knowledgeScore).toBeGreaterThanOrEqual(75);
    expect(result.reactionRiskScore).toBeLessThan(50);
    expect(result.behavioralRisk).toBe("SECURE");
  });

  it("returns high risk for dangerous wrong action", () => {
    const result = computeAttemptResult({
      scenario,
      selectedOption: wrongOption,
      responseTimeMs: 28000,
    });
    expect(result.knowledgeScore).toBeLessThan(50);
    expect(result.reactionRiskScore).toBeGreaterThanOrEqual(70);
    expect(result.behavioralRisk).toBe("HIGH");
  });
});
