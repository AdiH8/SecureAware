import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { getEmployeeLearningStateResolved, getUserByIdResolved } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function EmployeeHomePage() {
  const session = await requireSession(["EMPLOYEE"]);
  const user = await getUserByIdResolved(session.userId);
  if (!user) {
    return null;
  }

  const learningState = await getEmployeeLearningStateResolved(user.id);

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="sa-card p-5">
        <h1 className="text-3xl font-bold">Моето обучение</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Премини обучение (видео или текст), след това успешно реши теста от 10 въпроса.
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <article className="sa-card p-5 md:col-span-2">
          <h2 className="text-xl font-bold">Следващо обучение</h2>
          {learningState.nextModule ? (
            <div className="mt-3 rounded-xl border border-[var(--line)] p-4">
              <p className="text-xs font-semibold uppercase text-zinc-500">
                {learningState.nextModule.isMini ? "Адаптивен мини модул" : "Основен модул"}
              </p>
              <p className="mt-1 text-lg font-semibold">{learningState.nextModule.title}</p>
              <p className="mt-1 text-sm text-zinc-600">
                Статус:{" "}
                <strong>
                  {learningState.nextModule.status === "READY_FOR_TEST"
                    ? "Готов за тест"
                    : learningState.nextModule.status === "COMPLETED"
                      ? "Завършен"
                      : "Незапочнат"}
                </strong>
              </p>
              <Link
                href={`/employee/training/${learningState.nextModule.moduleId}`}
                className="mt-3 inline-block rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
              >
                Отвори обучението
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">Всички назначени модули са завършени.</p>
          )}
        </article>

        <article className="sa-card p-5">
          <h2 className="text-xl font-bold">Обобщение</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              Завършени: <strong>{learningState.completedModules.length}</strong>
            </p>
            <p>
              Оставащи:{" "}
              <strong>
                {learningState.nextModule ? learningState.remainingModules.length + 1 : 0}
              </strong>
            </p>
            <p>
              Общо назначени: <strong>{learningState.modules.length}</strong>
            </p>
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="sa-card p-5">
          <h2 className="text-xl font-bold">Оставащи обучения</h2>
          <div className="mt-3 space-y-2">
            {learningState.remainingModules.length ? (
              learningState.remainingModules.map((module) => (
                <div key={module.moduleId} className="rounded-xl border border-[var(--line)] p-3">
                  <p className="font-semibold">{module.title}</p>
                  <p className="text-xs text-zinc-500">
                    {module.isMini ? "Мини модул" : "Основен модул"}
                  </p>
                  <Link
                    className="sa-link mt-2 inline-block text-sm"
                    href={`/employee/training/${module.moduleId}`}
                  >
                    Отвори
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600">Няма оставащи модули.</p>
            )}
          </div>
        </article>

        <article className="sa-card p-5">
          <h2 className="text-xl font-bold">Завършени обучения</h2>
          <div className="mt-3 space-y-2">
            {learningState.completedModules.length ? (
              learningState.completedModules.map((module) => (
                <div key={module.moduleId} className="rounded-xl border border-[var(--line)] p-3">
                  <p className="font-semibold">{module.title}</p>
                  <p className="text-xs text-emerald-700">Завършен модул</p>
                  {typeof module.lastScorePercent === "number" ? (
                    <p className="text-xs text-zinc-500">
                      Последен резултат: {module.lastScorePercent}%
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600">Все още няма завършени модули.</p>
            )}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
