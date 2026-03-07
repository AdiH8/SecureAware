import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIES } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/data/store";
import { Role } from "@/lib/types";

export async function GET(request: NextRequest) {
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as Role | undefined;
  if (!role || (role !== "MANAGER" && role !== "ADMIN")) {
    return NextResponse.json({ error: "Нямате достъп" }, { status: 401 });
  }

  const departmentId = request.nextUrl.searchParams.get("departmentId") ?? undefined;
  const metrics = await getDashboardMetrics(departmentId);
  return NextResponse.json(metrics);
}
