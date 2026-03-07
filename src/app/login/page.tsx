import Link from "next/link";

import { LoginForm } from "@/components/login-form";
import { listDemoUsersByRoleResolved } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect, error } = await searchParams;
  const users = await listDemoUsersByRoleResolved();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start">
        <section className="sa-card sa-gradient flex-1 rounded-3xl p-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">SecureAware</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Вход за демонстрационна среда</h1>
          <p className="mt-4 text-white/90">
            Използвай ролите за да покажеш различни потребителски потоци: служител, мениджър и
            администратор.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            <li>Служител: обучение, тест, симулация и адаптивни задания</li>
            <li>Мениджър: табло с ключови показатели, риск по отдели и приоритети</li>
            <li>Админ: управление на модули, сценарии и правила</li>
          </ul>
          <Link className="mt-6 inline-block text-sm font-semibold underline" href="/">
            Назад към началната страница
          </Link>
        </section>

        <div className="flex-1">
          {error === "unauthorized" ? (
            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              Нямате достъп до тази секция с текущата роля.
            </p>
          ) : null}
          <LoginForm users={users} redirectTo={redirect} />
        </div>
      </div>
    </div>
  );
}
