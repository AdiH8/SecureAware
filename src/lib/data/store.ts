import { buildFollowUpAssignment, shouldTriggerRule } from "@/lib/adaptive";
import { createSeedState, SeedState } from "@/lib/data/seed";
import { isSelectedAnswerCorrect, isTestUnlocked, evaluateTestScore } from "@/lib/learning";
import { computeAttemptResult } from "@/lib/risk-engine";
import {
  MODULE_TEXT_SECTION_MIN_LENGTH,
  MODULE_TEXT_SECTIONS_MIN_COUNT,
} from "@/lib/module-schemas";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  AdminModuleInput,
  AdminOptionInput,
  AdminQuestionInput,
  AdminRuleInput,
  AdminScenarioInput,
  AdminScenarioOptionInput,
  AdminUserInput,
  Assignment,
  AssignmentRule,
  Attempt,
  AttemptInput,
  AtRiskUser,
  DashboardDepartmentBreakdown,
  DashboardMetrics,
  DashboardMistake,
  Department,
  EmployeeLearningModule,
  EmployeeLearningState,
  HistoryEntry,
  LearningMode,
  LearningProgress,
  Profile,
  Scenario,
  ScenarioOption,
  TestOption,
  TestQuestion,
  TestQuestionWithOptions,
  TrainingModule,
} from "@/lib/types";

declare global {
  var __secureAwareState: SeedState | undefined;
}

function ensureState(): SeedState {
  if (!globalThis.__secureAwareState) {
    globalThis.__secureAwareState = createSeedState();
  }
  return globalThis.__secureAwareState;
}

export function resetStoreForTests(): void {
  globalThis.__secureAwareState = createSeedState();
}

function riskBandFromScore(score: number): "HIGH" | "MEDIUM" | "SECURE" {
  if (score < 50) return "HIGH";
  if (score < 75) return "MEDIUM";
  return "SECURE";
}

function scenarioCategoryLabel(category: "PHISHING" | "URL" | "SOCIAL_ENGINEERING" | "MALWARE"): string {
  if (category === "PHISHING") return "фишинг";
  if (category === "URL") return "URL рискове";
  if (category === "SOCIAL_ENGINEERING") return "социално инженерство";
  return "зловреден софтуер";
}

function safePercent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function isActive<T extends { isArchived: boolean }>(item: T): boolean {
  return !item.isArchived;
}

function nowIso(): string {
  return new Date().toISOString();
}

function nextId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeModuleTextSections(textSections: string[]): string[] {
  const sections = textSections.map((section) => section.trim());
  if (sections.length < MODULE_TEXT_SECTIONS_MIN_COUNT) {
    throw new Error(`Материалът трябва да съдържа поне ${MODULE_TEXT_SECTIONS_MIN_COUNT} секции.`);
  }
  const shortIndex = sections.findIndex((section) => section.length < MODULE_TEXT_SECTION_MIN_LENGTH);
  if (shortIndex >= 0) {
    throw new Error(
      `Секция ${shortIndex + 1} трябва да е поне ${MODULE_TEXT_SECTION_MIN_LENGTH} символа.`
    );
  }
  return sections;
}

async function withSupabaseWrite(run: (client: NonNullable<ReturnType<typeof getSupabaseAdmin>>) => Promise<void>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    await run(supabase);
  } catch {
    // Fallback mode: keep in-memory state as source of truth when remote mirror fails.
  }
}

function getLatestAttemptByUser(userId: string): Attempt | undefined {
  const state = ensureState();
  return state.attempts
    .filter((attempt) => attempt.userId === userId && isActive(attempt))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
}

function getOrCreateProgress(userId: string, moduleId: string): LearningProgress {
  const state = ensureState();
  const existing = state.learningProgress.find(
    (progress) => progress.userId === userId && progress.moduleId === moduleId
  );
  if (existing) {
    return existing;
  }
  const created: LearningProgress = {
    userId,
    moduleId,
    videoCompleted: false,
    textCompleted: false,
    testUnlocked: false,
    attemptsCount: 0,
    lastScorePercent: null,
    lastPassed: null,
    updatedAt: new Date().toISOString(),
  };
  state.learningProgress.push(created);
  return created;
}

function canAccessModule(userId: string, module: TrainingModule): boolean {
  if (!isActive(module)) {
    return false;
  }
  if (!module.isMini) {
    return true;
  }
  const state = ensureState();
  return state.assignments.some(
    (assignment) => assignment.userId === userId && assignment.moduleId === module.id && isActive(assignment)
  );
}

function mapLearningModule(userId: string, module: TrainingModule): EmployeeLearningModule {
  const state = ensureState();
  const progress = getOrCreateProgress(userId, module.id);
  const completion = state.moduleCompletions.find(
    (item) => item.userId === userId && item.moduleId === module.id && isActive(item)
  );
  return {
    moduleId: module.id,
    title: module.title,
    isMini: module.isMini,
    status: completion ? "COMPLETED" : progress.testUnlocked ? "READY_FOR_TEST" : "NOT_STARTED",
    testUnlocked: progress.testUnlocked,
    lastScorePercent: progress.lastScorePercent,
  };
}

export function getLatestAttemptForUser(userId: string): Attempt | undefined {
  return getLatestAttemptByUser(userId);
}

export function listDemoUsersByRole(role?: Profile["role"]): Profile[] {
  const state = ensureState();
  const users = state.profiles.filter(isActive);
  if (!role) {
    return users;
  }
  return users.filter((user) => user.role === role);
}

export function getUserById(userId: string): Profile | undefined {
  const state = ensureState();
  return state.profiles.find((profile) => profile.id === userId);
}

export function listDepartments(): Department[] {
  const state = ensureState();
  return state.departments;
}

export function getDepartmentById(departmentId: string): Department | undefined {
  const state = ensureState();
  return state.departments.find((department) => department.id === departmentId);
}

