export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";

export type RiskBand = "HIGH" | "MEDIUM" | "SECURE";

export type ScenarioCategory =
  | "PHISHING"
  | "URL"
  | "SOCIAL_ENGINEERING"
  | "MALWARE";

export type ScenarioSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type PhishingCampaignStatus =
  | "DRAFT"
  | "QUEUED"
  | "SENT"
  | "COMPLETED"
  | "ARCHIVED";

export type ActionType =
  | "OPEN_ATTACHMENT"
  | "VERIFY_SENDER"
  | "FORWARD_EMAIL"
  | "REPORT_TO_IT"
  | "SHARE_OTP"
  | "CALL_OFFICIAL_SUPPORT"
  | "CLICK_LINK"
  | "IGNORE";

export type LearningMode = "VIDEO" | "TEXT";
export type TestQuestionKind = "TEXT" | "IMAGE";

export interface Archivable {
  isArchived: boolean;
  archivedAt: string | null;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
}

export interface Profile extends Archivable {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string;
  email: string;
  role: Role;
}

export interface TrainingModule extends Archivable {
  id: string;
  title: string;
  category: ScenarioCategory;
  isMini: boolean;
  order: number;
  durationMinutes: number;
  videoDurationSec: number;
  videoMockFileName: string | null;
  videoMockFileSizeMb: number | null;
  questionCount: number;
  passThresholdPercent: number;
  description: string;
  bulletPoints: string[];
  textSections: string[];
  testQuestionIds: string[];
}

export interface Scenario extends Archivable {
  id: string;
  moduleId: string;
  category: ScenarioCategory;
  severity: ScenarioSeverity;
  title: string;
  prompt: string;
  timeLimitSec: number;
}

export interface ScenarioOption extends Archivable {
  id: string;
  scenarioId: string;
  label: string;
  text: string;
  isCorrect: boolean;
  weight: number;
  actionType: ActionType;
  explanation: string;
}

export interface TestQuestion extends Archivable {
  id: string;
  moduleId: string;
  kind: TestQuestionKind;
  order: number;
  prompt: string;
  imageUrl?: string;
  explanation: string;
}

