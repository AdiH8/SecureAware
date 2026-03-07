import { NextRequest, NextResponse } from "next/server";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { setAdminModuleArchived, updateAdminModule } from "@/lib/data/store";
import { adminModuleUpdateSchema } from "@/lib/module-schemas";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const { id } = await context.params;
  const parsed = adminModuleUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    if (typeof parsed.data.isArchived === "boolean") {
      const moduleEntity = await setAdminModuleArchived(id, parsed.data.isArchived);
      return NextResponse.json({ module: moduleEntity });
    }

    const moduleEntity = await updateAdminModule(id, parsed.data);
    return NextResponse.json({ module: moduleEntity });
  } catch (error) {
    return apiError(error, "Неуспешна редакция на курс.");
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
    const moduleEntity = await setAdminModuleArchived(id, true);
    return NextResponse.json({ module: moduleEntity });
  } catch (error) {
    return apiError(error, "Неуспешно архивиране на курс.");
  }
}
