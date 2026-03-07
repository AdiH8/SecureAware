import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { setAdminUserArchived, updateAdminUser } from "@/lib/data/store";

const updateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  departmentId: z.string().trim().min(2).optional(),
  role: z.enum(["EMPLOYEE", "MANAGER"]).optional(),
  isArchived: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невалидни входни данни.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    if (typeof parsed.data.isArchived === "boolean") {
      const user = await setAdminUserArchived(id, parsed.data.isArchived);
      return NextResponse.json({ user });
    }

    const user = await updateAdminUser(id, parsed.data);
    return NextResponse.json({ user });
  } catch (error) {
    return apiError(error, "Неуспешна редакция на потребител.");
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
    const user = await setAdminUserArchived(id, true);
    return NextResponse.json({ user });
  } catch (error) {
    return apiError(error, "Неуспешно архивиране на потребител.");
  }
}

