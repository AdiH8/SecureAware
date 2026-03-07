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
        <h1 className="text-3xl font-bold">РћС‚РґРµР» {department.name}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Р”РµС‚Р°Р№Р»РµРЅ РїСЂРµРіР»РµРґ РЅР° СЂРёСЃРєР°, РєР»СЋС‡РѕРІРёС‚Рµ РіСЂРµС€РєРё Рё РїСЂРµРїРѕСЂСЉС‡Р°РЅРё РґРµР№СЃС‚РІРёСЏ Р·Р° РµРєРёРїР°.
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">Р РёСЃРє РёРЅРґРµРєСЃ РЅР° РѕС‚РґРµР»Р°</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.orgRiskScore}/100</h2>
        </article>
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">РљР»РёРє СЂРёСЃРє</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.clickRate}%</h2>
        </article>
        <article className="sa-card p-5">
          <p className="text-sm text-zinc-500">РџСЂРѕС†РµРЅС‚ РґРѕРєР»Р°РґРІР°РЅРµ</p>
          <h2 className="mt-2 text-4xl font-bold">{metrics.reportRate}%</h2>
        </article>
      </section>

      <section className="sa-card mt-4 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Р РёСЃРє РёР·РіР»РµРґ РЅР° РµРєРёРїР°</h3>
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
                  <span className="text-sm text-zinc-500">РќСЏРјР° РѕРїРёС‚Рё</span>
                )}
              </div>
            );
          })}
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
          <h3 className="text-xl font-bold">РџСЂРµРїРѕСЂСЉС‡Р°РЅРё РґРµР№СЃС‚РІРёСЏ</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
            <li>РќР°Р·РЅР°С‡Рё РјРёРЅРё РјРѕРґСѓР» Р·Р° С„РёС€РёРЅРі РЅР° СЃР»СѓР¶РёС‚РµР»Рё СЃ РІРёСЃРѕРє СЂРёСЃРє.</li>
            <li>РџСѓСЃРЅРё URL СЂР°Р·РїРѕР·РЅР°РІР°РЅРµ Р·Р° С†РµР»РёСЏ РѕС‚РґРµР».</li>
            <li>РЎР»РµРґРё СЃРµРґРјРёС‡РЅРѕ РґРѕРєР»Р°РґРІР°РЅРµС‚Рѕ Рё С†РµР»С‚Р° РґР° Рµ РЅР°Рґ 70%.</li>
          </ul>
        </article>
      </section>
    </AppShell>
  );
}

