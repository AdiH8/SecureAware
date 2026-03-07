"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompleteAssignmentButton({ assignmentId }: { assignmentId: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <button
      type="button"
      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold hover:border-[var(--brand)]"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/assignments/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId }),
        });
        setPending(false);
        router.refresh();
      }}
    >
      {pending ? "..." : "Маркирай като завършено"}
    </button>
  );
}