export function listEmployeesByDepartment(departmentId: string): Profile[] {
  const state = ensureState();
  return state.profiles
    .filter(
      (profile) =>
        profile.departmentId === departmentId && profile.role === "EMPLOYEE" && isActive(profile)
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listModules(): TrainingModule[] {
  const state = ensureState();
  return state.modules.filter(isActive).sort((a, b) => a.order - b.order);
}

export function listModulesForEmployee(userId: string): TrainingModule[] {
  return listModules().filter((module) => canAccessModule(userId, module));
}

export function getModuleById(moduleId: string): TrainingModule | undefined {
  const state = ensureState();
  return state.modules.find((module) => module.id === moduleId && isActive(module));
}

export function getScenarioById(scenarioId: string) {
  const state = ensureState();
  return state.scenarios.find((scenario) => scenario.id === scenarioId && isActive(scenario));
}

export function getOptionsByScenarioId(scenarioId: string): ScenarioOption[] {
  const state = ensureState();
  return state.scenarioOptions.filter(
    (option) => option.scenarioId === scenarioId && isActive(option)
  );
}

export function getScenariosForModule(moduleId: string) {
  const state = ensureState();
  return state.scenarios.filter((scenario) => scenario.moduleId === moduleId && isActive(scenario));
}

export function listScenarios() {
  const state = ensureState();
  return state.scenarios.filter(isActive);
}

export function listAssignmentRules() {
  const state = ensureState();
  return state.assignmentRules.filter(isActive);
}

export function listAssignmentsForUser(userId: string): Assignment[] {
  const state = ensureState();
  return state.assignments
    .filter((assignment) => assignment.userId === userId && isActive(assignment))
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}

export function listAttemptsForUser(userId: string): Attempt[] {
  const state = ensureState();
  return state.attempts
    .filter((attempt) => attempt.userId === userId && isActive(attempt))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export function markAssignmentCompleted(assignmentId: string): Assignment | null {
  const state = ensureState();
  const assignment = state.assignments.find((item) => item.id === assignmentId && isActive(item));
  if (!assignment) {
    return null;
  }
  assignment.status = "COMPLETED";
  assignment.updatedAt = nowIso();
  return assignment;
}

export function getLearningProgressForModule(
  userId: string,
  moduleId: string
): LearningProgress {
  return getOrCreateProgress(userId, moduleId);
}

export function getEmployeeLearningState(userId: string): EmployeeLearningState {
  const modules = listModulesForEmployee(userId);
  const mapped = modules.map((module) => mapLearningModule(userId, module));
  const progress = modules.map((module) => getOrCreateProgress(userId, module.id));
  const completedModules = mapped.filter((module) => module.status === "COMPLETED");
  const notCompleted = mapped.filter((module) => module.status !== "COMPLETED");
  const nextModule = notCompleted.length ? notCompleted[0] : null;
  const remainingModules = nextModule ? notCompleted.slice(1) : [];
  return {
    nextModule,
    remainingModules,
    completedModules,
    modules: mapped,
    progress,
  };
}

export function markLearningContentComplete(params: {
  userId: string;
  moduleId: string;
  mode: LearningMode;
}): LearningProgress {
  const progress = getOrCreateProgress(params.userId, params.moduleId);
  if (params.mode === "VIDEO") {
    progress.videoCompleted = true;
  } else {
    progress.textCompleted = true;
  }
  progress.testUnlocked = isTestUnlocked(progress);
  progress.updatedAt = new Date().toISOString();
  return progress;
}

export function listTestQuestionsForModule(moduleId: string): TestQuestionWithOptions[] {
  const state = ensureState();
  const questions = state.testQuestions
    .filter((question) => question.moduleId === moduleId && isActive(question))
    .sort((a, b) => a.order - b.order);
  return questions.map((question) => ({
    ...question,
    options: state.testOptions
      .filter((option) => option.questionId === question.id && isActive(option))
      .sort((a, b) => a.label.localeCompare(b.label)),
  }));
}

export function getActiveTestSession(userId: string, moduleId: string) {
  const state = ensureState();
  return state.testSessions.find(
    (session) =>
      session.userId === userId &&
      session.moduleId === moduleId &&
      session.status === "IN_PROGRESS"
  );
}

export function startTestSession(params: { userId: string; moduleId: string }) {
  const state = ensureState();
  const trainingModule = getModuleById(params.moduleId);
  if (!trainingModule) {
    throw new Error("Модулът не е намерен");
  }
  if (!canAccessModule(params.userId, trainingModule)) {
    throw new Error("Модулът не е назначен за този служител");
  }

  const progress = getOrCreateProgress(params.userId, trainingModule.id);
  if (!progress.testUnlocked) {
    throw new Error("Тестът е заключен. Маркирайте видео или текст първо.");
  }

  const existing = getActiveTestSession(params.userId, trainingModule.id);
  if (existing) {
    return existing;
  }

  const activeQuestionIds = listTestQuestionsForModule(trainingModule.id).map((question) => question.id);
  const totalQuestions = Math.min(trainingModule.questionCount, activeQuestionIds.length);
  if (totalQuestions < 1) {
    throw new Error("Няма активни въпроси за този модул");
  }

  const session = {
    id: `ts_${Date.now()}`,
    userId: params.userId,
    moduleId: trainingModule.id,
    questionIds: activeQuestionIds.slice(0, totalQuestions),
    currentIndex: 0,
    totalQuestions,
    passThreshold: trainingModule.passThresholdPercent,
    status: "IN_PROGRESS" as const,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    answers: [],
  };
  state.testSessions.push(session);
  return session;
}

export function answerTestQuestion(params: {
  userId: string;
  sessionId: string;
  questionId: string;
  selectedOptionId: string;
  responseTimeMs: number;
}) {
  const state = ensureState();
  const session = state.testSessions.find((item) => item.id === params.sessionId);
  if (!session || session.userId !== params.userId) {
    throw new Error("Сесията не е намерена");
  }
  if (session.status !== "IN_PROGRESS") {
    throw new Error("Сесията не е активна");
  }
  const expectedQuestionId = session.questionIds[session.currentIndex];
  if (expectedQuestionId !== params.questionId) {
    throw new Error("Невалиден ред на въпросите");
  }

  const options = state.testOptions.filter((option) => option.questionId === params.questionId);
  const selected = options.find((option) => option.id === params.selectedOptionId);
  if (!selected) {
    throw new Error("Избраният отговор не е намерен");
  }
  const question = state.testQuestions.find((item) => item.id === params.questionId);
  if (!question) {
    throw new Error("Въпросът не е намерен");
  }

  const correct = isSelectedAnswerCorrect(options, selected.id);
  session.answers.push({
    questionId: params.questionId,
    selectedOptionId: params.selectedOptionId,
    responseTimeMs: params.responseTimeMs,
    correct,
    answeredAt: new Date().toISOString(),
  });
  session.currentIndex += 1;

  return {
    correct,
    explanation: question.explanation,
    nextIndex: session.currentIndex,
    isComplete: session.currentIndex >= session.totalQuestions,
  };
}

export function finishTestSession(params: { userId: string; sessionId: string }) {
  const state = ensureState();
  const session = state.testSessions.find((item) => item.id === params.sessionId);
  if (!session || session.userId !== params.userId) {
    throw new Error("Сесията не е намерена");
  }
  if (session.status !== "IN_PROGRESS") {
    throw new Error("Сесията вече е приключена");
  }
  if (session.answers.length < session.totalQuestions) {
    throw new Error("Отговорете на всички въпроси преди финализиране");
  }

  const correctCount = session.answers.filter((answer) => answer.correct).length;
  const score = evaluateTestScore({
    correctCount,
    total: session.totalQuestions,
    thresholdPercent: session.passThreshold,
  });

  session.status = "FINISHED";
  session.finishedAt = new Date().toISOString();

  const progress = getOrCreateProgress(params.userId, session.moduleId);
  progress.attemptsCount += 1;
  progress.lastScorePercent = score.scorePercent;
  progress.lastPassed = score.passed;
  progress.updatedAt = new Date().toISOString();

  if (score.passed) {
    const existing = state.moduleCompletions.find(
      (item) => item.userId === params.userId && item.moduleId === session.moduleId && isActive(item)
    );
    if (existing) {
      existing.scorePercent = score.scorePercent;
      existing.completedAt = new Date().toISOString();
      existing.updatedAt = new Date().toISOString();
    } else {
      state.moduleCompletions.push({
        userId: params.userId,
        moduleId: session.moduleId,
        scorePercent: score.scorePercent,
        completedAt: new Date().toISOString(),
        isArchived: false,
        archivedAt: null,
        updatedAt: new Date().toISOString(),
      });
    }
    state.assignments
      .filter(
        (assignment) =>
          assignment.userId === params.userId &&
          assignment.moduleId === session.moduleId &&
          assignment.status === "PENDING" &&
          isActive(assignment)
      )
      .forEach((assignment) => {
        assignment.status = "COMPLETED";
        assignment.updatedAt = new Date().toISOString();
      });
  }

  return {
    scorePercent: score.scorePercent,
    passed: score.passed,
    correctCount,
    total: session.totalQuestions,
  };
}

export async function recordAttempt(params: {
  actorUserId: string;
  input: AttemptInput;
}): Promise<{
  attempt: Attempt;
  followUpAssigned: boolean;
  explanation: string;
}> {
  const state = ensureState();
  const user = getUserById(params.actorUserId);
  if (!user) {
    throw new Error("Потребителят не е намерен");
  }

  const scenario = getScenarioById(params.input.scenarioId);
  if (!scenario) {
    throw new Error("Сценарият не е намерен");
  }
  const selectedOption = params.input.selectedOptionId
    ? state.scenarioOptions.find((option) => option.id === params.input.selectedOptionId) ?? null
    : null;
  if (params.input.selectedOptionId && !selectedOption) {
    throw new Error("Избраният вариант не е намерен");
  }

  const result = computeAttemptResult({
    scenario,
    selectedOption,
    responseTimeMs: params.input.responseTimeMs,
  });

  const now = new Date();
  const attempt: Attempt = {
    id: `att_${Date.now()}`,
    organizationId: user.organizationId,
    userId: user.id,
    scenarioId: scenario.id,
    selectedOptionId: selectedOption?.id ?? null,
    responseTimeMs: params.input.responseTimeMs,
    isCorrect: Boolean(selectedOption?.isCorrect),
    knowledgeScore: result.knowledgeScore,
    reactionRiskScore: result.reactionRiskScore,
    behavioralRisk: result.behavioralRisk,
    createdAt: now.toISOString(),
    isArchived: false,
    archivedAt: null,
    updatedAt: now.toISOString(),
  };
  state.attempts.push(attempt);

  if (!attempt.isCorrect) {
    state.riskEvents.push({
      id: `evt_${Date.now()}`,
      organizationId: user.organizationId,
      userId: user.id,
      scenarioId: scenario.id,
      type: "WRONG_ACTION",
      severity: scenario.severity,
      createdAt: now.toISOString(),
      isArchived: false,
      archivedAt: null,
      updatedAt: now.toISOString(),
    });
  }
  if (attempt.reactionRiskScore >= 70) {
    state.riskEvents.push({
      id: `evt_${Date.now() + 1}`,
      organizationId: user.organizationId,
      userId: user.id,
      scenarioId: scenario.id,
      type: "SLOW_RESPONSE",
      severity: scenario.severity,
      createdAt: now.toISOString(),
      isArchived: false,
      archivedAt: null,
      updatedAt: now.toISOString(),
    });
  }

  const alreadyAssigned = new Set(
    state.assignments
      .filter(
        (assignment) => assignment.userId === user.id && assignment.status === "PENDING" && isActive(assignment)
      )
      .map((assignment) => assignment.moduleId)
  );
  let followUpAssigned = false;
  for (const rule of state.assignmentRules.filter(isActive)) {
    if (
      shouldTriggerRule({
        rule,
        attempt,
        scenario,
      }) &&
      !alreadyAssigned.has(rule.moduleId)
    ) {
      state.assignments.push(
        buildFollowUpAssignment({
          organizationId: user.organizationId,
          userId: user.id,
          rule,
          reason: `Автоматично последващо обучение след инцидент в ${scenarioCategoryLabel(
            scenario.category
          )}`,
          now,
        })
      );
      followUpAssigned = true;
      alreadyAssigned.add(rule.moduleId);
    }
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("attempts").insert({
      id: attempt.id,
      organization_id: attempt.organizationId,
      user_id: attempt.userId,
      scenario_id: attempt.scenarioId,
      selected_option_id: attempt.selectedOptionId,
      response_time_ms: attempt.responseTimeMs,
      is_correct: attempt.isCorrect,
      knowledge_score: attempt.knowledgeScore,
      reaction_risk_score: attempt.reactionRiskScore,
      behavioral_risk: attempt.behavioralRisk,
      created_at: attempt.createdAt,
    });
  }

  return {
    attempt,
    followUpAssigned,
    explanation: result.explanation,
  };
}

export function recomputeAssignments(userId?: string): { created: number } {
  const state = ensureState();
  const users = userId
    ? state.profiles.filter((user) => user.id === userId && isActive(user))
    : state.profiles.filter(isActive);
  let created = 0;

  users.forEach((user) => {
    if (user.role !== "EMPLOYEE") {
      return;
    }
    const attempts = listAttemptsForUser(user.id).slice(-3);
    attempts.forEach((attempt) => {
      const scenario = getScenarioById(attempt.scenarioId);
      if (!scenario) {
        return;
      }
      state.assignmentRules.filter(isActive).forEach((rule) => {
        const exists = state.assignments.some(
          (assignment) =>
            assignment.userId === user.id &&
            assignment.moduleId === rule.moduleId &&
            assignment.status === "PENDING" &&
            isActive(assignment)
        );
        if (exists) {
          return;
        }
        if (shouldTriggerRule({ rule, attempt, scenario })) {
          state.assignments.push(
            buildFollowUpAssignment({
              organizationId: user.organizationId,
              userId: user.id,
              rule,
              reason: `Автоматично преизчисляване след сценарий: ${scenario.title}`,
              now: new Date(),
            })
          );
          created += 1;
        }
      });
    });
  });

  return { created };
}

function calculateDepartmentBreakdown(
  departmentId?: string
): DashboardDepartmentBreakdown[] {
  const state = ensureState();
  const departments = departmentId
    ? state.departments.filter((department) => department.id === departmentId)
    : state.departments;

  return departments.map((department) => {
    const employeeIds = state.profiles
      .filter(
        (profile) => profile.departmentId === department.id && profile.role === "EMPLOYEE" && isActive(profile)
      )
      .map((profile) => profile.id);
    const attempts = state.attempts.filter(
      (attempt) => employeeIds.includes(attempt.userId) && isActive(attempt)
    );
    const avgKnowledgeScore = attempts.length
      ? Math.round(
          attempts.reduce((sum, attempt) => sum + attempt.knowledgeScore, 0) / attempts.length
        )
      : 0;
    const avgReactionRisk = attempts.length
      ? Math.round(
          attempts.reduce((sum, attempt) => sum + attempt.reactionRiskScore, 0) / attempts.length
        )
      : 0;
    const overallRiskScore = Math.round((avgKnowledgeScore + (100 - avgReactionRisk)) / 2);

    return {
      departmentId: department.id,
      departmentName: department.name,
      avgKnowledgeScore,
      avgReactionRisk,
      overallRiskScore,
      riskBand: riskBandFromScore(overallRiskScore),
      sampleSize: attempts.length,
    };
  });
}

function calculateCommonMistakes(departmentId?: string): DashboardMistake[] {
  const state = ensureState();
  const targetUserIds = state.profiles
    .filter(
      (profile) =>
        profile.role === "EMPLOYEE" &&
        (!departmentId || profile.departmentId === departmentId) &&
        isActive(profile)
    )
    .map((profile) => profile.id);

  const mistakeAttempts = state.attempts.filter(
    (attempt) => targetUserIds.includes(attempt.userId) && !attempt.isCorrect && isActive(attempt)
  );
  const labelByAction = new Map<string, string>();
  const countByAction = new Map<string, number>();

  mistakeAttempts.forEach((attempt) => {
    const option = state.scenarioOptions.find((item) => item.id === attempt.selectedOptionId);
    const actionType = option?.actionType ?? "IGNORE";
    labelByAction.set(actionType, option?.text ?? actionType);
    countByAction.set(actionType, (countByAction.get(actionType) ?? 0) + 1);
  });

  return Array.from(countByAction.entries())
    .map(([actionType, count]) => ({
      actionType: actionType as DashboardMistake["actionType"],
      count,
      label: labelByAction.get(actionType) ?? actionType,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function calculateAtRiskUsers(departmentId?: string): AtRiskUser[] {
  const state = ensureState();
  const employees = state.profiles.filter(
    (profile) =>
      profile.role === "EMPLOYEE" &&
      (!departmentId || profile.departmentId === departmentId) &&
      isActive(profile)
  );

  return employees
    .map((employee) => {
      const latest = getLatestAttemptByUser(employee.id);
      if (!latest) {
        return null;
      }
      const departmentName =
        state.departments.find((department) => department.id === employee.departmentId)?.name ??
        "Н/Д";
      return {
        userId: employee.id,
        name: employee.name,
        departmentName,
        latestRiskBand: latest.behavioralRisk,
        latestKnowledgeScore: latest.knowledgeScore,
        latestReactionRisk: latest.reactionRiskScore,
      } as AtRiskUser;
    })
    .filter((item): item is AtRiskUser => Boolean(item))
    .sort((a, b) => {
      const scoreA = a.latestKnowledgeScore - a.latestReactionRisk;
      const scoreB = b.latestKnowledgeScore - b.latestReactionRisk;
      return scoreA - scoreB;
    })
    .slice(0, 8);
}

export async function getDashboardMetrics(departmentId?: string): Promise<DashboardMetrics> {
  const state = ensureState();
  const deptBreakdown = calculateDepartmentBreakdown(departmentId);
  const attempts = departmentId
    ? state.attempts.filter((attempt) => {
        const user = getUserById(attempt.userId);
        return user?.departmentId === departmentId && isActive(attempt);
      })
    : state.attempts.filter(isActive);

  const riskyClicks = attempts.filter((attempt) => {
    const option = state.scenarioOptions.find((item) => item.id === attempt.selectedOptionId);
    if (!option || option.isArchived) return false;
    return option.actionType === "CLICK_LINK" || option.actionType === "OPEN_ATTACHMENT";
  }).length;
  const reports = attempts.filter((attempt) => {
    const option = state.scenarioOptions.find((item) => item.id === attempt.selectedOptionId);
    if (!option || option.isArchived) return false;
    return option.actionType === "REPORT_TO_IT";
  }).length;

  const avgOrgScore = deptBreakdown.length
    ? Math.round(
        deptBreakdown.reduce((sum, dept) => sum + dept.overallRiskScore, 0) /
          deptBreakdown.length
      )
    : 0;

  return {
    orgRiskScore: avgOrgScore,
    clickRate: safePercent(riskyClicks, attempts.length),
    reportRate: safePercent(reports, attempts.length),
    deptBreakdown,
    commonMistakes: calculateCommonMistakes(departmentId),
    atRiskUsers: calculateAtRiskUsers(departmentId),
  };
}

function archiveState(isArchived: boolean) {
  return {
    isArchived,
    archivedAt: isArchived ? nowIso() : null,
    updatedAt: nowIso(),
  };
}

function refreshModuleQuestionIds(moduleId: string): void {
  const state = ensureState();
  const trainingModule = state.modules.find((item) => item.id === moduleId);
  if (!trainingModule) return;
  trainingModule.testQuestionIds = state.testQuestions
    .filter((question) => question.moduleId === moduleId && isActive(question))
    .sort((a, b) => a.order - b.order)
    .map((question) => question.id);
  trainingModule.updatedAt = nowIso();
}

export function listAdminUsers(): Profile[] {
  const state = ensureState();
  return state.profiles.filter((profile) => profile.role !== "ADMIN");
}

export async function createAdminUser(input: AdminUserInput): Promise<Profile> {
  const state = ensureState();
  if (!state.departments.some((department) => department.id === input.departmentId)) {
    throw new Error("Невалиден отдел");
  }
  if (state.profiles.some((profile) => profile.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Имейлът вече се използва");
  }
  const created: Profile = {
    id: nextId("usr_admin"),
    organizationId: state.organization.id,
    departmentId: input.departmentId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    isArchived: false,
    archivedAt: null,
    updatedAt: nowIso(),
  };
  state.profiles.push(created);

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("profiles").upsert({
      id: created.id,
      organization_id: created.organizationId,
      department_id: created.departmentId,
      name: created.name,
      email: created.email,
      role: created.role,
      is_archived: created.isArchived,
      archived_at: created.archivedAt,
      updated_at: created.updatedAt,
    });
  });

  return created;
}

export async function updateAdminUser(
  userId: string,
  patch: Partial<AdminUserInput>
): Promise<Profile> {
  const state = ensureState();
  const profile = state.profiles.find((item) => item.id === userId && item.role !== "ADMIN");
  if (!profile) {
    throw new Error("Потребителят не е намерен");
  }
  if (patch.departmentId && !state.departments.some((department) => department.id === patch.departmentId)) {
    throw new Error("Невалиден отдел");
  }
  if (patch.email) {
    const email = patch.email.trim().toLowerCase();
    const duplicate = state.profiles.find(
      (item) => item.id !== userId && item.email.toLowerCase() === email
    );
    if (duplicate) {
      throw new Error("Имейлът вече се използва");
    }
    profile.email = email;
  }
  if (patch.name !== undefined) profile.name = patch.name.trim();
  if (patch.departmentId) profile.departmentId = patch.departmentId;
  if (patch.role) profile.role = patch.role;
  profile.updatedAt = nowIso();

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("profiles").update({
      department_id: profile.departmentId,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      updated_at: profile.updatedAt,
    }).eq("id", profile.id);
  });

  return profile;
}

export async function setAdminUserArchived(userId: string, isArchived: boolean): Promise<Profile> {
  const state = ensureState();
  const profile = state.profiles.find((item) => item.id === userId && item.role !== "ADMIN");
  if (!profile) {
    throw new Error("Потребителят не е намерен");
  }
  Object.assign(profile, archiveState(isArchived));

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("profiles").update({
      is_archived: profile.isArchived,
      archived_at: profile.archivedAt,
      updated_at: profile.updatedAt,
    }).eq("id", profile.id);
  });

  return profile;
}

export function listAdminModules(): TrainingModule[] {
  const state = ensureState();
  return [...state.modules].sort((a, b) => a.order - b.order);
}

export async function createAdminModule(input: AdminModuleInput): Promise<TrainingModule> {
  const state = ensureState();
  const sanitizedTextSections = sanitizeModuleTextSections(input.textSections);
  const created: TrainingModule = {
    id: nextId("mod_admin"),
    title: input.title.trim(),
    category: input.category,
    isMini: input.isMini,
    order: input.order,
    durationMinutes: input.durationMinutes,
    videoDurationSec: input.videoDurationSec,
    videoMockFileName: input.videoMockFileName ?? null,
    videoMockFileSizeMb: input.videoMockFileSizeMb ?? null,
    questionCount: input.questionCount,
    passThresholdPercent: input.passThresholdPercent,
    description: input.description.trim(),
    bulletPoints: input.bulletPoints,
    textSections: sanitizedTextSections,
    testQuestionIds: [],
    isArchived: false,
    archivedAt: null,
    updatedAt: nowIso(),
  };
  state.modules.push(created);

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("modules").upsert({
      id: created.id,
      title: created.title,
      category: created.category,
      is_mini: created.isMini,
      order_index: created.order,
      duration_minutes: created.durationMinutes,
      video_duration_sec: created.videoDurationSec,
      video_mock_file_name: created.videoMockFileName,
      video_mock_file_size_mb: created.videoMockFileSizeMb,
      question_count: created.questionCount,
      pass_threshold_percent: created.passThresholdPercent,
      description: created.description,
      bullet_points: created.bulletPoints,
      text_sections: created.textSections,
      test_question_ids: created.testQuestionIds,
      is_archived: created.isArchived,
      archived_at: created.archivedAt,
      updated_at: created.updatedAt,
    });
  });

  return created;
}

