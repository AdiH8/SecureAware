import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { createAdminUser, listAdminUsers, listDepartments } from "@/lib/data/store";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Profile } from "@/lib/types";

const createSchema = z.object({
  name: z.string().trim().min(2, "Името е задължително."),
  email: z.string().trim().email("Невалиден имейл."),
  departmentId: z.string().trim().min(2, "Изберете отдел."),
  role: z.enum(["EMPLOYEE", "MANAGER"]),
});

function mapProfileRow(row: {
  id: string;
  organization_id: string;
  department_id: string;
  name: string;
  email: string;
  role: string;
  is_archived: boolean;
  archived_at: string | null;
  updated_at: string;
}): Profile {
  return {
    id: row.id,
    organizationId: row.organization_id,
    departmentId: row.department_id,
    name: row.name,
    email: row.email,
    role: row.role as Profile["role"],
    isArchived: row.is_archived,
    archivedAt: row.archived_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const guard = requireAdminApi(request);
  if ("error" in guard) return guard.error;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const [profilesRes, departmentsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, organization_id, department_id, name, email, role, is_archived, archived_at, updated_at")
        .neq("role", "ADMIN")
        .order("updated_at", { ascending: false }),
      supabase.from("departments").select("id, organization_id, name").order("name", { ascending: true }),
    ]);

    if (profilesRes.error) {
      return NextResponse.json(
        { error: "Грешка при зареждане на потребителите от базата." },
        { status: 500 }
      );
    }
    if (departmentsRes.error) {
      return NextResponse.json(
        { error: "Грешка при зареждане на отделите от базата." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: (profilesRes.data ?? []).map(mapProfileRow),
      departments:
        departmentsRes.data?.map((item) => ({
          id: item.id,
          organizationId: item.organization_id,
          name: item.name,
        })) ?? [],
    });
  }

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
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const [orgRes, deptRes] = await Promise.all([
        supabase.from("organizations").select("id").limit(1).maybeSingle(),
        supabase.from("departments").select("id").eq("id", parsed.data.departmentId).maybeSingle(),
      ]);

      if (deptRes.error || !deptRes.data?.id) {
        return NextResponse.json({ error: "Невалиден отдел." }, { status: 400 });
      }
      if (orgRes.error || !orgRes.data?.id) {
        return NextResponse.json({ error: "Липсва активна организация в базата." }, { status: 500 });
      }

      const insertRes = await supabase
        .from("profiles")
        .insert({
          id: `usr_admin_${Math.random().toString(36).slice(2, 10)}`,
          organization_id: orgRes.data.id,
          department_id: parsed.data.departmentId,
          name: parsed.data.name.trim(),
          email: parsed.data.email.trim().toLowerCase(),
          role: parsed.data.role,
          is_archived: false,
          archived_at: null,
          updated_at: new Date().toISOString(),
        })
        .select("id, organization_id, department_id, name, email, role, is_archived, archived_at, updated_at")
        .single();

      if (insertRes.error) {
        if (insertRes.error.code === "23505") {
          return NextResponse.json({ error: "Имейлът вече се използва." }, { status: 409 });
        }
        return NextResponse.json({ error: "Неуспешно създаване на потребител." }, { status: 500 });
      }

      return NextResponse.json({ user: mapProfileRow(insertRes.data) }, { status: 201 });
    }

    const user = await createAdminUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return apiError(error, "Неуспешно създаване на потребител.");
  }
}
