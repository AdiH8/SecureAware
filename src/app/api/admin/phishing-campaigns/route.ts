import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import {
  createAdminPhishingCampaign,
  listAdminPhishingCampaigns,
  listPhishingTemplates,
  startAdminPhishingCampaign,
} from "@/lib/data/store";

const createSchema = z.object({
  name: z.string().trim().min(2, "Името е задължително."),
  templateId: z.string().trim().min(2, "Шаблонът е задължителен."),
  subject: z.string().trim().min(2, "Темата е задължителна."),
  senderName: z.string().trim().min(2, "Подателят е задължителен."),
  content: z.string().trim().min(10, "Съдържанието е твърде кратко."),
  departmentId: z.string().trim().min(2, "Отделът е задължителен."),
  startNow: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const [campaigns, templates] = await Promise.all([
    listAdminPhishingCampaigns(),
    Promise.resolve(listPhishingTemplates()),
  ]);

  return NextResponse.json({ campaigns, templates });
}

export async function POST(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const campaign = await createAdminPhishingCampaign(parsed.data);
    const finalCampaign = parsed.data.startNow
      ? await startAdminPhishingCampaign(campaign.id)
      : campaign;
    return NextResponse.json({ campaign: finalCampaign }, { status: 201 });
  } catch (error) {
    return apiError(error, "Неуспешно създаване на кампания.");
  }
}