export async function updateAdminModule(
  moduleId: string,
  patch: Partial<AdminModuleInput>
): Promise<TrainingModule> {
  const state = ensureState();
  const trainingModule = state.modules.find((item) => item.id === moduleId);
  if (!trainingModule) {
    throw new Error("Модулът не е намерен");
  }

  if (patch.title !== undefined) trainingModule.title = patch.title.trim();
  if (patch.category) trainingModule.category = patch.category;
  if (patch.isMini !== undefined) trainingModule.isMini = patch.isMini;
  if (patch.order !== undefined) trainingModule.order = patch.order;
  if (patch.durationMinutes !== undefined) trainingModule.durationMinutes = patch.durationMinutes;
  if (patch.videoDurationSec !== undefined) trainingModule.videoDurationSec = patch.videoDurationSec;
  if (patch.videoMockFileName !== undefined) trainingModule.videoMockFileName = patch.videoMockFileName;
  if (patch.videoMockFileSizeMb !== undefined) {
    trainingModule.videoMockFileSizeMb = patch.videoMockFileSizeMb;
  }
  if (patch.questionCount !== undefined) trainingModule.questionCount = patch.questionCount;
  if (patch.passThresholdPercent !== undefined) {
    trainingModule.passThresholdPercent = patch.passThresholdPercent;
  }
  if (patch.description !== undefined) trainingModule.description = patch.description.trim();
  if (patch.bulletPoints) trainingModule.bulletPoints = patch.bulletPoints;
  if (patch.textSections !== undefined) {
    trainingModule.textSections = sanitizeModuleTextSections(patch.textSections);
  }
  trainingModule.updatedAt = nowIso();

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("modules").update({
      title: trainingModule.title,
      category: trainingModule.category,
      is_mini: trainingModule.isMini,
      order_index: trainingModule.order,
      duration_minutes: trainingModule.durationMinutes,
      video_duration_sec: trainingModule.videoDurationSec,
      video_mock_file_name: trainingModule.videoMockFileName,
      video_mock_file_size_mb: trainingModule.videoMockFileSizeMb,
      question_count: trainingModule.questionCount,
      pass_threshold_percent: trainingModule.passThresholdPercent,
      description: trainingModule.description,
      bullet_points: trainingModule.bulletPoints,
      text_sections: trainingModule.textSections,
      test_question_ids: trainingModule.testQuestionIds,
      updated_at: trainingModule.updatedAt,
    }).eq("id", trainingModule.id);
  });

  return trainingModule;
}

