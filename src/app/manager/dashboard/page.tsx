import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/risk-badge";
import { requireSession } from "@/lib/auth";
import { getManagerDashboardMetricsV2, getUserByIdResolved } from "@/lib/data/store";
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

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Изпратени</p><p className="mt-1 text-3xl font-bold">{metrics.sentCount}</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Отворени</p><p className="mt-1 text-3xl font-bold">{metrics.openedCount}</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Кликнали</p><p className="mt-1 text-3xl font-bold">{metrics.clickedCount}</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Докладвали</p><p className="mt-1 text-3xl font-bold">{metrics.reportedCount}</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Click rate</p><p className="mt-1 text-3xl font-bold">{metrics.clickRate}%</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Report rate</p><p className="mt-1 text-3xl font-bold">{metrics.reportRate}%</p></article>
        <article className="sa-card p-4"><p className="text-xs text-zinc-500">Learning completion</p><p className="mt-1 text-3xl font-bold">{metrics.learningCompletionRate}%</p></article>
      </section>

      <section className="sa-card mt-4 p-5">
        <h2 className="text-2xl font-bold">Резултати по отдели (последни 30 дни)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="pb-2">Отдел</th>
                <th className="pb-2">Изпратени</th>
                <th className="pb-2">Click rate</th>
                <th className="pb-2">Report rate</th>
                <th className="pb-2">Completion rate</th>
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
                    <span>Completion: {userRisk.completionRate}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-600">Няма служители с данни за периода.</p>
            )}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
