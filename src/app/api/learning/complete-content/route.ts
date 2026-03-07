import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIES } from "@/lib/auth";
import { markLearningContentComplete } from "@/lib/data/store";
import { Role } from "@/lib/types";

const schema = z.object({
  moduleId: z.string().min(2),
  mode: z.enum(["VIDEO", "TEXT"]),
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

  const progress = markLearningContentComplete({
    userId,
    moduleId: parsed.data.moduleId,
    mode: parsed.data.mode,
  });

  return NextResponse.json({
    testUnlocked: progress.testUnlocked,
    progress,
  });
}