export async function setAdminModuleArchived(moduleId: string, isArchived: boolean): Promise<TrainingModule> {
  const state = ensureState();
  const trainingModule = state.modules.find((item) => item.id === moduleId);
  if (!trainingModule) {
    throw new Error("Модулът не е намерен");
  }
  Object.assign(trainingModule, archiveState(isArchived));

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("modules").update({
      is_archived: trainingModule.isArchived,
      archived_at: trainingModule.archivedAt,
      updated_at: trainingModule.updatedAt,
    }).eq("id", trainingModule.id);
  });

  return trainingModule;
}

export function listAdminQuestions(moduleId?: string): TestQuestionWithOptions[] {
  const state = ensureState();
  const questions = state.testQuestions
    .filter((question) => (moduleId ? question.moduleId === moduleId : true))
    .sort((a, b) => a.order - b.order);
  return questions.map((question) => ({
    ...question,
    options: state.testOptions
      .filter((option) => option.questionId === question.id)
      .sort((a, b) => a.label.localeCompare(b.label)),
  }));
}

export async function createAdminQuestion(input: AdminQuestionInput): Promise<TestQuestion> {
  const state = ensureState();
  const trainingModule = state.modules.find((item) => item.id === input.moduleId);
  if (!trainingModule) {
    throw new Error("Модулът не е намерен");
  }
  const created: TestQuestion = {
    id: nextId("tq_admin"),
    moduleId: input.moduleId,
    kind: input.kind,
    order: input.order,
    prompt: input.prompt.trim(),
    imageUrl: input.imageUrl,
    explanation: input.explanation.trim(),
    isArchived: false,
    archivedAt: null,
    updatedAt: nowIso(),
  };
  state.testQuestions.push(created);
  refreshModuleQuestionIds(created.moduleId);

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("test_questions").upsert({
      id: created.id,
      module_id: created.moduleId,
      kind: created.kind,
      order_index: created.order,
      prompt: created.prompt,
      image_url: created.imageUrl,
      explanation: created.explanation,
      is_archived: created.isArchived,
      archived_at: created.archivedAt,
      updated_at: created.updatedAt,
    });
  });

  return created;
}

