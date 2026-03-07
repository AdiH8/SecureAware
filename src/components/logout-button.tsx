"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { uiCopy } from "@/content/bg";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--brand)]"
      onClick={async () => {
        setPending(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      disabled={pending}
      type="button"
    >
      {pending ? `${uiCopy.nav.logout}...` : uiCopy.nav.logout}
    </button>
  );
}
