import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/risk-badge";
import { requireSession } from "@/lib/auth";
import {
  getDepartmentById,
  getManagerDepartmentMetricsV2,
  getUserByIdResolved,
} from "@/lib/data/store";
import { ManagerUserRow } from "@/lib/types";

export const dynamic = "force-dynamic";

function lastActionLabel(action: ManagerUserRow["lastCampaignAction"]): string {
  if (action === "CLICKED") return "Кликнал линк";
  if (action === "OPENED") return "Отворил имейл";
  if (action === "REPORTED") return "Докладвал имейл";
  if (action === "IGNORED") return "Игнорирал имейл";
  return "Няма действие";
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(["MANAGER", "ADMIN"]);
  const { id } = await params;
  const user = await getUserByIdResolved(session.userId);
  const department = getDepartmentById(id);
  if (!user || !department) {
    notFound();
  }

  const metrics = await getManagerDepartmentMetricsV2({
    departmentId: department.id,
    range: "30d",
  });

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="sa-card p-5">
        <h1 className="text-3xl font-bold">Отдел {metrics.department.departmentName}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Кампанийни и обучителни резултати за последните 30 дни.
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-4">
        <article className="sa-card p-5"><p className="text-sm text-zinc-500">Изпратени</p><h2 className="mt-2 text-4xl font-bold">{metrics.sentCount}</h2></article>
        <article className="sa-card p-5"><p className="text-sm text-zinc-500">Click rate</p><h2 className="mt-2 text-4xl font-bold">{metrics.clickRate}%</h2></article>
        <article className="sa-card p-5"><p className="text-sm text-zinc-500">Report rate</p><h2 className="mt-2 text-4xl font-bold">{metrics.reportRate}%</h2></article>
        <article className="sa-card p-5"><p className="text-sm text-zinc-500">Learning completion</p><h2 className="mt-2 text-4xl font-bold">{metrics.learningCompletionRate}%</h2></article>
      </section>

      <section className="sa-card mt-4 p-5">
        <h3 className="text-xl font-bold">Служители и статус</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="pb-2">Служител</th>
                <th className="pb-2">Имейл</th>
                <th className="pb-2">Последно действие</th>
                <th className="pb-2">Risk band</th>
                <th className="pb-2">Завършени</th>
                <th className="pb-2">Общо</th>
                <th className="pb-2">Completion</th>
              </tr>
            </thead>
            <tbody>
              {metrics.users.map((employee) => (
                <tr key={employee.userId} className="border-t border-[var(--line)]">
                  <td className="py-3 font-semibold">{employee.name}</td>
                  <td className="py-3">{employee.email}</td>
                  <td className="py-3">{lastActionLabel(employee.lastCampaignAction)}</td>
                  <td className="py-3"><RiskBadge risk={employee.riskBand} /></td>
                  <td className="py-3">{employee.completedModules}</td>
                  <td className="py-3">{employee.totalModules}</td>
                  <td className="py-3">{employee.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="sa-card p-5">
          <h3 className="text-xl font-bold">Най-чести действия</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {metrics.commonMistakes.length ? (
              metrics.commonMistakes.map((mistake) => (
                <li
                  key={mistake.action}
                  className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3"
                >
                  <span>{mistake.label}</span>
                  <strong>{mistake.count}</strong>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-[var(--line)] p-3 text-zinc-600">Няма данни за периода.</li>
            )}
          </ul>
        </article>

        <article className="sa-card p-5">
          <h3 className="text-xl font-bold">Препоръчани действия</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
            <li>Приоритизирай служителите с HIGH риск за повторно обучение.</li>
            <li>Проследявай click/report rate седмично по отдел.</li>
            <li>Задай цел за completion rate над 80%.</li>
          </ul>
        </article>
      </section>
    </AppShell>
  );
}