export async function updateAdminQuestion(
  questionId: string,
  patch: Partial<AdminQuestionInput>
): Promise<TestQuestion> {
  const state = ensureState();
  const question = state.testQuestions.find((item) => item.id === questionId);
  if (!question) {
    throw new Error("Въпросът не е намерен");
  }
  if (patch.moduleId) {
    question.moduleId = patch.moduleId;
  }
  if (patch.kind) question.kind = patch.kind;
  if (patch.order !== undefined) question.order = patch.order;
  if (patch.prompt !== undefined) question.prompt = patch.prompt.trim();
  if (patch.imageUrl !== undefined) question.imageUrl = patch.imageUrl;
  if (patch.explanation !== undefined) question.explanation = patch.explanation.trim();
  question.updatedAt = nowIso();
  refreshModuleQuestionIds(question.moduleId);

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("test_questions").update({
      module_id: question.moduleId,
      kind: question.kind,
      order_index: question.order,
      prompt: question.prompt,
      image_url: question.imageUrl,
      explanation: question.explanation,
      updated_at: question.updatedAt,
    }).eq("id", question.id);
  });

  return question;
}

export async function setAdminQuestionArchived(questionId: string, isArchived: boolean): Promise<TestQuestion> {
  const state = ensureState();
  const question = state.testQuestions.find((item) => item.id === questionId);
  if (!question) {
    throw new Error("Въпросът не е намерен");
  }
  Object.assign(question, archiveState(isArchived));
  refreshModuleQuestionIds(question.moduleId);

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("test_questions").update({
      is_archived: question.isArchived,
      archived_at: question.archivedAt,
      updated_at: question.updatedAt,
    }).eq("id", question.id);
  });

  return question;
}

