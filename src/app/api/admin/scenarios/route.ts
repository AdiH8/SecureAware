import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { createAdminScenario, listAdminScenarios } from "@/lib/data/store";

const createSchema = z.object({
  moduleId: z.string().trim().min(2),
  category: z.enum(["PHISHING", "URL", "SOCIAL_ENGINEERING", "MALWARE"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  title: z.string().trim().min(2),
  prompt: z.string().trim().min(5),
  timeLimitSec: z.number().int().min(5).max(120),
});

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  return NextResponse.json({ scenarios: listAdminScenarios() });
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
    const scenario = await createAdminScenario(parsed.data);
    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    return apiError(error, "Неуспешно създаване на сценарий.");
  }
}

