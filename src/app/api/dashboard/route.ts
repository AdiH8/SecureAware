import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIES } from "@/lib/auth";
import { getManagerDashboardMetricsV2 } from "@/lib/data/store";
import { Role } from "@/lib/types";

export async function GET(request: NextRequest) {
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as Role | undefined;
  if (!role || (role !== "MANAGER" && role !== "ADMIN")) {
    return NextResponse.json({ error: "Нямате достъп." }, { status: 401 });
  }

  const departmentId = request.nextUrl.searchParams.get("departmentId") ?? undefined;
  const range = request.nextUrl.searchParams.get("range") ?? "30d";
  const metrics = await getManagerDashboardMetricsV2({ departmentId, range });
  return NextResponse.json(metrics);
}
