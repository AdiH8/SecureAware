import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import {
  setAdminPhishingCampaignArchived,
  updateAdminPhishingCampaign,
} from "@/lib/data/store";

const patchSchema = z.object({
  name: z.string().trim().min(2).optional(),
  templateId: z.string().trim().min(2).optional(),
  subject: z.string().trim().min(2).optional(),
  senderName: z.string().trim().min(2).optional(),
  content: z.string().trim().min(10).optional(),
  departmentId: z.string().trim().min(2).optional(),
  isArchived: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    if (typeof parsed.data.isArchived === "boolean") {
      const campaign = await setAdminPhishingCampaignArchived(id, parsed.data.isArchived);
      return NextResponse.json({ campaign });
    }
    const campaign = await updateAdminPhishingCampaign(id, parsed.data);
    return NextResponse.json({ campaign });
  } catch (error) {
    return apiError(error, "Неуспешна редакция на кампания.");
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const { id } = await context.params;
  try {
    const campaign = await setAdminPhishingCampaignArchived(id, true);
    return NextResponse.json({ campaign });
  } catch (error) {
    return apiError(error, "Неуспешно архивиране на кампания.");
  }
}
