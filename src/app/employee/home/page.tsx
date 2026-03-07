import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { getEmployeeLearningState, getUserByIdResolved } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function EmployeeHomePage() {
  const session = await requireSession(["EMPLOYEE"]);
  const user = await getUserByIdResolved(session.userId);
  if (!user) {
    return null;
  }

  const learningState = getEmployeeLearningState(user.id);

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="sa-card p-5">
        <h1 className="text-3xl font-bold">РњРѕРµС‚Рѕ РѕР±СѓС‡РµРЅРёРµ</h1>
        <p className="mt-2 text-sm text-zinc-600">
          РџСЂРµРјРёРЅРё РѕР±СѓС‡РµРЅРёРµ (РІРёРґРµРѕ РёР»Рё С‚РµРєСЃС‚), СЃР»РµРґ С‚РѕРІР° СѓСЃРїРµС€РЅРѕ СЂРµС€Рё С‚РµСЃС‚Р° РѕС‚ 10 РІСЉРїСЂРѕСЃР°.
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <article className="sa-card p-5 md:col-span-2">
          <h2 className="text-xl font-bold">РЎР»РµРґРІР°С‰Рѕ РѕР±СѓС‡РµРЅРёРµ</h2>
          {learningState.nextModule ? (
            <div className="mt-3 rounded-xl border border-[var(--line)] p-4">
              <p className="text-xs font-semibold uppercase text-zinc-500">
                {learningState.nextModule.isMini ? "РђРґР°РїС‚РёРІРµРЅ РјРёРЅРё РјРѕРґСѓР»" : "РћСЃРЅРѕРІРµРЅ РјРѕРґСѓР»"}
              </p>
              <p className="mt-1 text-lg font-semibold">{learningState.nextModule.title}</p>
              <p className="mt-1 text-sm text-zinc-600">
                РЎС‚Р°С‚СѓСЃ:{" "}
                <strong>
                  {learningState.nextModule.status === "READY_FOR_TEST"
                    ? "Р“РѕС‚РѕРІ Р·Р° С‚РµСЃС‚"
                    : learningState.nextModule.status === "COMPLETED"
                      ? "Р—Р°РІСЉСЂС€РµРЅ"
                      : "РќРµР·Р°РїРѕС‡РЅР°С‚"}
                </strong>
              </p>
              <Link
                href={`/employee/training/${learningState.nextModule.moduleId}`}
                className="mt-3 inline-block rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
              >
                РћС‚РІРѕСЂРё РѕР±СѓС‡РµРЅРёРµС‚Рѕ
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">Р’СЃРёС‡РєРё РЅР°Р·РЅР°С‡РµРЅРё РјРѕРґСѓР»Рё СЃР° Р·Р°РІСЉСЂС€РµРЅРё.</p>
          )}
        </article>

        <article className="sa-card p-5">
          <h2 className="text-xl font-bold">РћР±РѕР±С‰РµРЅРёРµ</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              Р—Р°РІСЉСЂС€РµРЅРё: <strong>{learningState.completedModules.length}</strong>
            </p>
            <p>
              РћСЃС‚Р°РІР°С‰Рё:{" "}
              <strong>
                {learningState.nextModule ? learningState.remainingModules.length + 1 : 0}
              </strong>
            </p>
            <p>
              РћР±С‰Рѕ РЅР°Р·РЅР°С‡РµРЅРё: <strong>{learningState.modules.length}</strong>
            </p>
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="sa-card p-5">
          <h2 className="text-xl font-bold">РћСЃС‚Р°РІР°С‰Рё РѕР±СѓС‡РµРЅРёСЏ</h2>
          <div className="mt-3 space-y-2">
            {learningState.remainingModules.length ? (
              learningState.remainingModules.map((module) => (
                <div key={module.moduleId} className="rounded-xl border border-[var(--line)] p-3">
                  <p className="font-semibold">{module.title}</p>
                  <p className="text-xs text-zinc-500">
                    {module.isMini ? "РњРёРЅРё РјРѕРґСѓР»" : "РћСЃРЅРѕРІРµРЅ РјРѕРґСѓР»"}
                  </p>
                  <Link
                    className="sa-link mt-2 inline-block text-sm"
                    href={`/employee/training/${module.moduleId}`}
                  >
                    РћС‚РІРѕСЂРё
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600">РќСЏРјР° РѕСЃС‚Р°РІР°С‰Рё РјРѕРґСѓР»Рё.</p>
            )}
          </div>
        </article>

        <article className="sa-card p-5">
          <h2 className="text-xl font-bold">Р—Р°РІСЉСЂС€РµРЅРё РѕР±СѓС‡РµРЅРёСЏ</h2>
          <div className="mt-3 space-y-2">
            {learningState.completedModules.length ? (
              learningState.completedModules.map((module) => (
                <div key={module.moduleId} className="rounded-xl border border-[var(--line)] p-3">
                  <p className="font-semibold">{module.title}</p>
                  <p className="text-xs text-emerald-700">Р—Р°РІСЉСЂС€РµРЅ РјРѕРґСѓР»</p>
                  {typeof module.lastScorePercent === "number" ? (
                    <p className="text-xs text-zinc-500">
                      РџРѕСЃР»РµРґРµРЅ СЂРµР·СѓР»С‚Р°С‚: {module.lastScorePercent}%
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600">Р’СЃРµ РѕС‰Рµ РЅСЏРјР° Р·Р°РІСЉСЂС€РµРЅРё РјРѕРґСѓР»Рё.</p>
            )}
          </div>
        </article>
      </section>
    </AppShell>
  );
}

