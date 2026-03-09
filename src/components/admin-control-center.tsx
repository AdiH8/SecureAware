"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";

import {
  AssignmentRule,
  Department,
  HistoryEntry,
  LearningAuditRow,
  PhishingCampaign,
  PhishingTemplate,
  Profile,
  Scenario,
  ScenarioOption,
  TestOption,
  TestQuestionWithOptions,
  TrainingModule,
} from "@/lib/types";
import {
  MODULE_TEXT_SECTION_MIN_LENGTH,
  MODULE_TEXT_SECTIONS_MIN_COUNT,
} from "@/lib/module-schemas";

type AdminTab =
  | "users"
  | "modules"
  | "tests"
  | "campaigns"
  | "scenarios"
  | "rules"
  | "learning"
  | "history";

interface AdminState {
  users: Profile[];
  departments: Department[];
  modules: TrainingModule[];
  questions: TestQuestionWithOptions[];
  options: TestOption[];
  scenarios: Scenario[];
  scenarioOptions: ScenarioOption[];
  campaigns: PhishingCampaign[];
  phishingTemplates: PhishingTemplate[];
  rules: AssignmentRule[];
  learningRows: LearningAuditRow[];
  history: HistoryEntry[];
}

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "users", label: "Потребители" },
  { id: "modules", label: "Курсове" },
  { id: "tests", label: "Тестове" },
  { id: "campaigns", label: "Фишинг кампании" },
  { id: "rules", label: "Правила" },
  { id: "learning", label: "Обучителен прогрес" },
  { id: "history", label: "История" },
];

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error ?? "Грешка при заявката.");
  }
  return payload;
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSizeMb(sizeMb: number | null | undefined): string {
  if (typeof sizeMb !== "number") return "0.00";
  return sizeMb.toFixed(2);
}

function learningStatusLabel(status: LearningAuditRow["status"]): string {
  if (status === "COMPLETED") return "Завършен";
  if (status === "READY_FOR_TEST") return "Готов за тест";
  if (status === "IN_PROGRESS") return "В процес";
  return "Не е започнат";
}

