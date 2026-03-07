import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIES } from "@/lib/auth";
import { Role } from "@/lib/types";

function getAllowedRoles(pathname: string): Role[] | null {
  if (pathname.startsWith("/employee")) return ["EMPLOYEE"];
  if (pathname.startsWith("/manager")) return ["MANAGER", "ADMIN"];
  if (pathname.startsWith("/admin")) return ["ADMIN"];
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allowedRoles = getAllowedRoles(pathname);
  if (!allowedRoles) {
    return NextResponse.next();
  }

  const role = request.cookies.get(AUTH_COOKIES.role)?.value as Role | undefined;
  const userId = request.cookies.get(AUTH_COOKIES.userId)?.value;

  if (!role || !userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!allowedRoles.includes(role)) {
    const deniedUrl = new URL("/login", request.url);
    deniedUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(deniedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/employee/:path*", "/manager/:path*", "/admin/:path*"],
};
