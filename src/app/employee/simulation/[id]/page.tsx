import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession(["EMPLOYEE"]);
  await params;
  redirect("/employee/home");
}
