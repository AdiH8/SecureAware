import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { setAdminHistoryArchived } from "@/lib/data/store";

const schema = z.object({
  type: z.enum(["ATTEMPT", "RISK_EVENT", "MODULE_COMPLETION"]),
  id: z.string().trim().min(1),
  isArchived: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const success = setAdminHistoryArchived(parsed.data);
    if (!success) {
      return NextResponse.json({ error: "Записът не е намерен." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Неуспешна промяна в историята.");
  }
}

