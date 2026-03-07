import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIES } from "@/lib/auth";
import { getUserByIdResolved } from "@/lib/data/store";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { userId?: string; redirect?: string };
  if (!body.userId) {
    return NextResponse.json({ error: "Липсва идентификатор на потребител" }, { status: 400 });
  }

  const user = await getUserByIdResolved(body.userId);
  if (!user) {
    return NextResponse.json({ error: "Потребителят не е намерен" }, { status: 404 });
  }

  const response = NextResponse.json({
    ok: true,
    role: user.role,
    redirect:
      body.redirect ||
      (user.role === "EMPLOYEE"
        ? "/employee/home"
        : user.role === "MANAGER"
          ? "/manager/dashboard"
          : "/admin/content"),
  });

  response.cookies.set(AUTH_COOKIES.role, user.role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  response.cookies.set(AUTH_COOKIES.userId, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
