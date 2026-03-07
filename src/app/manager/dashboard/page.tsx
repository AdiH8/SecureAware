import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DepartmentRiskChart } from "@/components/charts/department-risk-chart";
import { RecomputeButton } from "@/components/recompute-button";
import { RiskBadge } from "@/components/risk-badge";
import { requireSession } from "@/lib/auth";
import { getDashboardMetrics, getUserByIdResolved } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const session = await requireSession(["MANAGER", "ADMIN"]);
  const user = await getUserByIdResolved(session.userId);
  if (!user) return null;

  const metrics = await getDashboardMetrics();

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">РћСЂРіР°РЅРёР·Р°С†РёРѕРЅРµРЅ СЂРёСЃРє РёРЅРґРµРєСЃ</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.orgRiskScore}/100</h2>
        </article>
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">РљР»РёРє СЂРёСЃРє (С„РёС€РёРЅРі РґРµР№СЃС‚РІРёСЏ)</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.clickRate}%</h2>
        </article>
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">РџСЂРѕС†РµРЅС‚ РґРѕРєР»Р°РґРІР°РЅРµ</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.reportRate}%</h2>
        </article>
      </section>

      <section className="sa-card mt-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Р РёСЃРє РїСЂРѕС„РёР» РїРѕ РѕС‚РґРµР»Рё</h2>
            <p className="text-sm text-zinc-600">РђРіСЂРµРіРёСЂР°РЅРё СЂРµР·СѓР»С‚Р°С‚Рё Рё РїСЂРёРѕСЂРёС‚РµС‚Рё Р·Р° РґРµР№СЃС‚РІРёРµ</p>
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
                <th className="pb-2">РћС‚РґРµР»</th>
                <th className="pb-2">РЎСЂРµРґРЅРѕ РЅРёРІРѕ РЅР° Р·РЅР°РЅРёРµ</th>
                <th className="pb-2">РЎСЂРµРґРµРЅ СЂРµР°РєС†РёРѕРЅРµРЅ СЂРёСЃРє</th>
                <th className="pb-2">Р РёСЃРє РєР°С‚РµРіРѕСЂРёСЏ</th>
                <th className="pb-2">Р”РµР№СЃС‚РІРёРµ</th>
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
                      Р”РµС‚Р°Р№Р»РµРЅ РїСЂРµРіР»РµРґ
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
          <h3 className="text-xl font-bold">РќР°Р№-С‡РµСЃС‚Рё РіСЂРµС€РєРё</h3>
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
          <h3 className="text-xl font-bold">РЎР»СѓР¶РёС‚РµР»Рё СЃ РїРѕРІРёС€РµРЅ СЂРёСЃРє</h3>
          <div className="mt-3 space-y-2 text-sm">
            {metrics.atRiskUsers.map((userRisk) => (
              <div key={userRisk.userId} className="rounded-xl border border-[var(--line)] p-3">
                <p className="font-semibold">{userRisk.name}</p>
                <p className="text-zinc-600">{userRisk.departmentName}</p>
                <div className="mt-2 flex items-center gap-2">
                  <RiskBadge risk={userRisk.latestRiskBand} />
                  <span>Р—:{userRisk.latestKnowledgeScore}%</span>
                  <span>Р :{userRisk.latestReactionRisk}%</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}

