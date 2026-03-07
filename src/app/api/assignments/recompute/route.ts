import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIES } from "@/lib/auth";
import { recomputeAssignments } from "@/lib/data/store";
import { Role } from "@/lib/types";

export async function POST(request: NextRequest) {
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as Role | undefined;
  if (!role || (role !== "MANAGER" && role !== "ADMIN")) {
    return NextResponse.json({ error: "Нямате достъп" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  const result = recomputeAssignments(body.userId);
  return NextResponse.json({
    ok: true,
    created: result.created,
  });
}