export interface TestOption extends Archivable {
  id: string;
  questionId: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface TestQuestionWithOptions extends TestQuestion {
  options: TestOption[];
}

export interface TestAnswer {
  questionId: string;
  selectedOptionId: string;
  responseTimeMs: number;
  correct: boolean;
  answeredAt: string;
}

export interface TestSession {
  id: string;
  userId: string;
  moduleId: string;
  questionIds: string[];
  currentIndex: number;
  totalQuestions: number;
  passThreshold: number;
  status: "IN_PROGRESS" | "FINISHED";
  startedAt: string;
  finishedAt: string | null;
  answers: TestAnswer[];
}

export interface LearningProgress {
  userId: string;
  moduleId: string;
  videoCompleted: boolean;
  textCompleted: boolean;
  testUnlocked: boolean;
  attemptsCount: number;
  lastScorePercent: number | null;
  lastPassed: boolean | null;
  updatedAt: string;
}

export interface ModuleCompletion extends Archivable {
  userId: string;
  moduleId: string;
  scorePercent: number;
  completedAt: string;
}

export interface Attempt extends Archivable {
  id: string;
  organizationId: string;
  userId: string;
  scenarioId: string;
  selectedOptionId: string | null;
  responseTimeMs: number;
  isCorrect: boolean;
  knowledgeScore: number;
  reactionRiskScore: number;
  behavioralRisk: RiskBand;
  createdAt: string;
}

export interface RiskEvent extends Archivable {
  id: string;
  organizationId: string;
  userId: string;
  scenarioId: string;
  type: "WRONG_ACTION" | "SLOW_RESPONSE" | "MISSED_REPORT";
  severity: ScenarioSeverity;
  createdAt: string;
}

export interface Assignment extends Archivable {
  id: string;
  organizationId: string;
  userId: string;
  moduleId: string;
  reason: string;
  status: "PENDING" | "COMPLETED";
  dueAt: string;
  retestAt: string | null;
  createdAt: string;
}

export interface AttemptInput {
  scenarioId: string;
  selectedOptionId: string | null;
  responseTimeMs: number;
}

export interface AttemptResult {
  knowledgeScore: number;
  reactionRiskScore: number;
  behavioralRisk: RiskBand;
  explanation: string;
  followUpAssigned: boolean;
}

export interface DashboardDepartmentBreakdown {
  departmentId: string;
  departmentName: string;
  avgKnowledgeScore: number;
  avgReactionRisk: number;
  overallRiskScore: number;
  riskBand: RiskBand;
  sampleSize: number;
}

export interface DashboardMistake {
  actionType: ActionType;
  count: number;
  label: string;
}

export interface AtRiskUser {
  userId: string;
  name: string;
  departmentName: string;
  latestRiskBand: RiskBand;
  latestKnowledgeScore: number;
  latestReactionRisk: number;
}

export interface DashboardMetrics {
  orgRiskScore: number;
  clickRate: number;
  reportRate: number;
  deptBreakdown: DashboardDepartmentBreakdown[];
  commonMistakes: DashboardMistake[];
  atRiskUsers: AtRiskUser[];
}

export interface AssignmentRule {
  id: string;
  category: ScenarioCategory;
  trigger: "WRONG_ANSWER" | "HIGH_REACTION_RISK";
  moduleId: string;
  dueInDays: number;
  retestInDays: number;
  isArchived: boolean;
  archivedAt: string | null;
  updatedAt: string;
}

export interface PhishingTemplate {
  id: string;
  name: string;
  subject: string;
  senderName: string;
  content: string;
}

export interface PhishingCampaignMetrics {
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  reportedCount: number;
  clickRate: number;
  reportRate: number;
}

export interface PhishingCampaign extends Archivable {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string;
  templateId: string;
  subject: string;
  senderName: string;
  content: string;
  status: PhishingCampaignStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  metrics: PhishingCampaignMetrics;
}

export interface AdminUserInput {
  name: string;
  email: string;
  departmentId: string;
  role: "EMPLOYEE" | "MANAGER";
}

export interface AdminModuleInput {
  title: string;
  category: ScenarioCategory;
  isMini: boolean;
  order: number;
  durationMinutes: number;
  videoDurationSec: number;
  videoMockFileName?: string | null;
  videoMockFileSizeMb?: number | null;
  questionCount: number;
  passThresholdPercent: number;
  description: string;
  bulletPoints: string[];
  textSections: string[];
}

export interface AdminQuestionInput {
  moduleId: string;
  kind: TestQuestionKind;
  order: number;
  prompt: string;
  imageUrl?: string;
  explanation: string;
}

export interface AdminOptionInput {
  questionId: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface AdminScenarioInput {
  moduleId: string;
  category: ScenarioCategory;
  severity: ScenarioSeverity;
  title: string;
  prompt: string;
  timeLimitSec: number;
}

export interface AdminScenarioOptionInput {
  scenarioId: string;
  label: string;
  text: string;
  isCorrect: boolean;
  weight: number;
  actionType: ActionType;
  explanation: string;
}

export interface AdminRuleInput {
  category: ScenarioCategory;
  trigger: "WRONG_ANSWER" | "HIGH_REACTION_RISK";
  moduleId: string;
  dueInDays: number;
  retestInDays: number;
}

export interface AdminPhishingCampaignInput {
  name: string;
  templateId: string;
  subject: string;
  senderName: string;
  content: string;
  departmentId: string;
}

export interface HistoryEntry {
  id: string;
  type: "ATTEMPT" | "RISK_EVENT" | "MODULE_COMPLETION";
  title: string;
  subtitle: string;
  createdAt: string;
  isArchived: boolean;
}

export interface LandingNavItem {
  id: string;
  label: string;
}

export interface LandingHeroContent {
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  trustPoints: string[];
}

export interface LandingProblemContent {
  eyebrow: string;
  title: string;
  body: string;
  risks: string[];
}

export interface LandingSolutionContent {
  eyebrow: string;
  title: string;
  body: string;
  outcomes: string[];
}

export interface LandingFeature {
  title: string;
  body: string;
  outcome: string;
}

export interface LandingMetric {
  value: string;
  label: string;
  hint: string;
}

export interface LandingTestimonial {
  quote: string;
  author: string;
  role: string;
}

export interface LandingFaqItem {
  question: string;
  answer: string;
}

export interface LandingFinalCtaContent {
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
}

export interface LandingContent {
  navItems: LandingNavItem[];
  hero: LandingHeroContent;
  problem: LandingProblemContent;
  solution: LandingSolutionContent;
  features: LandingFeature[];
  metrics: LandingMetric[];
  logos: string[];
  testimonials: LandingTestimonial[];
  faq: LandingFaqItem[];
  finalCta: LandingFinalCtaContent;
}

export interface UiCopy {
  appName: string;
  nav: {
    employeeHome: string;
    managerDashboard: string;
    managerSales: string;
    managerFinance: string;
    adminContent: string;
    managerView: string;
    logout: string;
  };
  risk: {
    high: string;
    medium: string;
    secure: string;
  };
}

export interface EmployeeLearningModule {
  moduleId: string;
  title: string;
  isMini: boolean;
  status: "NOT_STARTED" | "READY_FOR_TEST" | "COMPLETED";
  testUnlocked: boolean;
  lastScorePercent: number | null;
}

export interface EmployeeLearningState {
  nextModule: EmployeeLearningModule | null;
  remainingModules: EmployeeLearningModule[];
  completedModules: EmployeeLearningModule[];
  modules: EmployeeLearningModule[];
  progress: LearningProgress[];
}
