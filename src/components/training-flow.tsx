"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LearningProgress, TestQuestionWithOptions, TrainingModule } from "@/lib/types";

interface TrainingFlowProps {
  module: TrainingModule;
  initialProgress: LearningProgress;
  questions: TestQuestionWithOptions[];
}

interface SessionState {
  sessionId: string;
  totalQuestions: number;
  passThreshold: number;
  currentIndex: number;
}

interface FeedbackState {
  correct: boolean;
  explanation: string;
}

interface FinalState {
  scorePercent: number;
  passed: boolean;
  correctCount: number;
  total: number;
}

function formatDurationMinutes(seconds: number): number {
  return Math.ceil(seconds / 60);
}

function formatVideoSize(sizeMb: number | null): string {
  if (typeof sizeMb !== "number") return "0.00";
  return sizeMb.toFixed(2);
}

const lessonSectionTitles = [
  "Основна идея",
  "Какво проверяваш първо",
  "Как разпознаваш риска",
  "Чести грешки",
  "Правилен модел за реакция",
  "Какво да запомниш",
];

function getLessonSectionTitle(index: number): string {
  return lessonSectionTitles[index] ?? `Ключов акцент ${index + 1}`;
}

export function TrainingFlow({ module, initialProgress, questions }: TrainingFlowProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [session, setSession] = useState<SessionState | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [finalResult, setFinalResult] = useState<FinalState | null>(null);
  const [pending, setPending] = useState(false);
  const questionStartedAt = useRef(0);

  useEffect(() => {
    questionStartedAt.current = Date.now();
  }, []);

  const currentQuestion = session ? questions[session.currentIndex] : null;
  const isReadyForTest = progress.testUnlocked;

  const markContentDone = async (mode: "VIDEO" | "TEXT") => {
    setPending(true);
    const res = await fetch("/api/learning/complete-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId: module.id,
        mode,
      }),
    });
    const data = (await res.json()) as { progress: LearningProgress };
    if (res.ok && data.progress) {
      setProgress(data.progress);
    }
    setPending(false);
  };

  const startTest = async () => {
    setPending(true);
    setFeedback(null);
    setFinalResult(null);
    const res = await fetch("/api/tests/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId: module.id,
      }),
    });
    const data = (await res.json()) as SessionState;
    if (res.ok) {
      setSession(data);
      setSelectedOptionId(null);
      questionStartedAt.current = Date.now();
    }
    setPending(false);
  };

  const finishTest = async (sessionId: string) => {
    const res = await fetch("/api/tests/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const data = (await res.json()) as FinalState;
    if (res.ok) {
      setFinalResult(data);
      setSession(null);
      setProgress((prev) => ({
        ...prev,
        attemptsCount: prev.attemptsCount + 1,
        lastPassed: data.passed,
        lastScorePercent: data.scorePercent,
      }));
      router.refresh();
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentQuestion || !selectedOptionId) return;
    setPending(true);
    const res = await fetch("/api/tests/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.sessionId,
        questionId: currentQuestion.id,
        selectedOptionId,
        responseTimeMs: Math.max(300, Date.now() - questionStartedAt.current),
      }),
    });
    const data = (await res.json()) as {
      correct: boolean;
      explanation: string;
      nextIndex: number;
      isComplete: boolean;
    };
    if (res.ok) {
      setFeedback({
        correct: data.correct,
        explanation: data.explanation,
      });
      if (data.isComplete) {
        await finishTest(session.sessionId);
      } else {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: data.nextIndex,
              }
            : prev
        );
        setSelectedOptionId(null);
        questionStartedAt.current = Date.now();
      }
    }
    setPending(false);
  };

  return (
    <section className="space-y-4">
      {!isReadyForTest ? (
        <article className="sa-card p-5">
          <h2 className="text-2xl font-bold">Стъпка 1: Премини обучението</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Достатъчно е да маркираш видео или текстовия вариант, за да отключиш теста.
          </p>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-[var(--line)] p-4">
              <p className="text-xs font-semibold uppercase text-zinc-500">Видео вариант</p>
              <div className="mt-3 rounded-xl bg-zinc-900 px-4 py-10 text-center text-white">
                {module.videoMockFileName ? (
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-wide text-zinc-300">Mock видео файл</p>
                    <p className="text-base font-semibold">
                      Видео: {module.videoMockFileName} · {formatVideoSize(module.videoMockFileSizeMb)} MB ·{" "}
                      {formatDurationMinutes(module.videoDurationSec)} мин
                    </p>
                  </div>
                ) : (
                  <>Видео визуализация ({formatDurationMinutes(module.videoDurationSec)} мин)</>
                )}
              </div>
              <button
                className="mt-4 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={pending}
                type="button"
                onClick={() => markContentDone("VIDEO")}
              >
                Маркирай видеото като прегледано
              </button>
            </div>

            <div className="rounded-2xl border border-[var(--line)] p-4">
              <p className="text-xs font-semibold uppercase text-zinc-500">Текстов вариант</p>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
                <div className="border-b border-[var(--line)] bg-zinc-50/80 px-5 py-4">
                  <h3 className="text-lg font-semibold text-[var(--brand-ink)]">Текстов материал</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    Прочети урока последователно. Материалът е подреден като кратко практическо ръководство.
                  </p>
                </div>

                <div className="divide-y divide-[var(--line)]">
                  {module.textSections.map((section, index) => (
                    <article key={`${module.id}_section_${index + 1}`} className="px-5 py-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                        {getLessonSectionTitle(index)}
                      </p>

                      {(index === 1 || index === 3) && (
                        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                          <strong>{index === 1 ? "Важно:" : "Запомни:"}</strong>{" "}
                          {index === 1
                            ? "Преди реакция първо валидирай контекста, подателя и канала."
                            : "При съмнение спираш действието, проверяваш и едва тогава продължаваш."}
                        </div>
                      )}

                      <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-zinc-700">
                        {section}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
              <button
                className="mt-4 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold disabled:opacity-60"
                disabled={pending}
                type="button"
                onClick={() => markContentDone("TEXT")}
              >
                Маркирай текста като прочетен
              </button>
            </div>
          </div>
        </article>
      ) : null}

      {isReadyForTest && !session && !finalResult ? (
        <article className="sa-card p-5">
          <h2 className="text-2xl font-bold">Стъпка 2: Тест ({module.questionCount} въпроса)</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Праг за успешно преминаване: {module.passThresholdPercent}% (
            {Math.ceil((module.questionCount * module.passThresholdPercent) / 100)}/
            {module.questionCount}).
          </p>
          <button
            className="mt-4 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            type="button"
            disabled={pending}
            onClick={startTest}
          >
            Стартирай теста
          </button>
        </article>
      ) : null}

      {session && currentQuestion ? (
        <article className="sa-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              Въпрос {session.currentIndex + 1} / {session.totalQuestions}
            </h2>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-[var(--brand)]"
                style={{
                  width: `${((session.currentIndex + 1) / session.totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>

          <p className="text-[15px] font-medium">{currentQuestion.prompt}</p>
          {currentQuestion.kind === "IMAGE" && currentQuestion.imageUrl ? (
            <Image
              src={currentQuestion.imageUrl}
              alt="Визуален пример към въпроса"
              width={960}
              height={540}
              className="mt-4 w-full rounded-xl border border-[var(--line)]"
            />
          ) : null}

          <div className="mt-4 grid gap-2">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] p-3"
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                />
                <span>
                  <strong>{option.label})</strong> {option.text}
                </span>
              </label>
            ))}
          </div>

          <button
            className="mt-4 rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            type="button"
            disabled={!selectedOptionId || pending}
            onClick={submitAnswer}
          >
            Изпрати отговор
          </button>

          {feedback ? (
            <p
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                feedback.correct ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
              }`}
            >
              {feedback.explanation}
            </p>
          ) : null}
        </article>
      ) : null}

      {finalResult ? (
        <article className="sa-card p-5">
          <h2 className="text-2xl font-bold">Стъпка 3: Резултат</h2>
          <p className="mt-2 text-sm">
            Резултат: <strong>{finalResult.scorePercent}%</strong> ({finalResult.correctCount}/
            {finalResult.total})
          </p>
          <p
            className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${
              finalResult.passed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
            }`}
          >
            {finalResult.passed ? "Преминат тест" : "Непреминат тест"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!finalResult.passed ? (
              <button
                className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
                type="button"
                onClick={startTest}
              >
                Повтори теста
              </button>
            ) : null}
            <Link
              href="/employee/home"
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
            >
              Обратно към моето обучение
            </Link>
          </div>
        </article>
      ) : null}
    </section>
  );
}
