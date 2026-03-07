import { redirect } from "next/navigation";

export default async function LegacyModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/employee/training/${id}`);
}