function enforceSingleCorrectOption(questionId: string, optionId: string): void {
  const state = ensureState();
  state.testOptions
    .filter((option) => option.questionId === questionId && option.id !== optionId)
    .forEach((option) => {
      option.isCorrect = false;
      option.updatedAt = nowIso();
    });
}

export async function createAdminOption(input: AdminOptionInput): Promise<TestOption> {
  const state = ensureState();
  if (!state.testQuestions.some((question) => question.id === input.questionId)) {
    throw new Error("Въпросът не е намерен");
  }
  const created: TestOption = {
    id: nextId("to_admin"),
    questionId: input.questionId,
    label: input.label.trim().toUpperCase(),
    text: input.text.trim(),
    isCorrect: input.isCorrect,
    isArchived: false,
    archivedAt: null,
    updatedAt: nowIso(),
  };
  state.testOptions.push(created);
  if (created.isCorrect) {
    enforceSingleCorrectOption(created.questionId, created.id);
  }

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("test_options").upsert({
      id: created.id,
      question_id: created.questionId,
      label: created.label,
      text: created.text,
      is_correct: created.isCorrect,
      is_archived: created.isArchived,
      archived_at: created.archivedAt,
      updated_at: created.updatedAt,
    });
  });

  return created;
}

export async function updateAdminOption(
  optionId: string,
  patch: Partial<AdminOptionInput>
): Promise<TestOption> {
  const state = ensureState();
  const option = state.testOptions.find((item) => item.id === optionId);
  if (!option) {
    throw new Error("Отговорът не е намерен");
  }
  if (patch.questionId) option.questionId = patch.questionId;
  if (patch.label !== undefined) option.label = patch.label.trim().toUpperCase();
  if (patch.text !== undefined) option.text = patch.text.trim();
  if (patch.isCorrect !== undefined) option.isCorrect = patch.isCorrect;
  option.updatedAt = nowIso();
  if (option.isCorrect) {
    enforceSingleCorrectOption(option.questionId, option.id);
  }

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("test_options").update({
      question_id: option.questionId,
      label: option.label,
      text: option.text,
      is_correct: option.isCorrect,
      updated_at: option.updatedAt,
    }).eq("id", option.id);
  });

  return option;
}

