import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIES } from "@/lib/auth";
import { answerTestQuestion } from "@/lib/data/store";
import { Role } from "@/lib/types";

const schema = z.object({
  sessionId: z.string().min(3),
  questionId: z.string().min(3),
  selectedOptionId: z.string().min(3),
  responseTimeMs: z.number().int().min(0).max(120_000),
});

export async function POST(request: NextRequest) {
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as Role | undefined;
  const userId = request.cookies.get(AUTH_COOKIES.userId)?.value;
  if (!role || !userId || role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Нямате достъп" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = answerTestQuestion({
      userId,
      ...parsed.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Неуспешно изпращане на отговора" },
      { status: 400 }
    );
  }
}
