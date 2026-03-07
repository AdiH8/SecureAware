"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RecomputeButton({ userId }: { userId?: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold hover:border-[var(--brand)] disabled:opacity-60"
        disabled={pending}
        type="button"
        onClick={async () => {
          setPending(true);
          const res = await fetch("/api/assignments/recompute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userId ? { userId } : {}),
          });
          const payload = (await res.json()) as { created?: number };
          setMessage(`Създадени задания: ${payload.created ?? 0}`);
          setPending(false);
          router.refresh();
        }}
      >
        {pending ? "Преизчисляване..." : "Преизчисли задания"}
      </button>
      {message ? <span className="text-xs text-zinc-500">{message}</span> : null}
    </div>
  );
}
