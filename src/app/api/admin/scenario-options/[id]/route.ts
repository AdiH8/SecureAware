import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { setAdminScenarioOptionArchived, updateAdminScenarioOption } from "@/lib/data/store";

const updateSchema = z.object({
  scenarioId: z.string().trim().min(2).optional(),
  label: z.string().trim().min(1).max(2).optional(),
  text: z.string().trim().min(1).optional(),
  isCorrect: z.boolean().optional(),
  weight: z.number().int().min(1).max(5).optional(),
  actionType: z
    .enum([
      "OPEN_ATTACHMENT",
      "VERIFY_SENDER",
      "FORWARD_EMAIL",
      "REPORT_TO_IT",
      "SHARE_OTP",
      "CALL_OFFICIAL_SUPPORT",
      "CLICK_LINK",
      "IGNORE",
    ])
    .optional(),
  explanation: z.string().trim().min(2).optional(),
  isArchived: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    if (typeof parsed.data.isArchived === "boolean") {
      const option = await setAdminScenarioOptionArchived(id, parsed.data.isArchived);
      return NextResponse.json({ option });
    }

    const option = await updateAdminScenarioOption(id, parsed.data);
    return NextResponse.json({ option });
  } catch (error) {
    return apiError(error, "Неуспешна редакция на опция за сценарий.");
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const { id } = await context.params;
  try {
    const option = await setAdminScenarioOptionArchived(id, true);
    return NextResponse.json({ option });
  } catch (error) {
    return apiError(error, "Неуспешно архивиране на опция за сценарий.");
  }
}

