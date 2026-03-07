import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIES } from "@/lib/auth";
import { markAssignmentCompleted } from "@/lib/data/store";
import { Role } from "@/lib/types";

const schema = z.object({
  assignmentId: z.string().min(3),
});

export async function POST(request: NextRequest) {
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as Role | undefined;
  if (!role || role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Нямате достъп" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const assignment = markAssignmentCompleted(parsed.data.assignmentId);
  if (!assignment) {
    return NextResponse.json({ error: "Заданието не е намерено" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, assignment });
}
