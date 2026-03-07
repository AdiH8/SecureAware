import { NextResponse } from "next/server";

import { AUTH_COOKIES } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIES.role);
  response.cookies.delete(AUTH_COOKIES.userId);
  return response;
}
