import { NextRequest, NextResponse } from "next/server";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { createAdminModule, listAdminModules } from "@/lib/data/store";
import { adminModuleCreateSchema } from "@/lib/module-schemas";

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  return NextResponse.json({ modules: listAdminModules() });
}

export async function POST(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const parsed = adminModuleCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const moduleEntity = await createAdminModule(parsed.data);
    return NextResponse.json({ module: moduleEntity }, { status: 201 });
  } catch (error) {
    return apiError(error, "Неуспешно създаване на курс.");
  }
}
