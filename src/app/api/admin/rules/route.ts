import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { createAdminRule, listAdminRules } from "@/lib/data/store";

const createSchema = z.object({
  category: z.enum(["PHISHING", "URL", "SOCIAL_ENGINEERING", "MALWARE"]),
  trigger: z.enum(["WRONG_ANSWER", "HIGH_REACTION_RISK"]),
  moduleId: z.string().trim().min(2),
  dueInDays: z.number().int().min(1).max(90),
  retestInDays: z.number().int().min(1).max(180),
});

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  return NextResponse.json({ rules: listAdminRules() });
}

export async function POST(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const rule = await createAdminRule(parsed.data);
    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    return apiError(error, "Неуспешно създаване на правило.");
  }
}

