import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { setAdminQuestionArchived, updateAdminQuestion } from "@/lib/data/store";

const updateSchema = z.object({
  moduleId: z.string().trim().min(2).optional(),
  kind: z.enum(["TEXT", "IMAGE"]).optional(),
  order: z.number().int().positive().optional(),
  prompt: z.string().trim().min(5).optional(),
  imageUrl: z.string().trim().min(1).optional(),
  explanation: z.string().trim().min(5).optional(),
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
      const question = await setAdminQuestionArchived(id, parsed.data.isArchived);
      return NextResponse.json({ question });
    }
    const question = await updateAdminQuestion(id, parsed.data);
    return NextResponse.json({ question });
  } catch (error) {
    return apiError(error, "Неуспешна редакция на въпрос.");
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
    const question = await setAdminQuestionArchived(id, true);
    return NextResponse.json({ question });
  } catch (error) {
    return apiError(error, "Неуспешно архивиране на въпрос.");
  }
}

