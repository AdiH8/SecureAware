import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-api";
import { listAdminHistory } from "@/lib/data/store";

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  return NextResponse.json({ history: listAdminHistory() });
}

