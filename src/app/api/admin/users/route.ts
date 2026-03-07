import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { createAdminUser, listAdminUsers, listDepartments } from "@/lib/data/store";

const createSchema = z.object({
  name: z.string().trim().min(2, "Името е задължително."),
  email: z.string().trim().email("Невалиден имейл."),
  departmentId: z.string().trim().min(2, "Изберете отдел."),
  role: z.enum(["EMPLOYEE", "MANAGER"]),
});

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  return NextResponse.json({
    users: listAdminUsers(),
    departments: listDepartments(),
  });
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
    const user = await createAdminUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return apiError(error, "Неуспешно създаване на потребител.");
  }
}

