import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIES } from "@/lib/auth";
import { getEmployeeLearningState } from "@/lib/data/store";
import { Role } from "@/lib/types";

export async function GET(request: NextRequest) {
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as Role | undefined;
  const userId = request.cookies.get(AUTH_COOKIES.userId)?.value;
  if (!role || !userId || role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Нямате достъп" }, { status: 401 });
  }

  return NextResponse.json(getEmployeeLearningState(userId));
}
