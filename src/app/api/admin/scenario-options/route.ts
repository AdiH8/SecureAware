import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { createAdminScenarioOption, listAdminScenarioOptions } from "@/lib/data/store";

const createSchema = z.object({
  scenarioId: z.string().trim().min(2),
  label: z.string().trim().min(1).max(2),
  text: z.string().trim().min(1),
  isCorrect: z.boolean(),
  weight: z.number().int().min(1).max(5),
  actionType: z.enum([
    "OPEN_ATTACHMENT",
    "VERIFY_SENDER",
    "FORWARD_EMAIL",
    "REPORT_TO_IT",
    "SHARE_OTP",
    "CALL_OFFICIAL_SUPPORT",
    "CLICK_LINK",
    "IGNORE",
  ]),
  explanation: z.string().trim().min(2),
});

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const scenarioId = request.nextUrl.searchParams.get("scenarioId");
  const options = listAdminScenarioOptions().filter((item) =>
    scenarioId ? item.scenarioId === scenarioId : true
  );
  return NextResponse.json({ options });
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
    const option = await createAdminScenarioOption(parsed.data);
    return NextResponse.json({ option }, { status: 201 });
  } catch (error) {
    return apiError(error, "Неуспешно създаване на опция за сценарий.");
  }
}

