import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIES } from "@/lib/auth";
import { Role } from "@/lib/types";

export function getAdminUserId(request: NextRequest): string | null {
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as Role | undefined;
  const userId = request.cookies.get(AUTH_COOKIES.userId)?.value;
  if (role !== "ADMIN" || !userId) {
    return null;
  }
  return userId;
}

export function requireAdminApi(
  request: NextRequest
): { adminUserId: string } | { error: NextResponse } {
  const adminUserId = getAdminUserId(request);
  if (!adminUserId) {
    return {
      error: NextResponse.json(
        {
          error: "Нямате достъп до администраторския панел.",
        },
        { status: 403 }
      ),
    };
  }
  return { adminUserId };
}

export function apiError(error: unknown, fallback = "Възникна грешка при изпълнение на заявката.") {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 400 }
  );
}

