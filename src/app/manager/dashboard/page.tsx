import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/risk-badge";
import { requireSession } from "@/lib/auth";
import {
  getManagerDashboardMetricsV2,
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

export default async function ManagerDashboardPage() {
  const session = await requireSession(["MANAGER", "ADMIN"]);
  const user = await getUserByIdResolved(session.userId);
  if (!user) return null;

  const metrics = await getManagerDashboardMetricsV2({ range: "30d" });
  const learningRows = await listLearningAuditRows();
  const topRetakes = Array.from(
    learningRows.reduce((map, row) => {
      const current = map.get(row.userId) ?? {
        userId: row.userId,
        name: row.userName,
        departmentName: row.departmentName,
        retakes: 0,
        completed: 0,
        total: 0,
      };
      current.retakes += row.retakeCount;
      current.total += 1;
      if (row.status === "COMPLETED") {
        current.completed += 1;
      }
      map.set(row.userId, current);
      return map;
    }, new Map<string, { userId: string; name: string; departmentName: string; retakes: number; completed: number; total: number }>())
  )
    .map(([, entry]) => entry)
    .filter((entry) => entry.retakes > 0)
    .sort((a, b) => b.retakes - a.retakes)
    .slice(0, 6);

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Изпратени</p><p className="mt-1 text-3xl font-bold">{metrics.sentCount}</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Отворени</p><p className="mt-1 text-3xl font-bold">{metrics.openedCount}</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Кликнали</p><p className="mt-1 text-3xl font-bold">{metrics.clickedCount}</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Докладвали</p><p className="mt-1 text-3xl font-bold">{metrics.reportedCount}</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Процент клик</p><p className="mt-1 text-3xl font-bold">{metrics.clickRate}%</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Процент докладване</p><p className="mt-1 text-3xl font-bold">{metrics.reportRate}%</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Завършени обучения</p><p className="mt-1 text-3xl font-bold">{metrics.learningCompletionRate}%</p></article>
      </section>

      <section className="sa-card mt-4 p-5">
        <h2 className="text-2xl font-bold">Резултати по отдели (последни 30 дни)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="pb-2">Отдел</th>
                <th className="pb-2">Изпратени</th>
                <th className="pb-2">Процент клик</th>
                <th className="pb-2">Процент докладване</th>
                <th className="pb-2">Процент завършени</th>
                <th className="pb-2">Детайли</th>
              </tr>
            </thead>
            <tbody>
              {metrics.deptBreakdown.map((dept) => (
                <tr key={dept.departmentId} className="border-t border-[var(--line)]">
                  <td className="py-3 font-semibold">{dept.departmentName}</td>
                  <td className="py-3">{dept.sentCount}</td>
                  <td className="py-3">{dept.clickRate}%</td>
                  <td className="py-3">{dept.reportRate}%</td>
                  <td className="py-3">{dept.completionRate}%</td>
                  <td className="py-3">
                    <Link className="sa-link text-sm" href={`/manager/department/${dept.departmentId}`}>
                      Детайлен преглед
                    </Link>
                  </td>
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
          <h3 className="text-xl font-bold">Служители с повишен риск</h3>
          <div className="mt-3 space-y-2 text-sm">
            {metrics.atRiskUsers.length ? (
              metrics.atRiskUsers.map((userRisk) => (
                <div key={userRisk.userId} className="rounded-xl border border-[var(--line)] p-3">
                  <p className="font-semibold">{userRisk.name}</p>
                  <p className="text-zinc-600">{userRisk.departmentName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <RiskBadge risk={userRisk.riskBand} />
                    <span>{lastActionLabel(userRisk.lastCampaignAction)}</span>
                    <span>Завършени: {userRisk.completionRate}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-600">Няма служители с данни за периода.</p>
            )}
          </div>
        </article>
      </section>

      <section className="sa-card mt-4 p-5">
        <h3 className="text-xl font-bold">Ретейкове по служители</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Преглед на служителите с най-много повторни опити по тестовете.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="pb-2">Служител</th>
                <th className="pb-2">Отдел</th>
                <th className="pb-2">Ретейкове</th>
                <th className="pb-2">Завършени курсове</th>
                <th className="pb-2">Общо курсове</th>
              </tr>
            </thead>
            <tbody>
              {topRetakes.length ? (
                topRetakes.map((entry) => (
                  <tr key={entry.userId} className="border-t border-[var(--line)]">
                    <td className="py-3 font-semibold">{entry.name}</td>
                    <td className="py-3">{entry.departmentName}</td>
                    <td className="py-3">{entry.retakes}</td>
                    <td className="py-3">{entry.completed}</td>
                    <td className="py-3">{entry.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-3 text-zinc-600">
                    Все още няма ретейкове по обучения.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
