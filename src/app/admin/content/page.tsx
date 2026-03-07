import { AppShell } from "@/components/app-shell";
import { AdminControlCenter } from "@/components/admin-control-center";
import { requireSession } from "@/lib/auth";
import { getUserByIdResolved } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const session = await requireSession(["ADMIN"]);
  const user = await getUserByIdResolved(session.userId);
  if (!user) return null;

  return (
    <AppShell role={session.role} name={user.name}>
      <AdminControlCenter />
    </AppShell>
  );
}


