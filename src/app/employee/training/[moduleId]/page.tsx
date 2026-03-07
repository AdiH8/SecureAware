import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { TrainingFlow } from "@/components/training-flow";
import { requireSession } from "@/lib/auth";
import {
  getLearningProgressForModule,
  getModuleById,
  getUserByIdResolved,
  listModulesForEmployee,
  listTestQuestionsForModule,
} from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function EmployeeTrainingPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const session = await requireSession(["EMPLOYEE"]);
  const user = await getUserByIdResolved(session.userId);
  const { moduleId } = await params;
  if (!user) {
    return null;
  }

  const trainingModule = getModuleById(moduleId);
  if (!trainingModule) {
    notFound();
  }
  const allowedModuleIds = new Set(listModulesForEmployee(user.id).map((item) => item.id));
  if (!allowedModuleIds.has(trainingModule.id)) {
    notFound();
  }

  const progress = getLearningProgressForModule(user.id, trainingModule.id);
  const questions = listTestQuestionsForModule(trainingModule.id).slice(0, trainingModule.questionCount);

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="sa-card p-5">
        <p className="text-xs font-semibold uppercase text-zinc-500">
          {trainingModule.isMini ? "Адаптивен мини модул" : "Основен модул"}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{trainingModule.title}</h1>
        <p className="mt-2 text-sm text-zinc-700">{trainingModule.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {trainingModule.bulletPoints.map((point) => (
            <span
              key={point}
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs"
            >
              {point}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-4">
        <TrainingFlow module={trainingModule} initialProgress={progress} questions={questions} />
      </div>
    </AppShell>
  );
}

