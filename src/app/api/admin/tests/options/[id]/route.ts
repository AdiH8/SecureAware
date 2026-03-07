import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { setAdminOptionArchived, updateAdminOption } from "@/lib/data/store";

const updateSchema = z.object({
  questionId: z.string().trim().min(2).optional(),
  label: z.string().trim().min(1).max(2).optional(),
  text: z.string().trim().min(1).optional(),
  isCorrect: z.boolean().optional(),
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
      const option = await setAdminOptionArchived(id, parsed.data.isArchived);
      return NextResponse.json({ option });
    }
    const option = await updateAdminOption(id, parsed.data);
    return NextResponse.json({ option });
  } catch (error) {
    return apiError(error, "Неуспешна редакция на опция.");
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
    const option = await setAdminOptionArchived(id, true);
    return NextResponse.json({ option });
  } catch (error) {
    return apiError(error, "Неуспешно архивиране на опция.");
  }
}