export async function setAdminOptionArchived(optionId: string, isArchived: boolean): Promise<TestOption> {
  const state = ensureState();
  const option = state.testOptions.find((item) => item.id === optionId);
  if (!option) {
    throw new Error("Отговорът не е намерен");
  }
  Object.assign(option, archiveState(isArchived));

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("test_options").update({
      is_archived: option.isArchived,
      archived_at: option.archivedAt,
      updated_at: option.updatedAt,
    }).eq("id", option.id);
  });

  return option;
}

export function listAdminScenarios(): Scenario[] {
  const state = ensureState();
  return state.scenarios;
}

export async function createAdminScenario(input: AdminScenarioInput): Promise<Scenario> {
  const state = ensureState();
  const created: Scenario = {
    id: nextId("scn_admin"),
    moduleId: input.moduleId,
    category: input.category,
    severity: input.severity,
    title: input.title.trim(),
    prompt: input.prompt.trim(),
    timeLimitSec: input.timeLimitSec,
    isArchived: false,
    archivedAt: null,
    updatedAt: nowIso(),
  };
  state.scenarios.push(created);

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("scenarios").upsert({
      id: created.id,
      module_id: created.moduleId,
      category: created.category,
      severity: created.severity,
      title: created.title,
      prompt: created.prompt,
      time_limit_sec: created.timeLimitSec,
      is_archived: created.isArchived,
      archived_at: created.archivedAt,
      updated_at: created.updatedAt,
    });
  });

  return created;
}

export async function updateAdminScenario(
  scenarioId: string,
  patch: Partial<AdminScenarioInput>
): Promise<Scenario> {
  const state = ensureState();
  const scenario = state.scenarios.find((item) => item.id === scenarioId);
  if (!scenario) {
    throw new Error("Сценарият не е намерен");
  }
  if (patch.moduleId) scenario.moduleId = patch.moduleId;
  if (patch.category) scenario.category = patch.category;
  if (patch.severity) scenario.severity = patch.severity;
  if (patch.title !== undefined) scenario.title = patch.title.trim();
  if (patch.prompt !== undefined) scenario.prompt = patch.prompt.trim();
  if (patch.timeLimitSec !== undefined) scenario.timeLimitSec = patch.timeLimitSec;
  scenario.updatedAt = nowIso();

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("scenarios").update({
      module_id: scenario.moduleId,
      category: scenario.category,
      severity: scenario.severity,
      title: scenario.title,
      prompt: scenario.prompt,
      time_limit_sec: scenario.timeLimitSec,
      updated_at: scenario.updatedAt,
    }).eq("id", scenario.id);
  });

  return scenario;
}

export async function setAdminScenarioArchived(scenarioId: string, isArchived: boolean): Promise<Scenario> {
  const state = ensureState();
  const scenario = state.scenarios.find((item) => item.id === scenarioId);
  if (!scenario) {
    throw new Error("Сценарият не е намерен");
  }
  Object.assign(scenario, archiveState(isArchived));

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("scenarios").update({
      is_archived: scenario.isArchived,
      archived_at: scenario.archivedAt,
      updated_at: scenario.updatedAt,
    }).eq("id", scenario.id);
  });

  return scenario;
}

export function listAdminScenarioOptions(): ScenarioOption[] {
  const state = ensureState();
  return state.scenarioOptions;
}

export async function createAdminScenarioOption(
  input: AdminScenarioOptionInput
): Promise<ScenarioOption> {
  const state = ensureState();
  if (!state.scenarios.some((scenario) => scenario.id === input.scenarioId)) {
    throw new Error("Сценарият не е намерен");
  }
  const created: ScenarioOption = {
    id: nextId("sopt_admin"),
    scenarioId: input.scenarioId,
    label: input.label.trim().toUpperCase(),
    text: input.text.trim(),
    isCorrect: input.isCorrect,
    weight: input.weight,
    actionType: input.actionType,
    explanation: input.explanation.trim(),
    isArchived: false,
    archivedAt: null,
    updatedAt: nowIso(),
  };
  state.scenarioOptions.push(created);

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("scenario_options").upsert({
      id: created.id,
      scenario_id: created.scenarioId,
      label: created.label,
      text: created.text,
      is_correct: created.isCorrect,
      weight: created.weight,
      action_type: created.actionType,
      explanation: created.explanation,
      is_archived: created.isArchived,
      archived_at: created.archivedAt,
      updated_at: created.updatedAt,
    });
  });

  return created;
}

