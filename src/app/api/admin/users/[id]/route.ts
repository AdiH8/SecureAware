import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireAdminApi } from "@/lib/admin-api";
import { setAdminUserArchived, updateAdminUser } from "@/lib/data/store";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Profile } from "@/lib/types";

const updateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  departmentId: z.string().trim().min(2).optional(),
  role: z.enum(["EMPLOYEE", "MANAGER"]).optional(),
  isArchived: z.boolean().optional(),
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
    const supabase = getSupabaseAdmin();
    if (supabase) {
      if (parsed.data.departmentId) {
        const deptRes = await supabase
          .from("departments")
          .select("id")
          .eq("id", parsed.data.departmentId)
          .maybeSingle();
        if (deptRes.error || !deptRes.data?.id) {
          return NextResponse.json({ error: "Невалиден отдел." }, { status: 400 });
        }
      }

      const updatePayload: {
        name?: string;
        email?: string;
        department_id?: string;
        role?: "EMPLOYEE" | "MANAGER";
        is_archived?: boolean;
        archived_at?: string | null;
        updated_at: string;
      } = {
        updated_at: new Date().toISOString(),
      };

      if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name.trim();
      if (parsed.data.email !== undefined) updatePayload.email = parsed.data.email.trim().toLowerCase();
      if (parsed.data.departmentId !== undefined) updatePayload.department_id = parsed.data.departmentId;
      if (parsed.data.role !== undefined) updatePayload.role = parsed.data.role;
      if (parsed.data.isArchived !== undefined) {
        updatePayload.is_archived = parsed.data.isArchived;
        updatePayload.archived_at = parsed.data.isArchived ? new Date().toISOString() : null;
      }

      const updateRes = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", id)
        .neq("role", "ADMIN")
        .select("id, organization_id, department_id, name, email, role, is_archived, archived_at, updated_at")
        .single();

      if (updateRes.error) {
        if (updateRes.error.code === "23505") {
          return NextResponse.json({ error: "Имейлът вече се използва." }, { status: 409 });
        }
        return NextResponse.json({ error: "Неуспешна редакция на потребител." }, { status: 500 });
      }

      return NextResponse.json({ user: mapProfileRow(updateRes.data) });
    }

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
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const res = await supabase
        .from("profiles")
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .neq("role", "ADMIN")
        .select("id, organization_id, department_id, name, email, role, is_archived, archived_at, updated_at")
        .single();

      if (res.error) {
        return NextResponse.json({ error: "Неуспешно архивиране на потребител." }, { status: 500 });
      }
      return NextResponse.json({ user: mapProfileRow(res.data) });
    }

    const user = await setAdminUserArchived(id, true);
    return NextResponse.json({ user });
  } catch (error) {
    return apiError(error, "Неуспешно архивиране на потребител.");
  }
}
