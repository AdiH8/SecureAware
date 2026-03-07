import { LearningProgress, TestOption } from "@/lib/types";

export function isTestUnlocked(progress: Pick<LearningProgress, "videoCompleted" | "textCompleted">): boolean {
  return progress.videoCompleted || progress.textCompleted;
}

export function evaluateTestScore(params: {
  correctCount: number;
  total: number;
  thresholdPercent: number;
}) {
  const { correctCount, total, thresholdPercent } = params;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return {
    scorePercent,
    passed: scorePercent >= thresholdPercent,
  };
}

export function isSelectedAnswerCorrect(options: TestOption[], selectedOptionId: string): boolean {
  const selected = options.find((option) => option.id === selectedOptionId);
  return Boolean(selected?.isCorrect);
}