export async function updateAdminScenarioOption(
  optionId: string,
  patch: Partial<AdminScenarioOptionInput>
): Promise<ScenarioOption> {
  const state = ensureState();
  const option = state.scenarioOptions.find((item) => item.id === optionId);
  if (!option) {
    throw new Error("Сценарийната опция не е намерена");
  }
  if (patch.scenarioId) option.scenarioId = patch.scenarioId;
  if (patch.label !== undefined) option.label = patch.label.trim().toUpperCase();
  if (patch.text !== undefined) option.text = patch.text.trim();
  if (patch.isCorrect !== undefined) option.isCorrect = patch.isCorrect;
  if (patch.weight !== undefined) option.weight = patch.weight;
  if (patch.actionType) option.actionType = patch.actionType;
  if (patch.explanation !== undefined) option.explanation = patch.explanation.trim();
  option.updatedAt = nowIso();

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("scenario_options").update({
      scenario_id: option.scenarioId,
      label: option.label,
      text: option.text,
      is_correct: option.isCorrect,
      weight: option.weight,
      action_type: option.actionType,
      explanation: option.explanation,
      updated_at: option.updatedAt,
    }).eq("id", option.id);
  });

  return option;
}

export async function setAdminScenarioOptionArchived(
  optionId: string,
  isArchived: boolean
): Promise<ScenarioOption> {
  const state = ensureState();
  const option = state.scenarioOptions.find((item) => item.id === optionId);
  if (!option) {
    throw new Error("Сценарийната опция не е намерена");
  }
  Object.assign(option, archiveState(isArchived));

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("scenario_options").update({
      is_archived: option.isArchived,
      archived_at: option.archivedAt,
      updated_at: option.updatedAt,
    }).eq("id", option.id);
  });

  return option;
}

export function listAdminRules(): AssignmentRule[] {
  const state = ensureState();
  return state.assignmentRules;
}

export async function createAdminRule(input: AdminRuleInput): Promise<AssignmentRule> {
  const state = ensureState();
  const created: AssignmentRule = {
    id: nextId("rule_admin"),
    category: input.category,
    trigger: input.trigger,
    moduleId: input.moduleId,
    dueInDays: input.dueInDays,
    retestInDays: input.retestInDays,
    isArchived: false,
    archivedAt: null,
    updatedAt: nowIso(),
  };
  state.assignmentRules.push(created);

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("assignment_rules").upsert({
      id: created.id,
      category: created.category,
      trigger: created.trigger,
      module_id: created.moduleId,
      due_in_days: created.dueInDays,
      retest_in_days: created.retestInDays,
      is_archived: created.isArchived,
      archived_at: created.archivedAt,
      updated_at: created.updatedAt,
    });
  });

  return created;
}

export async function updateAdminRule(
  ruleId: string,
  patch: Partial<AdminRuleInput>
): Promise<AssignmentRule> {
  const state = ensureState();
  const rule = state.assignmentRules.find((item) => item.id === ruleId);
  if (!rule) {
    throw new Error("Правилото не е намерено");
  }
  if (patch.category) rule.category = patch.category;
  if (patch.trigger) rule.trigger = patch.trigger;
  if (patch.moduleId) rule.moduleId = patch.moduleId;
  if (patch.dueInDays !== undefined) rule.dueInDays = patch.dueInDays;
  if (patch.retestInDays !== undefined) rule.retestInDays = patch.retestInDays;
  rule.updatedAt = nowIso();

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("assignment_rules").update({
      category: rule.category,
      trigger: rule.trigger,
      module_id: rule.moduleId,
      due_in_days: rule.dueInDays,
      retest_in_days: rule.retestInDays,
      updated_at: rule.updatedAt,
    }).eq("id", rule.id);
  });

  return rule;
}

export async function setAdminRuleArchived(ruleId: string, isArchived: boolean): Promise<AssignmentRule> {
  const state = ensureState();
  const rule = state.assignmentRules.find((item) => item.id === ruleId);
  if (!rule) {
    throw new Error("Правилото не е намерено");
  }
  Object.assign(rule, archiveState(isArchived));

  await withSupabaseWrite(async (supabase) => {
    await supabase.from("assignment_rules").update({
      is_archived: rule.isArchived,
      archived_at: rule.archivedAt,
      updated_at: rule.updatedAt,
    }).eq("id", rule.id);
  });

  return rule;
}

export function listAdminHistory(): HistoryEntry[] {
  const state = ensureState();
  const attempts = state.attempts.map((item) => ({
    id: item.id,
    type: "ATTEMPT" as const,
    title: `Опит в сценарий ${item.scenarioId}`,
    subtitle: `Потребител: ${item.userId} · Знание ${item.knowledgeScore}% · Риск ${item.reactionRiskScore}%`,
    createdAt: item.createdAt,
    isArchived: item.isArchived,
  }));
  const riskEvents = state.riskEvents.map((item) => ({
    id: item.id,
    type: "RISK_EVENT" as const,
    title: `Рисково събитие ${item.type}`,
    subtitle: `Потребител: ${item.userId} · Сценарий: ${item.scenarioId}`,
    createdAt: item.createdAt,
    isArchived: item.isArchived,
  }));
  const completions = state.moduleCompletions.map((item) => ({
    id: `${item.userId}_${item.moduleId}`,
    type: "MODULE_COMPLETION" as const,
    title: `Завършен модул ${item.moduleId}`,
    subtitle: `Потребител: ${item.userId} · Резултат: ${item.scorePercent}%`,
    createdAt: item.completedAt,
    isArchived: item.isArchived,
  }));
  return [...attempts, ...riskEvents, ...completions].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

export function setAdminHistoryArchived(params: {
  type: HistoryEntry["type"];
  id: string;
  isArchived: boolean;
}): boolean {
  const state = ensureState();
  if (params.type === "ATTEMPT") {
    const target = state.attempts.find((item) => item.id === params.id);
    if (!target) return false;
    Object.assign(target, archiveState(params.isArchived));
    return true;
  }
  if (params.type === "RISK_EVENT") {
    const target = state.riskEvents.find((item) => item.id === params.id);
    if (!target) return false;
    Object.assign(target, archiveState(params.isArchived));
    return true;
  }
  const completion = state.moduleCompletions.find(
    (item) => `${item.userId}_${item.moduleId}` === params.id
  );
  if (!completion) return false;
  Object.assign(completion, archiveState(params.isArchived));
  return true;
}


