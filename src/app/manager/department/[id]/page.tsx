import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/risk-badge";
import { requireSession } from "@/lib/auth";
import {
  getDepartmentById,
  getManagerDepartmentMetricsV2,
  getUserByIdResolved,
  listLearningAuditRows,
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

function learningStatusLabel(status: "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_TEST" | "COMPLETED"): string {
  if (status === "COMPLETED") return "Завършен";
  if (status === "READY_FOR_TEST") return "Готов за тест";
  if (status === "IN_PROGRESS") return "В процес";
  return "Не е започнат";
}

function learningStatusClass(status: "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_TEST" | "COMPLETED"): string {
  if (status === "COMPLETED") return "sa-badge-soft is-success";
  if (status === "READY_FOR_TEST") return "sa-badge-soft is-warning";
  return "sa-badge-soft is-neutral";
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
  const learningRows = await listLearningAuditRows({ departmentId: department.id });

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
        <article className="sa-card p-5"><p className="text-sm text-zinc-500">Процент клик</p><h2 className="mt-2 text-4xl font-bold">{metrics.clickRate}%</h2></article>
        <article className="sa-card p-5"><p className="text-sm text-zinc-500">Процент докладване</p><h2 className="mt-2 text-4xl font-bold">{metrics.reportRate}%</h2></article>
        <article className="sa-card p-5"><p className="text-sm text-zinc-500">Завършени обучения</p><h2 className="mt-2 text-4xl font-bold">{metrics.learningCompletionRate}%</h2></article>
      </section>

      <section className="sa-card mt-4 p-5">
        <h3 className="text-xl font-bold">Служители и статус</h3>
        <div className="sa-table-wrap mt-4">
          <table className="sa-table text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="w-[24%]">Служител</th>
                <th className="w-[19%]">Последно действие</th>
                <th className="w-[14%]">Риск</th>
                <th className="w-[18%]">Завършени</th>
                <th className="w-[12%]">Процент</th>
                <th className="w-[13%]">Общо</th>
              </tr>
            </thead>
            <tbody>
              {metrics.users.map((employee) => (
                <tr key={employee.userId} className="border-t border-[var(--line)]">
                  <td>
                    <span className="sa-cell-title">{employee.name}</span>
                    <span className="sa-cell-subtitle">{employee.email}</span>
                  </td>
                  <td>
                    <span className="sa-cell-title">{lastActionLabel(employee.lastCampaignAction)}</span>
                    <span className="sa-cell-subtitle">{employee.departmentName}</span>
                  </td>
                  <td><RiskBadge risk={employee.riskBand} /></td>
                  <td className="sa-cell-number">
                    <span className="sa-cell-title">{employee.completedModules} от {employee.totalModules}</span>
                    <span className="sa-cell-subtitle">Основни модули</span>
                  </td>
                  <td className="sa-cell-number font-semibold">{employee.completionRate}%</td>
                  <td className="sa-cell-number">{employee.totalModules}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sa-card mt-4 p-5">
        <h3 className="text-xl font-bold">Прогрес по курсове и ретейкове</h3>
        <div className="sa-table-wrap mt-4">
          <table className="sa-table text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="w-[18%]">Служител</th>
                <th className="w-[28%]">Курс</th>
                <th className="w-[14%]">Статус</th>
                <th className="w-[12%]">Опити</th>
                <th className="w-[12%]">Резултати</th>
                <th className="w-[16%]">Последна активност</th>
              </tr>
            </thead>
            <tbody>
              {learningRows.map((row) => (
                <tr key={`${row.userId}_${row.moduleId}`} className="border-t border-[var(--line)]">
                  <td>
                    <span className="sa-cell-title">{row.userName}</span>
                    <span className="sa-cell-subtitle">{row.departmentName}</span>
                  </td>
                  <td>
                    <span className="sa-cell-title">{row.moduleTitle}</span>
                    <span className="sa-cell-subtitle">{row.moduleIsMini ? "Мини модул" : "Основен модул"}</span>
                  </td>
                  <td>
                    <span className={learningStatusClass(row.status)}>{learningStatusLabel(row.status)}</span>
                  </td>
                  <td className="sa-cell-number">
                    <span className="sa-cell-title">{row.attemptsCount} опита</span>
                    <span className="sa-cell-subtitle">Ретейкове: {row.retakeCount}</span>
                  </td>
                  <td className="sa-cell-number">
                    <span className="sa-cell-title">
                      {row.lastScorePercent === null ? "Последен: —" : `Последен: ${row.lastScorePercent}%`}
                    </span>
                    <span className="sa-cell-subtitle">
                      {row.completionScorePercent === null ? "Финален: —" : `Финален: ${row.completionScorePercent}%`}
                    </span>
                  </td>
                  <td className="sa-cell-number">{new Date(row.updatedAt).toLocaleDateString("bg-BG")}</td>
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
