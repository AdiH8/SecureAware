import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { setAdminRuleArchived, updateAdminRule } from "@/lib/data/store";

const updateSchema = z.object({
  category: z.enum(["PHISHING", "URL", "SOCIAL_ENGINEERING", "MALWARE"]).optional(),
  trigger: z.enum(["WRONG_ANSWER", "HIGH_REACTION_RISK"]).optional(),
  moduleId: z.string().trim().min(2).optional(),
  dueInDays: z.number().int().min(1).max(90).optional(),
  retestInDays: z.number().int().min(1).max(180).optional(),
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
      const rule = await setAdminRuleArchived(id, parsed.data.isArchived);
      return NextResponse.json({ rule });
    }

    const rule = await updateAdminRule(id, parsed.data);
    return NextResponse.json({ rule });
  } catch (error) {
    return apiError(error, "Неуспешна редакция на правило.");
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
    const rule = await setAdminRuleArchived(id, true);
    return NextResponse.json({ rule });
  } catch (error) {
    return apiError(error, "Неуспешно архивиране на правило.");
  }
}

