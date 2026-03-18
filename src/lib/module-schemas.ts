import { z } from "zod";

import { extractYoutubeVideoId } from "@/lib/youtube";

export const MODULE_TEXT_SECTIONS_MIN_COUNT = 6;
export const MODULE_TEXT_SECTION_MIN_LENGTH = 350;

const textSectionSchema = z
  .string()
  .trim()
  .min(
    MODULE_TEXT_SECTION_MIN_LENGTH,
    `Всяка текстова секция трябва да е поне ${MODULE_TEXT_SECTION_MIN_LENGTH} символа.`
  );

export const moduleTextSectionsSchema = z
  .array(textSectionSchema)
  .min(
    MODULE_TEXT_SECTIONS_MIN_COUNT,
    `Текстовият материал трябва да съдържа поне ${MODULE_TEXT_SECTIONS_MIN_COUNT} секции.`
  );

const videoMockFileNameSchema = z.string().trim().min(1).nullable().optional();
const videoMockFileSizeSchema = z.number().nonnegative().nullable().optional();
const rawYoutubeUrlSchema = z.union([z.string(), z.null()]).optional();

function normalizeYoutubeInput<T extends { videoYoutubeUrl?: string | null }>(data: T) {
  const normalizedUrl = Object.prototype.hasOwnProperty.call(data, "videoYoutubeUrl")
    ? data.videoYoutubeUrl?.trim() || null
    : undefined;

  return {
    ...data,
    videoYoutubeUrl: normalizedUrl,
    videoYoutubeId:
      normalizedUrl === undefined ? undefined : normalizedUrl ? extractYoutubeVideoId(normalizedUrl) : null,
  };
}

export const adminModuleCreateSchema = z.object({
  title: z.string().trim().min(2),
  category: z.enum(["PHISHING", "URL", "SOCIAL_ENGINEERING", "MALWARE"]),
  isMini: z.boolean(),
  order: z.number().int().nonnegative(),
  durationMinutes: z.number().int().positive(),
  videoDurationSec: z.number().int().positive(),
  videoYoutubeUrl: rawYoutubeUrlSchema,
  videoMockFileName: videoMockFileNameSchema,
  videoMockFileSizeMb: videoMockFileSizeSchema,
  questionCount: z.number().int().min(1).max(50),
  passThresholdPercent: z.number().int().min(1).max(100),
  description: z.string().trim().min(5),
  bulletPoints: z.array(z.string().trim().min(1)).min(1),
  textSections: moduleTextSectionsSchema,
}).superRefine((data, ctx) => {
  const normalizedUrl = data.videoYoutubeUrl?.trim();
  if (normalizedUrl && !extractYoutubeVideoId(normalizedUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["videoYoutubeUrl"],
      message: "Въведи валиден YouTube линк.",
    });
  }
}).transform((data) => normalizeYoutubeInput(data));

export const adminModuleUpdateSchema = z.object({
  title: z.string().trim().min(2).optional(),
  category: z.enum(["PHISHING", "URL", "SOCIAL_ENGINEERING", "MALWARE"]).optional(),
  isMini: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
  durationMinutes: z.number().int().positive().optional(),
  videoDurationSec: z.number().int().positive().optional(),
  videoYoutubeUrl: rawYoutubeUrlSchema,
  videoMockFileName: videoMockFileNameSchema,
  videoMockFileSizeMb: videoMockFileSizeSchema,
  questionCount: z.number().int().min(1).max(50).optional(),
  passThresholdPercent: z.number().int().min(1).max(100).optional(),
  description: z.string().trim().min(5).optional(),
  bulletPoints: z.array(z.string().trim().min(1)).min(1).optional(),
  textSections: moduleTextSectionsSchema.optional(),
  isArchived: z.boolean().optional(),
}).superRefine((data, ctx) => {
  const normalizedUrl = data.videoYoutubeUrl?.trim();
  if (normalizedUrl && !extractYoutubeVideoId(normalizedUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["videoYoutubeUrl"],
      message: "Въведи валиден YouTube линк.",
    });
  }
}).transform((data) => normalizeYoutubeInput(data));
