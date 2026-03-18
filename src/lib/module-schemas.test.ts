import { describe, expect, it } from "vitest";

import {
  MODULE_TEXT_SECTION_MIN_LENGTH,
  adminModuleCreateSchema,
  moduleTextSectionsSchema,
} from "@/lib/module-schemas";
import { extractYoutubeVideoId } from "@/lib/youtube";

const validSection =
  "Този учебен абзац описва реален работен казус, стъпки за проверка на контекст, метод за валидиране на източника и последователност за ескалация към екипа по сигурност, така че служителят да реагира последователно и предвидимо при натиск, спешни заявки и потенциални опити за социално инженерство в ежедневна комуникация. ".repeat(
    2
  );

const buildSections = (count: number) =>
  Array.from({ length: count }, (_, idx) => `Секция ${idx + 1}: ${validSection}`);

describe("module schemas", () => {
  it("fails when text sections are fewer than 6", () => {
    const result = moduleTextSectionsSchema.safeParse(buildSections(5));
    expect(result.success).toBe(false);
  });

  it("fails when any section is shorter than minimum length", () => {
    const sections = buildSections(6);
    sections[2] = "Кратка секция";
    const result = moduleTextSectionsSchema.safeParse(sections);
    expect(result.success).toBe(false);
  });

  it("extracts youtube video id from valid links", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=M7lc1UVf-VE")).toBe("M7lc1UVf-VE");
    expect(extractYoutubeVideoId("https://youtu.be/M7lc1UVf-VE")).toBe("M7lc1UVf-VE");
    expect(extractYoutubeVideoId("https://www.youtube.com/embed/M7lc1UVf-VE")).toBe("M7lc1UVf-VE");
  });

  it("rejects invalid youtube links", () => {
    expect(extractYoutubeVideoId("https://example.com/video")).toBeNull();
  });

  it("accepts valid module payload with 6 long sections and youtube metadata", () => {
    const result = adminModuleCreateSchema.safeParse({
      title: "Курс по защита на акаунти",
      category: "PHISHING",
      isMini: false,
      order: 20,
      durationMinutes: 8,
      videoDurationSec: 480,
      videoYoutubeUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      videoMockFileName: "demo-video.mp4",
      videoMockFileSizeMb: 18.2,
      questionCount: 10,
      passThresholdPercent: 80,
      description: "Пълен курс за безопасно поведение при рискови имейли.",
      bulletPoints: ["Проверка", "Докладване"],
      textSections: buildSections(6),
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.textSections).toHaveLength(6);
    expect(result.data.textSections.every((section) => section.length >= MODULE_TEXT_SECTION_MIN_LENGTH)).toBe(
      true
    );
    expect(result.data.videoYoutubeUrl).toBe("https://www.youtube.com/watch?v=M7lc1UVf-VE");
    expect(result.data.videoYoutubeId).toBe("M7lc1UVf-VE");
    expect(result.data.videoMockFileName).toBe("demo-video.mp4");
    expect(result.data.videoMockFileSizeMb).toBe(18.2);
  });

  it("fails when youtube link is invalid", () => {
    const result = adminModuleCreateSchema.safeParse({
      title: "Курс по защита на акаунти",
      category: "PHISHING",
      isMini: false,
      order: 20,
      durationMinutes: 8,
      videoDurationSec: 480,
      videoYoutubeUrl: "https://example.com/video",
      questionCount: 10,
      passThresholdPercent: 80,
      description: "Пълен курс за безопасно поведение при рискови имейли.",
      bulletPoints: ["Проверка", "Докладване"],
      textSections: buildSections(6),
    });

    expect(result.success).toBe(false);
  });
});
