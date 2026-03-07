import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { createAdminOption, listAdminQuestions } from "@/lib/data/store";

const createSchema = z.object({
  questionId: z.string().trim().min(2),
  label: z.string().trim().min(1).max(2),
  text: z.string().trim().min(1),
  isCorrect: z.boolean(),
});

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const questionId = request.nextUrl.searchParams.get("questionId");
  const moduleId = request.nextUrl.searchParams.get("moduleId") ?? undefined;
  const options = listAdminQuestions(moduleId)
    .flatMap((question) => question.options)
    .filter((option) => (questionId ? option.questionId === questionId : true));

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
    const option = await createAdminOption(parsed.data);
    return NextResponse.json({ option }, { status: 201 });
  } catch (error) {
    return apiError(error, "Неуспешно създаване на опция.");
  }
}

