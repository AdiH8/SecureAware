import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIES } from "@/lib/auth";
import { startTestSession } from "@/lib/data/store";
import { Role } from "@/lib/types";

const schema = z.object({
  moduleId: z.string().min(2),
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
    const session = startTestSession({ userId, moduleId: parsed.data.moduleId });
    return NextResponse.json({
      sessionId: session.id,
      totalQuestions: session.totalQuestions,
      passThreshold: session.passThreshold,
      currentIndex: session.currentIndex,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Неуспешно стартиране на тестовата сесия" },
      { status: 400 }
    );
  }
}
