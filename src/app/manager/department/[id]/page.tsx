import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { RecomputeButton } from "@/components/recompute-button";
import { RiskBadge } from "@/components/risk-badge";
import { requireSession } from "@/lib/auth";
import {
  getDashboardMetrics,
  getDepartmentById,
  getLatestAttemptForUser,
  getUserByIdResolved,
  listEmployeesByDepartment,
} from "@/lib/data/store";

export const dynamic = "force-dynamic";

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

  const metrics = await getDashboardMetrics(department.id);
  const employees = listEmployeesByDepartment(department.id);

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="sa-card p-5">
        <h1 className="text-3xl font-bold">Отдел {department.name}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Детайлен преглед на риска, ключовите грешки и препоръчани действия за екипа.
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">Риск индекс на отдела</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.orgRiskScore}/100</h2>
        </article>
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">Клик риск</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.clickRate}%</h2>
        </article>
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">Процент докладване</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.reportRate}%</h2>
        </article>
      </section>

      <section className="sa-card mt-4 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Риск изглед на екипа</h3>
          <RecomputeButton />
        </div>
        <div className="space-y-2">
          {employees.map((employee) => {
            const latest = getLatestAttemptForUser(employee.id);
            return (
              <div
                key={employee.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] p-3"
              >
                <div>
                  <p className="font-semibold">{employee.name}</p>
                  <p className="text-xs text-zinc-500">{employee.email}</p>
                </div>
                {latest ? (
                  <div className="flex items-center gap-3 text-sm">
                    <RiskBadge risk={latest.behavioralRisk} />
                    <span>Р—:{latest.knowledgeScore}%</span>
                    <span>Р :{latest.reactionRiskScore}%</span>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-500">Няма опити</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="sa-card p-5">
          <h3 className="text-xl font-bold">Най-чести грешки</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {metrics.commonMistakes.map((mistake) => (
              <li
                key={mistake.actionType}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3"
              >
                <span>{mistake.label}</span>
                <strong>{mistake.count}</strong>
              </li>
            ))}
          </ul>
        </article>
        <article className="sa-card p-5">
          <h3 className="text-xl font-bold">Препоръчани действия</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
            <li>Назначи мини модул за фишинг на служители с висок риск.</li>
            <li>Пусни URL разпознаване за целия отдел.</li>
            <li>Следи седмично докладването и целта да е над 70%.</li>
          </ul>
        </article>
      </section>
    </AppShell>
  );
}
