import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Role } from "@/lib/types";

export const AUTH_COOKIES = {
  role: "sa_role",
  userId: "sa_user_id",
} as const;

export interface SessionUser {
  role: Role;
  userId: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(AUTH_COOKIES.role)?.value as Role | undefined;
  const userId = cookieStore.get(AUTH_COOKIES.userId)?.value;
  if (!role || !userId) {
    return null;
  }
  return { role, userId };
}

export async function requireSession(allowedRoles?: Role[]): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/login?error=unauthorized");
  }
  return session;
}
