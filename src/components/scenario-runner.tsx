"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { RiskBadge } from "@/components/risk-badge";
import { AttemptResult, Scenario, ScenarioOption } from "@/lib/types";

interface ScenarioRunnerProps {
  scenario: Scenario;
  options: ScenarioOption[];
  timed: boolean;
}

export function ScenarioRunner({ scenario, options, timed }: ScenarioRunnerProps) {
  const router = useRouter();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(scenario.timeLimitSec);
  const startedAtRef = useRef<number>(0);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const submit = useCallback(
    async (forceTimeout = false) => {
      if (pending || result) return;
      setPending(true);
      const responseTimeMs = forceTimeout
        ? scenario.timeLimitSec * 1000
        : Math.max(400, Date.now() - startedAtRef.current);
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          selectedOptionId: forceTimeout ? null : selectedOptionId,
          responseTimeMs,
        }),
      });
      const data = (await res.json()) as AttemptResult;
      setResult(data);
      setPending(false);
      router.refresh();
    },
    [pending, result, scenario.id, scenario.timeLimitSec, selectedOptionId, router]
  );

  useEffect(() => {
    if (!timed || result) return;
    const timer = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(timer);
          window.setTimeout(() => {
            void submit(true);
          }, 0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timed, result, submit]);

  return (
    <section className="sa-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--brand)]">{scenario.category}</p>
          <h3 className="text-xl font-bold">{scenario.title}</h3>
        </div>
        {timed ? (
          <div className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold">
            Оставащо време: {remaining}s
          </div>
        ) : null}
      </div>

      <p className="text-[15px] text-zinc-700">{scenario.prompt}</p>

      <div className="mt-5 grid gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] bg-white p-3 hover:border-[var(--brand)]"
          >
            <input
              type="radio"
              name={`scenario-${scenario.id}`}
              checked={selectedOptionId === option.id}
              onChange={() => setSelectedOptionId(option.id)}
            />
            <span>
              <strong>{option.label})</strong> {option.text}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          className="rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-ink)] disabled:opacity-60"
          onClick={() => submit(false)}
          type="button"
          disabled={pending || (!selectedOptionId && !timed)}
        >
          {pending ? "Изпращане..." : "Изпрати отговор"}
        </button>
        {timed ? (
          <button
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
            onClick={() => submit(true)}
            type="button"
            disabled={pending}
          >
            Пропусни
          </button>
        ) : null}
      </div>

      {result ? (
        <div className="mt-4 rounded-xl border border-[var(--line)] bg-zinc-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-zinc-600">Поведенчески риск:</span>
            <RiskBadge risk={result.behavioralRisk} />
          </div>
          <p className="text-sm">
            <strong>Знание:</strong> {result.knowledgeScore}% |{" "}
            <strong>Реакционен риск:</strong> {result.reactionRiskScore}%
          </p>
          <p className="mt-2 text-sm text-zinc-700">{result.explanation}</p>
          {result.followUpAssigned ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Назначен е мини модул и повторен тест след 14 дни.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
