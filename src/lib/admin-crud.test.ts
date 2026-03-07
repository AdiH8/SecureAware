import { beforeEach, describe, expect, it } from "vitest";

import {
  createAdminModule,
  createAdminOption,
  listAdminQuestions,
  listAdminUsers,
  listDemoUsersByRole,
  markLearningContentComplete,
  resetStoreForTests,
  setAdminUserArchived,
  startTestSession,
  updateAdminModule,
} from "@/lib/data/store";

describe("admin CRUD behavior", () => {
  const longSection = "Този раздел описва реална работна ситуация, проверка на контекст, техническа валидация и стъпки за ескалация към екипа по сигурност, така че служителят да може да реагира последователно при натиск и да намали риска от грешка в ежедневната комуникация. ".repeat(
    2
  );

  const buildSections = (count: number) =>
    Array.from({ length: count }, (_, idx) => `Секция ${idx + 1}: ${longSection}`);

  beforeEach(() => {
    resetStoreForTests();
  });

  it("enforces single correct option per question", async () => {
    const question = listAdminQuestions("mod_phishing_core")[0];
    expect(question).toBeDefined();

    const created = await createAdminOption({
      questionId: question.id,
      label: "Z",
      text: "Тестова опция",
      isCorrect: true,
    });

    const updatedQuestion = listAdminQuestions("mod_phishing_core").find((item) => item.id === question.id);
    const correctOptions = (updatedQuestion?.options ?? []).filter((option) => option.isCorrect);

    expect(correctOptions).toHaveLength(1);
    expect(correctOptions[0]?.id).toBe(created.id);
  });

  it("filters archived users from active selectors", async () => {
    const employee = listAdminUsers().find((user) => user.role === "EMPLOYEE");
    expect(employee).toBeDefined();

    await setAdminUserArchived(employee!.id, true);
    const activeEmployees = listDemoUsersByRole("EMPLOYEE");

    expect(activeEmployees.some((user) => user.id === employee!.id)).toBe(false);
  });

  it("uses module questionCount and passThreshold for test sessions", async () => {
    const userId = "usr_emp_1";
    const moduleId = "mod_phishing_core";

    await updateAdminModule(moduleId, { questionCount: 3, passThresholdPercent: 70 });
    markLearningContentComplete({ userId, moduleId, mode: "VIDEO" });

    const session = startTestSession({ userId, moduleId });

    expect(session.totalQuestions).toBe(3);
    expect(session.passThreshold).toBe(70);
  });

  it("rejects module creation when text sections are less than 6", async () => {
    await expect(
      createAdminModule({
        title: "Тестов курс с кратък материал",
        category: "PHISHING",
        isMini: false,
        order: 777,
        durationMinutes: 8,
        videoDurationSec: 480,
        videoMockFileName: null,
        videoMockFileSizeMb: null,
        questionCount: 10,
        passThresholdPercent: 80,
        description: "Проверка на валидацията за минимален брой секции.",
        bulletPoints: ["Проверка", "Докладване"],
        textSections: buildSections(5),
      })
    ).rejects.toThrow("поне 6 секции");
  });

  it("stores and updates mock video metadata for modules", async () => {
    const created = await createAdminModule({
      title: "Тестов курс за mock видео",
      category: "URL",
      isMini: false,
      order: 778,
      durationMinutes: 9,
      videoDurationSec: 540,
      videoMockFileName: "security-demo.mp4",
      videoMockFileSizeMb: 42.75,
      questionCount: 10,
      passThresholdPercent: 80,
      description: "Съдържателен курс за проверка на видео metadata полета.",
      bulletPoints: ["Проверка на домейн", "Ескалация при риск"],
      textSections: buildSections(6),
    });

    expect(created.videoMockFileName).toBe("security-demo.mp4");
    expect(created.videoMockFileSizeMb).toBe(42.75);
    expect(created.textSections).toHaveLength(6);

    const updated = await updateAdminModule(created.id, {
      videoMockFileName: null,
      videoMockFileSizeMb: null,
    });

    expect(updated.videoMockFileName).toBeNull();
    expect(updated.videoMockFileSizeMb).toBeNull();
  });
});

