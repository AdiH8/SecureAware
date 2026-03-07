import { NextRequest, NextResponse } from "next/server";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { startAdminPhishingCampaign } from "@/lib/data/store";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const { id } = await context.params;
  try {
    const campaign = await startAdminPhishingCampaign(id);
    return NextResponse.json({ campaign });
  } catch (error) {
    return apiError(error, "Неуспешно стартиране на кампания.");
  }
}
