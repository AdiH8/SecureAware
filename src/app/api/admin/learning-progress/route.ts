import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-api";
import { listLearningAuditRows } from "@/lib/data/store";

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const departmentId = request.nextUrl.searchParams.get("departmentId") ?? undefined;
  const userId = request.nextUrl.searchParams.get("userId") ?? undefined;
  const rows = await listLearningAuditRows({ departmentId, userId });
  return NextResponse.json({ rows });
}
