"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Profile, Role } from "@/lib/types";

const roleLabels: Record<Role, string> = {
  EMPLOYEE: "Служител",
  MANAGER: "Мениджър",
  ADMIN: "Администратор",
};

export function LoginForm({
  users,
  redirectTo,
}: {
  users: Profile[];
  redirectTo?: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [userId, setUserId] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleUsers = useMemo(
    () => users.filter((user) => user.role === role).sort((a, b) => a.name.localeCompare(b.name)),
    [users, role]
  );

  return (
    <div className="sa-card w-full max-w-xl p-6">
      <h2 className="text-2xl font-bold">Вход в демо профил</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Изберете роля и потребител, за да отворите съответния продуктов поток.
      </p>

      <div className="mt-4 flex gap-2">
        {(["EMPLOYEE", "MANAGER", "ADMIN"] as Role[]).map((itemRole) => (
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              role === itemRole
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--line)] bg-white"
            }`}
            key={itemRole}
            type="button"
            onClick={() => {
              setRole(itemRole);
              setUserId("");
              setError(null);
            }}
          >
            {roleLabels[itemRole]}
          </button>
        ))}
      </div>

      <label className="mt-5 block">
        <span className="mb-1 block text-sm font-medium">Избери потребител</span>
        <select
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
        >
          <option value="">-- Избери --</option>
          {roleUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </label>
      {roleUsers.length === 0 ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Няма активни потребители за избраната роля. Провери данните в Supabase таблицата
          `profiles`.
        </p>
      ) : null}

      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

      <button
        className="mt-5 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-ink)] disabled:opacity-60"
        type="button"
        disabled={pending || !userId}
        onClick={async () => {
          setPending(true);
          setError(null);
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              redirect: redirectTo,
            }),
          });
          const data = (await res.json()) as { error?: string; redirect?: string };
          if (!res.ok) {
            setPending(false);
            setError(data.error ?? "Проблем при вход.");
            return;
          }
          router.push(data.redirect ?? "/");
          router.refresh();
        }}
      >
        {pending ? "Влизане..." : "Вход"}
      </button>
    </div>
  );
}