export function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [state, setState] = useState<AdminState>({
    users: [],
    departments: [],
    modules: [],
    questions: [],
    options: [],
    scenarios: [],
    scenarioOptions: [],
    campaigns: [],
    phishingTemplates: [],
    rules: [],
    learningRows: [],
    history: [],
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({
    id: "",
    name: "",
    email: "",
    departmentId: "",
    role: "EMPLOYEE" as "EMPLOYEE" | "MANAGER",
  });

  const [moduleForm, setModuleForm] = useState({
    id: "",
    title: "",
    category: "PHISHING" as TrainingModule["category"],
    isMini: false,
    order: 1,
    durationMinutes: 6,
    videoDurationSec: 360,
    questionCount: 10,
    passThresholdPercent: 80,
    videoMockFileName: null as string | null,
    videoMockFileSizeMb: null as number | null,
    description: "",
    bulletPoints: "",
    textSections: "",
  });

  const [questionForm, setQuestionForm] = useState({
    id: "",
    moduleId: "",
    kind: "TEXT" as "TEXT" | "IMAGE",
    order: 1,
    prompt: "",
    imageUrl: "",
    explanation: "",
  });

  const [optionForm, setOptionForm] = useState({
    id: "",
    questionId: "",
    label: "A",
    text: "",
    isCorrect: false,
  });

  const [scenarioForm, setScenarioForm] = useState({
    id: "",
    moduleId: "",
    category: "PHISHING" as Scenario["category"],
    severity: "MEDIUM" as Scenario["severity"],
    title: "",
    prompt: "",
    timeLimitSec: 20,
  });

  const [scenarioOptionForm, setScenarioOptionForm] = useState({
    id: "",
    scenarioId: "",
    label: "A",
    text: "",
    isCorrect: false,
    weight: 3,
    actionType: "REPORT_TO_IT" as ScenarioOption["actionType"],
    explanation: "",
  });

  const [ruleForm, setRuleForm] = useState({
    id: "",
    category: "PHISHING" as AssignmentRule["category"],
    trigger: "WRONG_ANSWER" as AssignmentRule["trigger"],
    moduleId: "",
    dueInDays: 7,
    retestInDays: 14,
  });

  const [campaignForm, setCampaignForm] = useState({
    id: "",
    name: "",
    templateId: "",
    subject: "",
    senderName: "",
    content: "",
    departmentId: "",
    startNow: false,
  });

  const modulesById = useMemo(
    () => Object.fromEntries(state.modules.map((module) => [module.id, module.title])),
    [state.modules]
  );
  const departmentsById = useMemo(
    () => Object.fromEntries(state.departments.map((department) => [department.id, department.name])),
    [state.departments]
  );
  const campaignTotals = useMemo(() => {
    return state.campaigns.reduce(
      (acc, campaign) => {
        if (campaign.isArchived) return acc;
        acc.sent += campaign.metrics.sentCount;
        acc.opened += campaign.metrics.openedCount;
        acc.clicked += campaign.metrics.clickedCount;
        acc.reported += campaign.metrics.reportedCount;
        return acc;
      },
      { sent: 0, opened: 0, clicked: 0, reported: 0 }
    );
  }, [state.campaigns]);

  const loadData = async () => {
    setPending(true);
    setError(null);
    try {
      const [usersRes, modulesRes, questionsRes, optionsRes, scenariosRes, scenarioOptionsRes, rulesRes, historyRes, campaignsRes, learningRes] =
        await Promise.all([
          apiRequest<{ users: Profile[]; departments: Department[] }>("/api/admin/users"),
          apiRequest<{ modules: TrainingModule[] }>("/api/admin/modules"),
          apiRequest<{ questions: TestQuestionWithOptions[] }>("/api/admin/tests/questions"),
          apiRequest<{ options: TestOption[] }>("/api/admin/tests/options"),
          apiRequest<{ scenarios: Scenario[] }>("/api/admin/scenarios"),
          apiRequest<{ options: ScenarioOption[] }>("/api/admin/scenario-options"),
          apiRequest<{ rules: AssignmentRule[] }>("/api/admin/rules"),
          apiRequest<{ history: HistoryEntry[] }>("/api/admin/history"),
          apiRequest<{ campaigns: PhishingCampaign[]; templates: PhishingTemplate[] }>(
            "/api/admin/phishing-campaigns"
          ),
          apiRequest<{ rows: LearningAuditRow[] }>("/api/admin/learning-progress"),
        ]);

      setState({
        users: usersRes.users,
        departments: usersRes.departments,
        modules: modulesRes.modules,
        questions: questionsRes.questions,
        options: optionsRes.options,
        scenarios: scenariosRes.scenarios,
        scenarioOptions: scenarioOptionsRes.options,
        campaigns: campaignsRes.campaigns,
        phishingTemplates: campaignsRes.templates,
        rules: rulesRes.rules,
        learningRows: learningRes.rows,
        history: historyRes.history,
      });

      setUserForm((prev) => ({ ...prev, departmentId: prev.departmentId || usersRes.departments[0]?.id || "" }));
      setQuestionForm((prev) => ({ ...prev, moduleId: prev.moduleId || modulesRes.modules[0]?.id || "" }));
      setOptionForm((prev) => ({ ...prev, questionId: prev.questionId || questionsRes.questions[0]?.id || "" }));
      setScenarioForm((prev) => ({ ...prev, moduleId: prev.moduleId || modulesRes.modules[0]?.id || "" }));
      setScenarioOptionForm((prev) => ({
        ...prev,
        scenarioId: prev.scenarioId || scenariosRes.scenarios[0]?.id || "",
      }));
      setRuleForm((prev) => ({ ...prev, moduleId: prev.moduleId || modulesRes.modules[0]?.id || "" }));
      setCampaignForm((prev) => ({
        ...prev,
        departmentId: prev.departmentId || usersRes.departments[0]?.id || "",
        templateId: prev.templateId || campaignsRes.templates[0]?.id || "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при зареждане.");
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveAction = async (action: () => Promise<void>, successMessage: string) => {
    setError(null);
    setMessage(null);
    try {
      await action();
      await loadData();
      setMessage(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при запис.");
    }
  };

  const toggleArchive = async (url: string, isArchived: boolean) => {
    await saveAction(async () => {
      await apiRequest(url, {
        method: "PATCH",
        body: JSON.stringify({ isArchived: !isArchived }),
      });
    }, !isArchived ? "Записът е архивиран." : "Записът е възстановен.");
  };

  const submitUser = async () => {
    const payload = {
      name: userForm.name,
      email: userForm.email,
      departmentId: userForm.departmentId,
      role: userForm.role,
    };

    await saveAction(async () => {
      if (userForm.id) {
        await apiRequest(`/api/admin/users/${userForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setUserForm({ id: "", name: "", email: "", departmentId: state.departments[0]?.id ?? "", role: "EMPLOYEE" });
    }, userForm.id ? "Потребителят е обновен." : "Потребителят е добавен.");
  };

  const submitModule = async () => {
    const textSections = splitLines(moduleForm.textSections);
    if (textSections.length < MODULE_TEXT_SECTIONS_MIN_COUNT) {
      setError(`Материалът трябва да има поне ${MODULE_TEXT_SECTIONS_MIN_COUNT} текстови секции.`);
      setMessage(null);
      return;
    }
    const shortIndex = textSections.findIndex(
      (section) => section.length < MODULE_TEXT_SECTION_MIN_LENGTH
    );
    if (shortIndex >= 0) {
      setError(
        `Секция ${shortIndex + 1} е твърде кратка. Минималната дължина е ${MODULE_TEXT_SECTION_MIN_LENGTH} символа.`
      );
      setMessage(null);
      return;
    }

    const payload = {
      title: moduleForm.title,
      category: moduleForm.category,
      isMini: moduleForm.isMini,
      order: moduleForm.order,
      durationMinutes: moduleForm.durationMinutes,
      videoDurationSec: moduleForm.videoDurationSec,
      questionCount: moduleForm.questionCount,
      passThresholdPercent: moduleForm.passThresholdPercent,
      videoMockFileName: moduleForm.videoMockFileName,
      videoMockFileSizeMb: moduleForm.videoMockFileSizeMb,
      description: moduleForm.description,
      bulletPoints: splitLines(moduleForm.bulletPoints),
      textSections,
    };

    await saveAction(async () => {
      if (moduleForm.id) {
        await apiRequest(`/api/admin/modules/${moduleForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/admin/modules", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setModuleForm({
        id: "",
        title: "",
        category: "PHISHING",
        isMini: false,
        order: 1,
        durationMinutes: 6,
        videoDurationSec: 360,
        questionCount: 10,
        passThresholdPercent: 80,
        videoMockFileName: null,
        videoMockFileSizeMb: null,
        description: "",
        bulletPoints: "",
        textSections: "",
      });
    }, moduleForm.id ? "Курсът е обновен." : "Курсът е добавен.");
  };

  const onModuleVideoMockSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setModuleForm((prev) => ({
      ...prev,
      videoMockFileName: file.name,
      videoMockFileSizeMb: Math.round((file.size / (1024 * 1024)) * 100) / 100,
    }));
  };

  const clearModuleVideoMock = () => {
    setModuleForm((prev) => ({
      ...prev,
      videoMockFileName: null,
      videoMockFileSizeMb: null,
    }));
  };

  const submitQuestion = async () => {
    const payload = {
      moduleId: questionForm.moduleId,
      kind: questionForm.kind,
      order: questionForm.order,
      prompt: questionForm.prompt,
      imageUrl: questionForm.kind === "IMAGE" ? questionForm.imageUrl : undefined,
      explanation: questionForm.explanation,
    };

    await saveAction(async () => {
      if (questionForm.id) {
        await apiRequest(`/api/admin/tests/questions/${questionForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/admin/tests/questions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setQuestionForm({ id: "", moduleId: state.modules[0]?.id ?? "", kind: "TEXT", order: 1, prompt: "", imageUrl: "", explanation: "" });
    }, questionForm.id ? "Въпросът е обновен." : "Въпросът е добавен.");
  };

  const submitOption = async () => {
    const payload = {
      questionId: optionForm.questionId,
      label: optionForm.label,
      text: optionForm.text,
      isCorrect: optionForm.isCorrect,
    };

    await saveAction(async () => {
      if (optionForm.id) {
        await apiRequest(`/api/admin/tests/options/${optionForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/admin/tests/options", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setOptionForm({ id: "", questionId: state.questions[0]?.id ?? "", label: "A", text: "", isCorrect: false });
    }, optionForm.id ? "Опцията е обновена." : "Опцията е добавена.");
  };

  const submitScenario = async () => {
    const payload = {
      moduleId: scenarioForm.moduleId,
      category: scenarioForm.category,
      severity: scenarioForm.severity,
      title: scenarioForm.title,
      prompt: scenarioForm.prompt,
      timeLimitSec: scenarioForm.timeLimitSec,
    };

    await saveAction(async () => {
      if (scenarioForm.id) {
        await apiRequest(`/api/admin/scenarios/${scenarioForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/admin/scenarios", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setScenarioForm({ id: "", moduleId: state.modules[0]?.id ?? "", category: "PHISHING", severity: "MEDIUM", title: "", prompt: "", timeLimitSec: 20 });
    }, scenarioForm.id ? "Сценарият е обновен." : "Сценарият е добавен.");
  };

  const submitScenarioOption = async () => {
    const payload = {
      scenarioId: scenarioOptionForm.scenarioId,
      label: scenarioOptionForm.label,
      text: scenarioOptionForm.text,
      isCorrect: scenarioOptionForm.isCorrect,
      weight: scenarioOptionForm.weight,
      actionType: scenarioOptionForm.actionType,
      explanation: scenarioOptionForm.explanation,
    };

    await saveAction(async () => {
      if (scenarioOptionForm.id) {
        await apiRequest(`/api/admin/scenario-options/${scenarioOptionForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/admin/scenario-options", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setScenarioOptionForm({
        id: "",
        scenarioId: state.scenarios[0]?.id ?? "",
        label: "A",
        text: "",
        isCorrect: false,
        weight: 3,
        actionType: "REPORT_TO_IT",
        explanation: "",
      });
    }, scenarioOptionForm.id ? "Опцията е обновена." : "Опцията е добавена.");
  };

  const applyTemplateToCampaignForm = (templateId: string) => {
    const template = state.phishingTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setCampaignForm((prev) => ({
      ...prev,
      templateId: template.id,
      subject: template.subject,
      senderName: template.senderName,
      content: template.content,
    }));
  };

  const submitCampaign = async () => {
    const payload = {
      name: campaignForm.name,
      templateId: campaignForm.templateId,
      subject: campaignForm.subject,
      senderName: campaignForm.senderName,
      content: campaignForm.content,
      departmentId: campaignForm.departmentId,
      startNow: campaignForm.startNow,
    };

    await saveAction(async () => {
      if (campaignForm.id) {
        await apiRequest(`/api/admin/phishing-campaigns/${campaignForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        if (campaignForm.startNow) {
          await apiRequest(`/api/admin/phishing-campaigns/${campaignForm.id}/start`, {
            method: "POST",
          });
        }
      } else {
        await apiRequest("/api/admin/phishing-campaigns", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setCampaignForm({
        id: "",
        name: "",
        templateId: state.phishingTemplates[0]?.id ?? "",
        subject: "",
        senderName: "",
        content: "",
        departmentId: state.departments[0]?.id ?? "",
        startNow: false,
      });
    }, campaignForm.id ? "Кампанията е обновена." : "Кампанията е създадена.");
  };

  const startCampaign = async (campaignId: string) => {
    await saveAction(async () => {
      await apiRequest(`/api/admin/phishing-campaigns/${campaignId}/start`, {
        method: "POST",
      });
    }, "Кампанията е стартирана.");
  };

  const submitRule = async () => {
    const payload = {
      category: ruleForm.category,
      trigger: ruleForm.trigger,
      moduleId: ruleForm.moduleId,
      dueInDays: ruleForm.dueInDays,
      retestInDays: ruleForm.retestInDays,
    };

    await saveAction(async () => {
      if (ruleForm.id) {
        await apiRequest(`/api/admin/rules/${ruleForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/admin/rules", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setRuleForm({ id: "", category: "PHISHING", trigger: "WRONG_ANSWER", moduleId: state.modules[0]?.id ?? "", dueInDays: 7, retestInDays: 14 });
    }, ruleForm.id ? "Правилото е обновено." : "Правилото е добавено.");
  };

  const toggleHistory = async (entry: HistoryEntry) => {
    await saveAction(async () => {
      await apiRequest("/api/admin/history/archive", {
        method: "PATCH",
        body: JSON.stringify({
          type: entry.type,
          id: entry.id,
          isArchived: !entry.isArchived,
        }),
      });
    }, !entry.isArchived ? "Записът е архивиран." : "Записът е възстановен.");
  };

  return (
    <section className="space-y-4">
      <article className="sa-card p-6">
        <h1 className="text-3xl font-bold">Админ Control Center</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Централизирано управление на служители, обучения, тестове, фишинг кампании, правила и история.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab.id ? "bg-[var(--brand)] text-white" : "border border-[var(--line)]"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={loadData}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
          >
            Обнови
          </button>
        </div>
      </article>

      {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}
      {pending ? <p className="text-sm text-zinc-500">Зареждане...</p> : null}

      {activeTab === "users" ? (
        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <article className="sa-card p-4">
            <h2 className="text-xl font-bold">{userForm.id ? "Редакция потребител" : "Нов потребител"}</h2>
            <div className="mt-3 space-y-3">
              <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Име" value={userForm.name} onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))} />
              <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Имейл" value={userForm.email} onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))} />
              <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={userForm.departmentId} onChange={(e) => setUserForm((prev) => ({ ...prev, departmentId: e.target.value }))}>
                {state.departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
              <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={userForm.role} onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value as "EMPLOYEE" | "MANAGER" }))}>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
              </select>
              <button type="button" onClick={submitUser} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">{userForm.id ? "Запази" : "Добави"}</button>
            </div>
          </article>

          <article className="sa-card overflow-x-auto p-4">
            <h2 className="text-xl font-bold">Служители</h2>
            <table className="mt-3 w-full min-w-[720px] text-sm">
              <thead><tr className="text-left text-zinc-500"><th>Име</th><th>Имейл</th><th>Отдел</th><th>Роля</th><th>Статус</th><th className="text-right">Действия</th></tr></thead>
              <tbody>
                {state.users.map((user) => (
                  <tr key={user.id} className="border-t border-[var(--line)]">
                    <td className="py-2">{user.name}</td>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2">{departmentsById[user.departmentId] ?? user.departmentId}</td>
                    <td className="py-2">{user.role}</td>
                    <td className="py-2">{user.isArchived ? "Архивиран" : "Активен"}</td>
                    <td className="py-2">
                      <div className="flex justify-end gap-2">
                        <button type="button" className="rounded-full border border-[var(--line)] px-3 py-1" onClick={() => setUserForm({ id: user.id, name: user.name, email: user.email, departmentId: user.departmentId, role: user.role === "MANAGER" ? "MANAGER" : "EMPLOYEE" })}>Редакция</button>
                        <button type="button" className="rounded-full border border-[var(--line)] px-3 py-1" onClick={() => toggleArchive(`/api/admin/users/${user.id}`, user.isArchived)}>{user.isArchived ? "Възстанови" : "Архивирай"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>
      ) : null}

      {activeTab === "modules" ? (
        <section className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <article className="sa-card p-4">
            <h2 className="text-xl font-bold">{moduleForm.id ? "Редакция курс" : "Нов курс"}</h2>
            <div className="mt-3 space-y-3">
              <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Заглавие" value={moduleForm.title} onChange={(e) => setModuleForm((prev) => ({ ...prev, title: e.target.value }))} />
              <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={moduleForm.category} onChange={(e) => setModuleForm((prev) => ({ ...prev, category: e.target.value as TrainingModule["category"] }))}>
                <option value="PHISHING">PHISHING</option>
                <option value="URL">URL</option>
                <option value="SOCIAL_ENGINEERING">SOCIAL_ENGINEERING</option>
                <option value="MALWARE">MALWARE</option>
              </select>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={moduleForm.isMini} onChange={(e) => setModuleForm((prev) => ({ ...prev, isMini: e.target.checked }))} /> Мини модул</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" className="rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Ред" value={moduleForm.order} onChange={(e) => setModuleForm((prev) => ({ ...prev, order: Number(e.target.value) }))} />
                <input type="number" className="rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Минути" value={moduleForm.durationMinutes} onChange={(e) => setModuleForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" className="rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Видео сек" value={moduleForm.videoDurationSec} onChange={(e) => setModuleForm((prev) => ({ ...prev, videoDurationSec: Number(e.target.value) }))} />
                <input type="number" className="rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Въпроси" value={moduleForm.questionCount} onChange={(e) => setModuleForm((prev) => ({ ...prev, questionCount: Number(e.target.value) }))} />
              </div>
              <div className="rounded-xl border border-dashed border-[var(--line)] p-3">
                <p className="text-xs font-semibold uppercase text-zinc-500">Mock видео файл</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-semibold">
                    Избери видео (mock)
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={onModuleVideoMockSelected}
                    />
                  </label>
                  <button
                    type="button"
                    className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
                    onClick={clearModuleVideoMock}
                  >
                    Изчисти mock видео
                  </button>
                </div>
                {moduleForm.videoMockFileName ? (
                  <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                    Видео: {moduleForm.videoMockFileName} · {formatSizeMb(moduleForm.videoMockFileSizeMb)} MB ·{" "}
                    {Math.ceil(moduleForm.videoDurationSec / 60)} мин
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-zinc-500">
                    Няма избран mock файл. Курсът ще ползва стандартен видео placeholder.
                  </p>
                )}
              </div>
              <input type="number" className="w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Праг %" value={moduleForm.passThresholdPercent} onChange={(e) => setModuleForm((prev) => ({ ...prev, passThresholdPercent: Number(e.target.value) }))} />
              <textarea className="min-h-16 w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Описание" value={moduleForm.description} onChange={(e) => setModuleForm((prev) => ({ ...prev, description: e.target.value }))} />
              <textarea className="min-h-16 w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Bullet точки (по ред)" value={moduleForm.bulletPoints} onChange={(e) => setModuleForm((prev) => ({ ...prev, bulletPoints: e.target.value }))} />
              <textarea className="min-h-16 w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Текстови секции (по ред)" value={moduleForm.textSections} onChange={(e) => setModuleForm((prev) => ({ ...prev, textSections: e.target.value }))} />
              <p className="text-xs text-zinc-500">
                Изискване: минимум {MODULE_TEXT_SECTIONS_MIN_COUNT} секции, всяка поне{" "}
                {MODULE_TEXT_SECTION_MIN_LENGTH} символа. Секциите са разделени по редове.
              </p>
              <p className="text-xs text-zinc-500">
                Текущо въведени секции: {splitLines(moduleForm.textSections).length}
              </p>
              <button type="button" onClick={submitModule} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">{moduleForm.id ? "Запази" : "Добави"}</button>
            </div>
          </article>

          <article className="sa-card p-4">
            <h2 className="text-xl font-bold">Курсове</h2>
            <div className="mt-3 space-y-2">
              {state.modules.map((module) => (
                <div key={module.id} className="rounded-xl border border-[var(--line)] p-3">
                  <p className="font-semibold">{module.title}</p>
                  <p className="text-xs text-zinc-600">{module.category} · {module.durationMinutes} мин · {module.questionCount} въпроса · праг {module.passThresholdPercent}%</p>
                  {module.videoMockFileName ? (
                    <p className="text-xs text-zinc-500">
                      Mock видео: {module.videoMockFileName} · {formatSizeMb(module.videoMockFileSizeMb)} MB
                    </p>
                  ) : null}
                  <p className="text-xs text-zinc-500">{module.isArchived ? "Архивиран" : "Активен"}</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="rounded-full border border-[var(--line)] px-3 py-1 text-sm" onClick={() => setModuleForm({ id: module.id, title: module.title, category: module.category, isMini: module.isMini, order: module.order, durationMinutes: module.durationMinutes, videoDurationSec: module.videoDurationSec, questionCount: module.questionCount, passThresholdPercent: module.passThresholdPercent, videoMockFileName: module.videoMockFileName, videoMockFileSizeMb: module.videoMockFileSizeMb, description: module.description, bulletPoints: module.bulletPoints.join("\n"), textSections: module.textSections.join("\n") })}>Редакция</button>
                    <button type="button" className="rounded-full border border-[var(--line)] px-3 py-1 text-sm" onClick={() => toggleArchive(`/api/admin/modules/${module.id}`, module.isArchived)}>{module.isArchived ? "Възстанови" : "Архивирай"}</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "tests" ? (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="sa-card p-4">
              <h2 className="text-xl font-bold">{questionForm.id ? "Редакция въпрос" : "Нов въпрос"}</h2>
              <div className="mt-3 space-y-3">
                <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={questionForm.moduleId} onChange={(e) => setQuestionForm((prev) => ({ ...prev, moduleId: e.target.value }))}>{state.modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select>
                <div className="grid grid-cols-2 gap-2">
                  <select className="rounded-xl border border-[var(--line)] px-3 py-2" value={questionForm.kind} onChange={(e) => setQuestionForm((prev) => ({ ...prev, kind: e.target.value as "TEXT" | "IMAGE" }))}><option value="TEXT">TEXT</option><option value="IMAGE">IMAGE</option></select>
                  <input type="number" className="rounded-xl border border-[var(--line)] px-3 py-2" value={questionForm.order} onChange={(e) => setQuestionForm((prev) => ({ ...prev, order: Number(e.target.value) }))} />
                </div>
                <textarea className="min-h-16 w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Въпрос" value={questionForm.prompt} onChange={(e) => setQuestionForm((prev) => ({ ...prev, prompt: e.target.value }))} />
                {questionForm.kind === "IMAGE" ? <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="/images/..." value={questionForm.imageUrl} onChange={(e) => setQuestionForm((prev) => ({ ...prev, imageUrl: e.target.value }))} /> : null}
                <textarea className="min-h-16 w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Обяснение" value={questionForm.explanation} onChange={(e) => setQuestionForm((prev) => ({ ...prev, explanation: e.target.value }))} />
                <button type="button" onClick={submitQuestion} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">{questionForm.id ? "Запази" : "Добави"}</button>
              </div>
            </article>

            <article className="sa-card p-4">
              <h2 className="text-xl font-bold">{optionForm.id ? "Редакция опция" : "Нова опция"}</h2>
              <div className="mt-3 space-y-3">
                <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={optionForm.questionId} onChange={(e) => setOptionForm((prev) => ({ ...prev, questionId: e.target.value }))}>{state.questions.map((question) => <option key={question.id} value={question.id}>{modulesById[question.moduleId] ?? question.moduleId} · #{question.order}</option>)}</select>
                <div className="grid grid-cols-2 gap-2">
                  <input className="rounded-xl border border-[var(--line)] px-3 py-2" value={optionForm.label} onChange={(e) => setOptionForm((prev) => ({ ...prev, label: e.target.value }))} placeholder="Label" />
                  <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm"><input type="checkbox" checked={optionForm.isCorrect} onChange={(e) => setOptionForm((prev) => ({ ...prev, isCorrect: e.target.checked }))} /> Верен</label>
                </div>
                <textarea className="min-h-16 w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Текст" value={optionForm.text} onChange={(e) => setOptionForm((prev) => ({ ...prev, text: e.target.value }))} />
                <button type="button" onClick={submitOption} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">{optionForm.id ? "Запази" : "Добави"}</button>
              </div>
            </article>
          </div>

          <article className="sa-card p-4">
            <h2 className="text-xl font-bold">Въпроси и опции</h2>
            <div className="mt-3 space-y-2">
              {state.questions.map((question) => (
                <div key={question.id} className="rounded-xl border border-[var(--line)] p-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-semibold">{modulesById[question.moduleId] ?? question.moduleId} · #{question.order} · {question.kind}</p>
                    <div className="flex gap-2">
                      <button type="button" className="rounded-full border border-[var(--line)] px-3 py-1 text-sm" onClick={() => setQuestionForm({ id: question.id, moduleId: question.moduleId, kind: question.kind, order: question.order, prompt: question.prompt, imageUrl: question.imageUrl ?? "", explanation: question.explanation })}>Редакция</button>
                      <button type="button" className="rounded-full border border-[var(--line)] px-3 py-1 text-sm" onClick={() => toggleArchive(`/api/admin/tests/questions/${question.id}`, question.isArchived)}>{question.isArchived ? "Възстанови" : "Архивирай"}</button>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-700">{question.prompt}</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {state.options.filter((option) => option.questionId === question.id).map((option) => (
                      <div key={option.id} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-2"><p><strong>{option.label})</strong> {option.text}</p><div className="flex gap-2"><button type="button" className="rounded-full border border-[var(--line)] px-2 py-0.5 text-xs" onClick={() => setOptionForm({ id: option.id, questionId: option.questionId, label: option.label, text: option.text, isCorrect: option.isCorrect })}>Редакция</button><button type="button" className="rounded-full border border-[var(--line)] px-2 py-0.5 text-xs" onClick={() => toggleArchive(`/api/admin/tests/options/${option.id}`, option.isArchived)}>{option.isArchived ? "Възстанови" : "Архивирай"}</button></div></div>
                        <p className="text-xs text-zinc-500">{option.isCorrect ? "Верен" : "Грешен"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "campaigns" ? (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
            <article className="sa-card p-4">
              <h2 className="text-xl font-bold">
                {campaignForm.id ? "Редакция кампания" : "Стартиране на кампания"}
              </h2>
              <div className="mt-3 space-y-3">
                <input
                  className="w-full rounded-xl border border-[var(--line)] px-3 py-2"
                  placeholder="Име на кампания"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <select
                  className="w-full rounded-xl border border-[var(--line)] px-3 py-2"
                  value={campaignForm.templateId}
                  onChange={(e) => applyTemplateToCampaignForm(e.target.value)}
                >
                  {state.phishingTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-xl border border-[var(--line)] px-3 py-2"
                  placeholder="Тема на имейла"
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, subject: e.target.value }))}
                />
                <input
                  className="w-full rounded-xl border border-[var(--line)] px-3 py-2"
                  placeholder="Подател (mock)"
                  value={campaignForm.senderName}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, senderName: e.target.value }))}
                />
                <textarea
                  className="min-h-28 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                  placeholder="Съдържание на имейла"
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, content: e.target.value }))}
                />
                <select
                  className="w-full rounded-xl border border-[var(--line)] px-3 py-2"
                  value={campaignForm.departmentId}
                  onChange={(e) => setCampaignForm((prev) => ({ ...prev, departmentId: e.target.value }))}
                >
                  {state.departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={campaignForm.startNow}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({ ...prev, startNow: e.target.checked }))
                    }
                  />
                  Пускане сега (mock)
                </label>
                <button
                  type="button"
                  onClick={submitCampaign}
                  className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
                >
                  {campaignForm.id ? "Запази кампания" : "Създай кампания"}
                </button>
              </div>
            </article>

            <article className="sa-card p-4">
              <h2 className="text-xl font-bold">Активни и минали кампании</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-[var(--line)] p-3">
                  <p className="text-xs uppercase text-zinc-500">Изпратени</p>
                  <p className="text-2xl font-bold">{campaignTotals.sent}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] p-3">
                  <p className="text-xs uppercase text-zinc-500">Click rate</p>
                  <p className="text-2xl font-bold">
                    {campaignTotals.sent
                      ? Math.round((campaignTotals.clicked / campaignTotals.sent) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--line)] p-3">
                  <p className="text-xs uppercase text-zinc-500">Report rate</p>
                  <p className="text-2xl font-bold">
                    {campaignTotals.sent
                      ? Math.round((campaignTotals.reported / campaignTotals.sent) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {state.campaigns.map((campaign) => (
                  <div key={campaign.id} className="rounded-xl border border-[var(--line)] p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{campaign.name}</p>
                        <p className="text-xs text-zinc-600">
                          {departmentsById[campaign.departmentId] ?? campaign.departmentId} ·{" "}
                          {campaign.subject}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Статус: {campaign.status} · Изпратени: {campaign.metrics.sentCount} ·
                          Отворени: {campaign.metrics.openedCount} · Кликнали:{" "}
                          {campaign.metrics.clickedCount} · Докладвали:{" "}
                          {campaign.metrics.reportedCount}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-[var(--line)] px-3 py-1 text-sm"
                          onClick={() =>
                            setCampaignForm({
                              id: campaign.id,
                              name: campaign.name,
                              templateId: campaign.templateId,
                              subject: campaign.subject,
                              senderName: campaign.senderName,
                              content: campaign.content,
                              departmentId: campaign.departmentId,
                              startNow: false,
                            })
                          }
                        >
                          Редакция
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-[var(--line)] px-3 py-1 text-sm"
                          onClick={() => startCampaign(campaign.id)}
                          disabled={campaign.isArchived || campaign.status === "COMPLETED"}
                        >
                          Стартирай
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-[var(--line)] px-3 py-1 text-sm"
                          onClick={() =>
                            toggleArchive(
                              `/api/admin/phishing-campaigns/${campaign.id}`,
                              campaign.isArchived
                            )
                          }
                        >
                          {campaign.isArchived ? "Възстанови" : "Архивирай"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {state.campaigns.length === 0 ? (
                  <p className="text-sm text-zinc-600">Все още няма създадени кампании.</p>
                ) : null}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {activeTab === "scenarios" ? (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="sa-card p-4">
              <h2 className="text-xl font-bold">{scenarioForm.id ? "Редакция сценарий" : "Нов сценарий"}</h2>
              <div className="mt-3 space-y-3">
                <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={scenarioForm.moduleId} onChange={(e) => setScenarioForm((prev) => ({ ...prev, moduleId: e.target.value }))}>{state.modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select>
                <div className="grid grid-cols-2 gap-2">
                  <select className="rounded-xl border border-[var(--line)] px-3 py-2" value={scenarioForm.category} onChange={(e) => setScenarioForm((prev) => ({ ...prev, category: e.target.value as Scenario["category"] }))}><option value="PHISHING">PHISHING</option><option value="URL">URL</option><option value="SOCIAL_ENGINEERING">SOCIAL_ENGINEERING</option><option value="MALWARE">MALWARE</option></select>
                  <select className="rounded-xl border border-[var(--line)] px-3 py-2" value={scenarioForm.severity} onChange={(e) => setScenarioForm((prev) => ({ ...prev, severity: e.target.value as Scenario["severity"] }))}><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option></select>
                </div>
                <input className="w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Заглавие" value={scenarioForm.title} onChange={(e) => setScenarioForm((prev) => ({ ...prev, title: e.target.value }))} />
                <textarea className="min-h-16 w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Prompt" value={scenarioForm.prompt} onChange={(e) => setScenarioForm((prev) => ({ ...prev, prompt: e.target.value }))} />
                <input type="number" className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={scenarioForm.timeLimitSec} onChange={(e) => setScenarioForm((prev) => ({ ...prev, timeLimitSec: Number(e.target.value) }))} />
                <button type="button" onClick={submitScenario} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">{scenarioForm.id ? "Запази" : "Добави"}</button>
              </div>
            </article>

            <article className="sa-card p-4">
              <h2 className="text-xl font-bold">{scenarioOptionForm.id ? "Редакция опция" : "Нова опция"}</h2>
              <div className="mt-3 space-y-3">
                <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={scenarioOptionForm.scenarioId} onChange={(e) => setScenarioOptionForm((prev) => ({ ...prev, scenarioId: e.target.value }))}>{state.scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}</select>
                <div className="grid grid-cols-2 gap-2">
                  <input className="rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Label" value={scenarioOptionForm.label} onChange={(e) => setScenarioOptionForm((prev) => ({ ...prev, label: e.target.value }))} />
                  <input type="number" className="rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Тежест" value={scenarioOptionForm.weight} onChange={(e) => setScenarioOptionForm((prev) => ({ ...prev, weight: Number(e.target.value) }))} />
                </div>
                <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={scenarioOptionForm.actionType} onChange={(e) => setScenarioOptionForm((prev) => ({ ...prev, actionType: e.target.value as ScenarioOption["actionType"] }))}><option value="OPEN_ATTACHMENT">OPEN_ATTACHMENT</option><option value="VERIFY_SENDER">VERIFY_SENDER</option><option value="FORWARD_EMAIL">FORWARD_EMAIL</option><option value="REPORT_TO_IT">REPORT_TO_IT</option><option value="SHARE_OTP">SHARE_OTP</option><option value="CALL_OFFICIAL_SUPPORT">CALL_OFFICIAL_SUPPORT</option><option value="CLICK_LINK">CLICK_LINK</option><option value="IGNORE">IGNORE</option></select>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={scenarioOptionForm.isCorrect} onChange={(e) => setScenarioOptionForm((prev) => ({ ...prev, isCorrect: e.target.checked }))} /> Верен</label>
                <textarea className="min-h-16 w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Текст" value={scenarioOptionForm.text} onChange={(e) => setScenarioOptionForm((prev) => ({ ...prev, text: e.target.value }))} />
                <textarea className="min-h-16 w-full rounded-xl border border-[var(--line)] px-3 py-2" placeholder="Обяснение" value={scenarioOptionForm.explanation} onChange={(e) => setScenarioOptionForm((prev) => ({ ...prev, explanation: e.target.value }))} />
                <button type="button" onClick={submitScenarioOption} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">{scenarioOptionForm.id ? "Запази" : "Добави"}</button>
              </div>
            </article>
          </div>

          <article className="sa-card p-4"><h2 className="text-xl font-bold">Сценарии</h2><div className="mt-3 space-y-2">{state.scenarios.map((scenario) => <div key={scenario.id} className="rounded-xl border border-[var(--line)] p-3"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{scenario.title}</p><p className="text-xs text-zinc-600">{scenario.category} · {scenario.severity} · {scenario.timeLimitSec}s</p></div><div className="flex gap-2"><button type="button" className="rounded-full border border-[var(--line)] px-3 py-1 text-sm" onClick={() => setScenarioForm({ id: scenario.id, moduleId: scenario.moduleId, category: scenario.category, severity: scenario.severity, title: scenario.title, prompt: scenario.prompt, timeLimitSec: scenario.timeLimitSec })}>Редакция</button><button type="button" className="rounded-full border border-[var(--line)] px-3 py-1 text-sm" onClick={() => toggleArchive(`/api/admin/scenarios/${scenario.id}`, scenario.isArchived)}>{scenario.isArchived ? "Възстанови" : "Архивирай"}</button></div></div><div className="mt-2 grid gap-2 md:grid-cols-2">{state.scenarioOptions.filter((option) => option.scenarioId === scenario.id).map((option) => <div key={option.id} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"><div className="flex justify-between gap-2"><p><strong>{option.label})</strong> {option.text}</p><div className="flex gap-2"><button type="button" className="rounded-full border border-[var(--line)] px-2 py-0.5 text-xs" onClick={() => setScenarioOptionForm({ id: option.id, scenarioId: option.scenarioId, label: option.label, text: option.text, isCorrect: option.isCorrect, weight: option.weight, actionType: option.actionType, explanation: option.explanation })}>Редакция</button><button type="button" className="rounded-full border border-[var(--line)] px-2 py-0.5 text-xs" onClick={() => toggleArchive(`/api/admin/scenario-options/${option.id}`, option.isArchived)}>{option.isArchived ? "Възстанови" : "Архивирай"}</button></div></div></div>)}</div></div>)}</div></article>
        </section>
      ) : null}

      {activeTab === "rules" ? (
        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <article className="sa-card p-4">
            <h2 className="text-xl font-bold">{ruleForm.id ? "Редакция правило" : "Ново правило"}</h2>
            <div className="mt-3 space-y-3">
              <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={ruleForm.category} onChange={(e) => setRuleForm((prev) => ({ ...prev, category: e.target.value as AssignmentRule["category"] }))}><option value="PHISHING">PHISHING</option><option value="URL">URL</option><option value="SOCIAL_ENGINEERING">SOCIAL_ENGINEERING</option><option value="MALWARE">MALWARE</option></select>
              <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={ruleForm.trigger} onChange={(e) => setRuleForm((prev) => ({ ...prev, trigger: e.target.value as AssignmentRule["trigger"] }))}><option value="WRONG_ANSWER">WRONG_ANSWER</option><option value="HIGH_REACTION_RISK">HIGH_REACTION_RISK</option></select>
              <select className="w-full rounded-xl border border-[var(--line)] px-3 py-2" value={ruleForm.moduleId} onChange={(e) => setRuleForm((prev) => ({ ...prev, moduleId: e.target.value }))}>{state.modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select>
              <div className="grid grid-cols-2 gap-2"><input type="number" className="rounded-xl border border-[var(--line)] px-3 py-2" value={ruleForm.dueInDays} onChange={(e) => setRuleForm((prev) => ({ ...prev, dueInDays: Number(e.target.value) }))} /><input type="number" className="rounded-xl border border-[var(--line)] px-3 py-2" value={ruleForm.retestInDays} onChange={(e) => setRuleForm((prev) => ({ ...prev, retestInDays: Number(e.target.value) }))} /></div>
              <button type="button" onClick={submitRule} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">{ruleForm.id ? "Запази" : "Добави"}</button>
            </div>
          </article>

          <article className="sa-card overflow-x-auto p-4">
            <h2 className="text-xl font-bold">Правила</h2>
            <table className="mt-3 w-full min-w-[700px] text-sm"><thead><tr className="text-left text-zinc-500"><th>Категория</th><th>Trigger</th><th>Модул</th><th>Due</th><th>Retest</th><th>Статус</th><th className="text-right">Действия</th></tr></thead><tbody>{state.rules.map((rule) => <tr key={rule.id} className="border-t border-[var(--line)]"><td className="py-2">{rule.category}</td><td className="py-2">{rule.trigger}</td><td className="py-2">{modulesById[rule.moduleId] ?? rule.moduleId}</td><td className="py-2">{rule.dueInDays}</td><td className="py-2">{rule.retestInDays}</td><td className="py-2">{rule.isArchived ? "Архивирано" : "Активно"}</td><td className="py-2"><div className="flex justify-end gap-2"><button type="button" className="rounded-full border border-[var(--line)] px-3 py-1" onClick={() => setRuleForm({ id: rule.id, category: rule.category, trigger: rule.trigger, moduleId: rule.moduleId, dueInDays: rule.dueInDays, retestInDays: rule.retestInDays })}>Редакция</button><button type="button" className="rounded-full border border-[var(--line)] px-3 py-1" onClick={() => toggleArchive(`/api/admin/rules/${rule.id}`, rule.isArchived)}>{rule.isArchived ? "Възстанови" : "Архивирай"}</button></div></td></tr>)}</tbody></table>
          </article>
        </section>
      ) : null}

      {activeTab === "learning" ? (
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <article className="sa-card p-4">
              <p className="text-xs uppercase text-zinc-500">Записи</p>
              <p className="mt-2 text-3xl font-bold">{state.learningRows.length}</p>
            </article>
            <article className="sa-card p-4">
              <p className="text-xs uppercase text-zinc-500">Завършени курсове</p>
              <p className="mt-2 text-3xl font-bold">
                {state.learningRows.filter((row) => row.status === "COMPLETED").length}
              </p>
            </article>
            <article className="sa-card p-4">
              <p className="text-xs uppercase text-zinc-500">Общо ретейкове</p>
              <p className="mt-2 text-3xl font-bold">
                {state.learningRows.reduce((sum, row) => sum + row.retakeCount, 0)}
              </p>
            </article>
            <article className="sa-card p-4">
              <p className="text-xs uppercase text-zinc-500">Служители с ретейк</p>
              <p className="mt-2 text-3xl font-bold">
                {
                  new Set(
                    state.learningRows
                      .filter((row) => row.retakeCount > 0)
                      .map((row) => row.userId)
                  ).size
                }
              </p>
            </article>
          </div>

          <article className="sa-card overflow-x-auto p-4">
            <h2 className="text-xl font-bold">Прогрес по служители и курсове</h2>
            <table className="mt-3 w-full min-w-[1240px] text-sm">
              <thead>
                <tr className="text-left text-zinc-500">
                  <th>Служител</th>
                  <th>Имейл</th>
                  <th>Отдел</th>
                  <th>Курс</th>
                  <th>Статус</th>
                  <th>Опити</th>
                  <th>Ретейкове</th>
                  <th>Последен резултат</th>
                  <th>Завършен с резултат</th>
                  <th>Обновено</th>
                </tr>
              </thead>
              <tbody>
                {state.learningRows.map((row) => (
                  <tr
                    key={`${row.userId}_${row.moduleId}`}
                    className="border-t border-[var(--line)]"
                  >
                    <td className="py-2 font-medium">{row.userName}</td>
                    <td className="py-2">{row.userEmail}</td>
                    <td className="py-2">{row.departmentName}</td>
                    <td className="py-2">
                      {row.moduleTitle}
                      <span className="ml-2 text-xs text-zinc-500">
                        {row.moduleIsMini ? "mini" : "основен"}
                      </span>
                    </td>
                    <td className="py-2">{learningStatusLabel(row.status)}</td>
                    <td className="py-2">{row.attemptsCount}</td>
                    <td className="py-2">{row.retakeCount}</td>
                    <td className="py-2">
                      {row.lastScorePercent === null ? "—" : `${row.lastScorePercent}%`}
                    </td>
                    <td className="py-2">
                      {row.completionScorePercent === null ? "—" : `${row.completionScorePercent}%`}
                    </td>
                    <td className="py-2">{new Date(row.updatedAt).toLocaleString("bg-BG")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>
      ) : null}

      {activeTab === "history" ? (
        <section className="sa-card overflow-x-auto p-4">
          <h2 className="text-xl font-bold">История (read-only)</h2>
          <table className="mt-3 w-full min-w-[780px] text-sm"><thead><tr className="text-left text-zinc-500"><th>Тип</th><th>Заглавие</th><th>Детайл</th><th>Създадено</th><th>Статус</th><th className="text-right">Действия</th></tr></thead><tbody>{state.history.map((entry) => <tr key={`${entry.type}_${entry.id}`} className="border-t border-[var(--line)]"><td className="py-2">{entry.type}</td><td className="py-2">{entry.title}</td><td className="py-2">{entry.subtitle}</td><td className="py-2">{new Date(entry.createdAt).toLocaleString("bg-BG")}</td><td className="py-2">{entry.isArchived ? "Архивиран" : "Активен"}</td><td className="py-2"><div className="flex justify-end"><button type="button" className="rounded-full border border-[var(--line)] px-3 py-1" onClick={() => toggleHistory(entry)}>{entry.isArchived ? "Възстанови" : "Архивирай"}</button></div></td></tr>)}</tbody></table>
        </section>
      ) : null}
    </section>
  );
}

