import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DepartmentRiskChart } from "@/components/charts/department-risk-chart";
import { RecomputeButton } from "@/components/recompute-button";
import { RiskBadge } from "@/components/risk-badge";
import { requireSession } from "@/lib/auth";
import { getDashboardMetrics, getUserById } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const session = await requireSession(["MANAGER", "ADMIN"]);
  const user = getUserById(session.userId);
  if (!user) return null;

  const metrics = await getDashboardMetrics();

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">Организационен риск индекс</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.orgRiskScore}/100</h2>
        </article>
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">Клик риск (фишинг действия)</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.clickRate}%</h2>
        </article>
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">Процент докладване</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.reportRate}%</h2>
        </article>
      </section>

      <section className="sa-card mt-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Риск профил по отдели</h2>
            <p className="text-sm text-zinc-600">Агрегирани резултати и приоритети за действие</p>
          </div>
          <RecomputeButton />
        </div>
        <DepartmentRiskChart
          data={metrics.deptBreakdown.map((dept) => ({
            departmentName: dept.departmentName,
            overallRiskScore: dept.overallRiskScore,
          }))}
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="pb-2">Отдел</th>
                <th className="pb-2">Средно ниво на знание</th>
                <th className="pb-2">Среден реакционен риск</th>
                <th className="pb-2">Риск категория</th>
                <th className="pb-2">Действие</th>
              </tr>
            </thead>
            <tbody>
              {metrics.deptBreakdown.map((dept) => (
                <tr key={dept.departmentId} className="border-t border-[var(--line)]">
                  <td className="py-3 font-semibold">{dept.departmentName}</td>
                  <td className="py-3">{dept.avgKnowledgeScore}%</td>
                  <td className="py-3">{dept.avgReactionRisk}%</td>
                  <td className="py-3">
                    <RiskBadge risk={dept.riskBand} />
                  </td>
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
          <h3 className="text-xl font-bold">Служители с повишен риск</h3>
          <div className="mt-3 space-y-2 text-sm">
            {metrics.atRiskUsers.map((userRisk) => (
              <div key={userRisk.userId} className="rounded-xl border border-[var(--line)] p-3">
                <p className="font-semibold">{userRisk.name}</p>
                <p className="text-zinc-600">{userRisk.departmentName}</p>
                <div className="mt-2 flex items-center gap-2">
                  <RiskBadge risk={userRisk.latestRiskBand} />
                  <span>З:{userRisk.latestKnowledgeScore}%</span>
                  <span>Р:{userRisk.latestReactionRisk}%</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
