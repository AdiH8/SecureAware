import { beforeEach, describe, expect, it } from "vitest";

import {
  answerTestQuestion,
  finishTestSession,
  getEmployeeLearningState,
  getLearningProgressForModule,
  listLearningAuditRows,
  listTestQuestionsForModule,
  markLearningContentComplete,
  resetStoreForTests,
  startTestSession,
} from "@/lib/data/store";

describe("employee learning flow integration", () => {
  beforeEach(() => {
    resetStoreForTests();
  });

  it("handles happy path: content -> test pass -> module completion", () => {
    const userId = "usr_emp_1";
    const moduleId = "mod_phishing_core";

    const initialState = getEmployeeLearningState(userId);
    expect(initialState.nextModule?.moduleId).toBe(moduleId);

    const progress = markLearningContentComplete({
      userId,
      moduleId,
      mode: "VIDEO",
    });
    expect(progress.testUnlocked).toBe(true);

    const session = startTestSession({ userId, moduleId });
    const questions = listTestQuestionsForModule(moduleId).slice(0, session.totalQuestions);

    questions.forEach((question) => {
      const correctOption = question.options.find((option) => option.isCorrect);
      if (!correctOption) throw new Error("Missing correct option");
      answerTestQuestion({
        userId,
        sessionId: session.id,
        questionId: question.id,
        selectedOptionId: correctOption.id,
        responseTimeMs: 1800,
      });
    });

    const result = finishTestSession({ userId, sessionId: session.id });
    expect(result.passed).toBe(true);
    expect(result.scorePercent).toBeGreaterThanOrEqual(80);

    const updatedState = getEmployeeLearningState(userId);
    expect(updatedState.completedModules.some((module) => module.moduleId === moduleId)).toBe(true);
    expect(updatedState.nextModule?.moduleId).toBe("mod_url_core");
  });

  it("keeps module incomplete when score is below threshold and allows retry", () => {
    const userId = "usr_emp_2";
    const moduleId = "mod_phishing_core";

    markLearningContentComplete({
      userId,
      moduleId,
      mode: "TEXT",
    });
    const session = startTestSession({ userId, moduleId });
    const questions = listTestQuestionsForModule(moduleId).slice(0, session.totalQuestions);

    questions.forEach((question) => {
      const wrongOption = question.options.find((option) => !option.isCorrect);
      if (!wrongOption) throw new Error("Missing wrong option");
      answerTestQuestion({
        userId,
        sessionId: session.id,
        questionId: question.id,
        selectedOptionId: wrongOption.id,
        responseTimeMs: 2200,
      });
    });

    const result = finishTestSession({ userId, sessionId: session.id });
    expect(result.passed).toBe(false);
    expect(result.scorePercent).toBeLessThan(80);

    const state = getEmployeeLearningState(userId);
    expect(state.completedModules.some((module) => module.moduleId === moduleId)).toBe(false);

    const progress = getLearningProgressForModule(userId, moduleId);
    expect(progress.lastPassed).toBe(false);
    expect(progress.attemptsCount).toBe(1);
  });

  it("returns hybrid learning structure with next module and remaining list", () => {
    const state = getEmployeeLearningState("usr_emp_3");
    expect(state.nextModule).not.toBeNull();
    expect(state.remainingModules.length).toBeGreaterThanOrEqual(1);
    expect(state.modules.length).toBe(
      state.completedModules.length + state.remainingModules.length + (state.nextModule ? 1 : 0)
    );
  });

  it("tracks attempts and retakes in learning audit rows", async () => {
    const userId = "usr_emp_4";
    const moduleId = "mod_phishing_core";

    markLearningContentComplete({ userId, moduleId, mode: "TEXT" });

    const firstSession = startTestSession({ userId, moduleId });
    const questions = listTestQuestionsForModule(moduleId).slice(0, firstSession.totalQuestions);
    questions.forEach((question) => {
      const wrongOption = question.options.find((option) => !option.isCorrect);
      if (!wrongOption) throw new Error("Missing wrong option");
      answerTestQuestion({
        userId,
        sessionId: firstSession.id,
        questionId: question.id,
        selectedOptionId: wrongOption.id,
        responseTimeMs: 2100,
      });
    });
    finishTestSession({ userId, sessionId: firstSession.id });

    await new Promise((resolve) => setTimeout(resolve, 2));
    const secondSession = startTestSession({ userId, moduleId });
    const secondQuestions = listTestQuestionsForModule(moduleId).slice(0, secondSession.totalQuestions);
    secondQuestions.forEach((question) => {
      const correctOption = question.options.find((option) => option.isCorrect);
      if (!correctOption) throw new Error("Missing correct option");
      answerTestQuestion({
        userId,
        sessionId: secondSession.id,
        questionId: question.id,
        selectedOptionId: correctOption.id,
        responseTimeMs: 1700,
      });
    });
    finishTestSession({ userId, sessionId: secondSession.id });

    const rows = await listLearningAuditRows({ userId });
    const row = rows.find((item) => item.moduleId === moduleId);
    expect(row).toBeDefined();
    expect(row?.status).toBe("COMPLETED");
    expect(row?.attemptsCount).toBe(2);
    expect(row?.retakeCount).toBe(1);
    expect(row?.completionScorePercent).not.toBeNull();
  });
});


