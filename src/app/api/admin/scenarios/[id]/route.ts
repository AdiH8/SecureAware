import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { setAdminScenarioArchived, updateAdminScenario } from "@/lib/data/store";

const updateSchema = z.object({
  moduleId: z.string().trim().min(2).optional(),
  category: z.enum(["PHISHING", "URL", "SOCIAL_ENGINEERING", "MALWARE"]).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  title: z.string().trim().min(2).optional(),
  prompt: z.string().trim().min(5).optional(),
  timeLimitSec: z.number().int().min(5).max(120).optional(),
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
      const scenario = await setAdminScenarioArchived(id, parsed.data.isArchived);
      return NextResponse.json({ scenario });
    }
    const scenario = await updateAdminScenario(id, parsed.data);
    return NextResponse.json({ scenario });
  } catch (error) {
    return apiError(error, "Неуспешна редакция на сценарий.");
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
    const scenario = await setAdminScenarioArchived(id, true);
    return NextResponse.json({ scenario });
  } catch (error) {
    return apiError(error, "Неуспешно архивиране на сценарий.");
  }
}

