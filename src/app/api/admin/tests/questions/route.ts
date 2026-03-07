import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { createAdminQuestion, listAdminQuestions } from "@/lib/data/store";

const createSchema = z.object({
  moduleId: z.string().trim().min(2),
  kind: z.enum(["TEXT", "IMAGE"]),
  order: z.number().int().positive(),
  prompt: z.string().trim().min(5),
  imageUrl: z.string().trim().min(1).optional(),
  explanation: z.string().trim().min(5),
});

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const moduleId = request.nextUrl.searchParams.get("moduleId") ?? undefined;
  return NextResponse.json({ questions: listAdminQuestions(moduleId) });
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
    const question = await createAdminQuestion(parsed.data);
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    return apiError(error, "Неуспешно създаване на въпрос.");
  }
}

