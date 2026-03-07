import {
  AttemptResult,
  RiskBand,
  Scenario,
  ScenarioOption,
  ScenarioSeverity,
} from "@/lib/types";

const severityPenalty: Record<ScenarioSeverity, number> = {
  LOW: 5,
  MEDIUM: 10,
  HIGH: 18,
  CRITICAL: 25,
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(value)));

export function classifyRiskBand(knowledgeScore: number, reactionRiskScore: number): RiskBand {
  const blended = (knowledgeScore + (100 - reactionRiskScore)) / 2;
  if (blended < 50) {
    return "HIGH";
  }
  if (blended < 75) {
    return "MEDIUM";
  }
  return "SECURE";
}

export function computeAttemptResult(input: {
  scenario: Scenario;
  selectedOption: ScenarioOption | null;
  responseTimeMs: number;
}): Omit<AttemptResult, "followUpAssigned"> {
  const { scenario, selectedOption, responseTimeMs } = input;
  const responseTimeSec = responseTimeMs / 1000;
  const limit = Math.max(scenario.timeLimitSec, 1);
  const timeRatio = responseTimeSec / limit;

  const optionWeight = selectedOption?.weight ?? 1;
  const isCorrect = selectedOption?.isCorrect ?? false;

  const knowledgeBase = isCorrect
    ? 92 - severityPenalty[scenario.severity] * 0.5 + optionWeight * 2
    : 35 - severityPenalty[scenario.severity] + optionWeight * -6;
  const knowledgeScore = clamp(knowledgeBase);

  const timePressureRisk = clamp((timeRatio - 0.35) * 75);
  const incorrectPenalty = isCorrect ? 0 : 35;
  const riskyActionPenalty =
    selectedOption?.actionType === "OPEN_ATTACHMENT" ||
    selectedOption?.actionType === "SHARE_OTP" ||
    selectedOption?.actionType === "CLICK_LINK"
      ? 22
      : 0;
  const reactionRiskScore = clamp(timePressureRisk + incorrectPenalty + riskyActionPenalty);

  const behavioralRisk = classifyRiskBand(knowledgeScore, reactionRiskScore);

  return {
    knowledgeScore,
    reactionRiskScore,
    behavioralRisk,
    explanation:
      selectedOption?.explanation ??
      "Не е избран отговор. При реална атака липсата на реакция увеличава риска.",
  };
}
