import { computeAttemptResult } from "@/lib/risk-engine";
import {
  Assignment,
  AssignmentRule,
  Attempt,
  Department,
  LearningProgress,
  ModuleCompletion,
  Organization,
  Profile,
  RiskEvent,
  Scenario,
  ScenarioCategory,
  ScenarioOption,
  TestOption,
  TestQuestion,
  TestQuestionKind,
  TestSession,
  TrainingModule,
} from "@/lib/types";

const ORG_ID = "org_secureaware_demo";

export interface SeedState {
  organization: Organization;
  departments: Department[];
  profiles: Profile[];
  modules: TrainingModule[];
  scenarios: Scenario[];
  scenarioOptions: ScenarioOption[];
  testQuestions: TestQuestion[];
  testOptions: TestOption[];
  learningProgress: LearningProgress[];
  moduleCompletions: ModuleCompletion[];
  testSessions: TestSession[];
  attempts: Attempt[];
  riskEvents: RiskEvent[];
  assignments: Assignment[];
  assignmentRules: AssignmentRule[];
}

const DEPARTMENTS: Department[] = [
  { id: "dept_sales", organizationId: ORG_ID, name: "Продажби" },
  { id: "dept_finance", organizationId: ORG_ID, name: "Финанси" },
  { id: "dept_hr", organizationId: ORG_ID, name: "Човешки ресурси" },
];

type ModuleBlueprint = Omit<
  TrainingModule,
  | "testQuestionIds"
  | "questionCount"
  | "passThresholdPercent"
  | "videoMockFileName"
  | "videoMockFileSizeMb"
  | "isArchived"
  | "archivedAt"
  | "updatedAt"
>;

const MODULE_BLUEPRINTS: ModuleBlueprint[] = [
  {
    id: "mod_phishing_core",
    title: "Фишинг осведоменост",
    category: "PHISHING",
    isMini: false,
    order: 1,
    durationMinutes: 7,
    videoDurationSec: 380,
    description: "Научи как да разпознаваш фишинг сигнали в имейли и чат съобщения.",
    bulletPoints: [
      "Проверявай внимателно подателя и домейна",
      "Не отваряй неочаквани прикачени файлове",
      "Докладвай съмнителни съобщения към IT/Сигурност",
    ],
    textSections: [
      "Фишинг атаките разчитат на спешност и емоционален натиск. Намали темпото и провери контекста.",
      "Преглеждай домейна на подателя, визуализацията на линковете и неочакваните искания за плащане или данни за достъп.",
      "Използвай официалния процес за докладване вместо да препращаш съмнителни съобщения на колеги.",
    ],
  },
  {
    id: "mod_url_core",
    title: "Разпознаване на URL",
    category: "URL",
    isMini: false,
    order: 2,
    durationMinutes: 6,
    videoDurationSec: 360,
    description: "Разпознавай фалшиви URL адреси за вход и съмнителни домейни преди да въвеждаш данни.",
    bulletPoints: [
      "Проверявай основния домейн, не само думите на бранда в URL",
      "Потвърждавай HTTPS и данните за сертификата",
      "Излез и докладвай, ако страницата за вход изглежда съмнителна",
    ],
    textSections: [
      "Атакуващите имитират познати брандове чрез добавяне на думи в поддомейните.",
      "Винаги проверявай основния домейн преди въвеждане на данни за достъп.",
      "Ако URL адресът изглежда съмнителен, спри и провери през официален канал.",
    ],
  },
  {
    id: "mod_social_core",
    title: "Защита от социално инженерство",
    category: "SOCIAL_ENGINEERING",
    isMini: false,
    order: 3,
    durationMinutes: 6,
    videoDurationSec: 340,
    description: "Реагирай правилно при натиск по телефон и фалшива самоличност на „поддръжка“.",
    bulletPoints: [
      "Никога не споделяй OTP кодове или пароли",
      "Прекратявай непознати обаждания от „поддръжка“ и звъни на официалния екип по поддръжка",
      "Ескалирай съмнително поведение веднага",
    ],
    textSections: [
      "Социалното инженерство използва доверие и фалшив авторитет.",
      "Телефонните атаки често искат OTP кодове под претекст за спешност.",
      "Прекрати разговора и провери чрез официалния списък с IT контакти.",
    ],
  },
  {
    id: "mini_phishing",
    title: "Мини тренировка: Имейл сигурност",
    category: "PHISHING",
    isMini: true,
    order: 101,
    durationMinutes: 4,
    videoDurationSec: 210,
    description: "Кратка последваща тренировка след грешки при фишинг.",
    bulletPoints: ["Провери подателя", "Не отваряй непознати линкове", "Докладвай бързо"],
    textSections: [
      "Тази мини тренировка затвърждава безопасния процес за реакция на имейл.",
      "Използвай инструментите за докладване, за да защитиш и себе си, и екипа.",
      "Ескалирай съмнителни прикачени файлове веднага.",
    ],
  },
  {
    id: "mini_url",
    title: "Мини тренировка: Проверка на URL",
    category: "URL",
    isMini: true,
    order: 102,
    durationMinutes: 4,
    videoDurationSec: 230,
    description: "Кратко затвърждаване на разпознаването на URL при рисково поведение.",
    bulletPoints: [
      "Първо провери основния домейн",
      "Не въвеждай данни при съмнение",
      "Докладвай фалшиви страници",
    ],
    textSections: [
      "Проверявай какво стои преди и след основния домейн.",
      "Никога не разчитай само на визуална прилика.",
      "При съмнение затвори страницата и потвърди през официален канал.",
    ],
  },
  {
    id: "mini_social",
    title: "Мини тренировка: Проверка на обаждащ се",
    category: "SOCIAL_ENGINEERING",
    isMini: true,
    order: 103,
    durationMinutes: 4,
    videoDurationSec: 220,
    description: "Кратка тренировка за реакция при фалшиви заявки от „поддръжка“.",
    bulletPoints: [
      "Не споделяй OTP кодове",
      "Обади се обратно на официален номер",
      "Ескалирай инцидента",
    ],
    textSections: [
      "Атакуващите често се представят за вътрешни екипи по поддръжка.",
      "Никога не споделяй OTP или кодове за смяна на парола по телефон.",
      "Използвай обратно позвъняване към познати вътрешни номера.",
    ],
  },
];

const LONG_SECTION_TARGET_CHARS = 380;

function expandSection(base: string, category: string): string {
  const filler =
    ` Във всяка ситуация за ${category} потвърждавай източника по независим канал, ` +
    "следвай вътрешната процедура и документирай решението си в работния процес. " +
    "Това поведение намалява грешките под напрежение и дава на екипа по сигурност " +
    "ясна следа за бърза реакция и превенция на повторни инциденти.";

  let section = base.trim();
  while (section.length < LONG_SECTION_TARGET_CHARS) {
    section += filler;
  }
  return section;
}

function moduleCategoryLabel(category: ScenarioCategory): string {
  if (category === "PHISHING") return "имейл сигурност";
  if (category === "URL") return "проверка на URL";
  if (category === "SOCIAL_ENGINEERING") return "социално инженерство";
  return "защита от зловреден софтуер";
}

function buildLongLessonSections(module: ModuleBlueprint): string[] {
  const category = moduleCategoryLabel(module.category);
  const moduleType = module.isMini ? "мини модул" : "основен модул";
  const baseSections = [
    `Този ${moduleType} има практична цел: да изградиш устойчива рутина за ${category} в ежедневната работа. Работиш по ясен модел за проверка, вместо да разчиташ на импулсивни решения при спешни задачи.`,
    "Първата стъпка е контекстът. Преди действие проверяваш дали искането е очаквано, дали е в рамките на реален процес и дали отговаря на твоята роля. При несъответствие маркираш ситуацията като потенциален риск.",
    "Втората стъпка е техническа проверка. Анализираш домейни, линкове, прикачени файлове, формулировки и UI индикатори. Търсиш комбинация от сигнали, а не единичен детайл, за да вземеш стабилно решение.",
    "Третата стъпка е контролирана реакция. При съмнение не импровизираш, не препращаш към колеги и не продължаваш взаимодействието. Използваш официалния канал за докладване и съхраняваш релевантните доказателства.",
    "Четвъртата стъпка е ескалация. Потвърждаваш информацията през независим официален канал и избягваш контактни данни, подадени от съмнителния източник. Така не допускаш манипулация чрез фалшива идентичност.",
    "Последната стъпка е самооценка. След всеки казус сравняваш избора си с фирмената политика и отбелязваш какво би оптимизирал следващия път, за да поддържаш бърза и сигурна реакция.",
  ];
  return baseSections.map((section) => expandSection(section, category));
}

const SCENARIOS_RAW: Array<
  Omit<Scenario, "isArchived" | "archivedAt" | "updatedAt">
> = [
  {
    id: "scn_phishing_invoice",
    moduleId: "mod_phishing_core",
    category: "PHISHING",
    severity: "HIGH",
    title: "Имейл с фактура от куриер",
    prompt:
      "Получавате имейл за неплатена доставка с прикачен файл invoice.pdf и спешно искане за плащане.",
    timeLimitSec: 20,
  },
  {
    id: "scn_url_login",
    moduleId: "mod_url_core",
    category: "URL",
    severity: "MEDIUM",
    title: "Фалшив портал за вход",
    prompt:
      "Отваря се страница за вход с URL secure-bank-login.verify-identity.co. Какво правиш първо?",
    timeLimitSec: 25,
  },
  {
    id: "scn_social_otp",
    moduleId: "mod_social_core",
    category: "SOCIAL_ENGINEERING",
    severity: "CRITICAL",
    title: "Обаждане от фалшив IT екип",
    prompt:
      "Човек, представящ се за IT, иска SMS кода ти, за да „отключи“ профила ти по спешност.",
    timeLimitSec: 20,
  },
];

const SCENARIO_OPTIONS_RAW: Array<
  Omit<ScenarioOption, "isArchived" | "archivedAt" | "updatedAt">
> = [
  {
    id: "opt_a_open_file",
    scenarioId: "scn_phishing_invoice",
    label: "A",
    text: "Отварям прикачения файл",
    isCorrect: false,
    weight: 1,
    actionType: "OPEN_ATTACHMENT",
    explanation: "Високорисково действие. Първо провери подателя и докладвай.",
  },
  {
    id: "opt_b_verify_sender",
    scenarioId: "scn_phishing_invoice",
    label: "B",
    text: "Проверявам адреса на подателя",
    isCorrect: true,
    weight: 4,
    actionType: "VERIFY_SENDER",
    explanation: "Добра първа стъпка. Продължи с докладване.",
  },
  {
    id: "opt_c_forward",
    scenarioId: "scn_phishing_invoice",
    label: "C",
    text: "Препращам на колега",
    isCorrect: false,
    weight: 2,
    actionType: "FORWARD_EMAIL",
    explanation: "Рисково. Може да разпространиш атаката вътрешно.",
  },
  {
    id: "opt_d_report",
    scenarioId: "scn_phishing_invoice",
    label: "D",
    text: "Докладвам към IT/Сигурност",
    isCorrect: true,
    weight: 5,
    actionType: "REPORT_TO_IT",
    explanation: "Отлична реакция за сигурността на организацията.",
  },
  {
    id: "opt_u_click_link",
    scenarioId: "scn_url_login",
    label: "A",
    text: "Въвеждам данните си и продължавам",
    isCorrect: false,
    weight: 1,
    actionType: "CLICK_LINK",
    explanation: "Това най-вероятно е фалшив домейн.",
  },
  {
    id: "opt_u_verify_domain",
    scenarioId: "scn_url_login",
    label: "B",
    text: "Проверявам домейна и сертификата",
    isCorrect: true,
    weight: 5,
    actionType: "VERIFY_SENDER",
    explanation: "Правилно безопасно поведение.",
  },
  {
    id: "opt_u_ignore",
    scenarioId: "scn_url_login",
    label: "C",
    text: "Затварям страницата и не влизам",
    isCorrect: true,
    weight: 3,
    actionType: "IGNORE",
    explanation: "Безопасна реакция при съмнение.",
  },
  {
    id: "opt_s_share",
    scenarioId: "scn_social_otp",
    label: "A",
    text: "Давам SMS кода",
    isCorrect: false,
    weight: 1,
    actionType: "SHARE_OTP",
    explanation: "Критична грешка. Никога не споделяй OTP.",
  },
  {
    id: "opt_s_ask_why",
    scenarioId: "scn_social_otp",
    label: "B",
    text: "Питам защо им е кодът",
    isCorrect: false,
    weight: 2,
    actionType: "IGNORE",
    explanation: "Не е достатъчно. Прекрати разговора и провери.",
  },
  {
    id: "opt_s_callback",
    scenarioId: "scn_social_otp",
    label: "C",
    text: "Затварям и звъня на официалния IT номер",
    isCorrect: true,
    weight: 5,
    actionType: "CALL_OFFICIAL_SUPPORT",
    explanation: "Правилна реакция срещу социално инженерство.",
  },
];

const RULES_RAW: Array<
  Omit<AssignmentRule, "isArchived" | "archivedAt" | "updatedAt">
> = [
  {
    id: "rule_phishing_wrong",
    category: "PHISHING",
    trigger: "WRONG_ANSWER",
    moduleId: "mini_phishing",
    dueInDays: 7,
    retestInDays: 14,
  },
  {
    id: "rule_url_risk",
    category: "URL",
    trigger: "HIGH_REACTION_RISK",
    moduleId: "mini_url",
    dueInDays: 7,
    retestInDays: 14,
  },
  {
    id: "rule_social_wrong",
    category: "SOCIAL_ENGINEERING",
    trigger: "WRONG_ANSWER",
    moduleId: "mini_social",
    dueInDays: 5,
    retestInDays: 14,
  },
];

function withArchivable<T extends object>(input: T) {
  const now = new Date().toISOString();
  return {
    ...input,
    isArchived: false,
    archivedAt: null,
    updatedAt: now,
  };
}

const SCENARIOS: Scenario[] = SCENARIOS_RAW.map((item) => withArchivable(item));
const SCENARIO_OPTIONS: ScenarioOption[] = SCENARIO_OPTIONS_RAW.map((item) =>
  withArchivable(item)
);
const RULES: AssignmentRule[] = RULES_RAW.map((item) => withArchivable(item));

interface QuestionTemplate {
  prompt: string;
  kind: TestQuestionKind;
  imageUrl?: string;
  explanation: string;
  options: [string, string, string, string];
  correctIndex: number;
}

const CATEGORY_QUESTION_TEMPLATES: Record<ScenarioCategory, QuestionTemplate[]> = {
  PHISHING: [
    {
      prompt: "Получаваш спешен имейл за плащане от доставчик. Какво правиш първо?",
      kind: "TEXT",
      explanation: "Винаги провери подателя и контекста преди каквото и да е действие.",
      options: [
        "Отварям прикачения файл веднага",
        "Проверявам домейна и детайлите на подателя",
        "Препращам на колега",
        "Игнорирам и трия",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Кое действие най-добре защитава екипа от разпространение на фишинг?",
      kind: "TEXT",
      explanation: "Бързото докладване ограничава обхвата на атаката.",
      options: [
        "Отговарям и питам дали имейлът е легитимен",
        "Препращам на целия екип",
        "Докладвам към IT/Сигурност",
        "Свалям файла и го проверявам ръчно",
      ],
      correctIndex: 2,
    },
    {
      prompt: "Кой е най-големият червен флаг в тази екранна снимка на вход?",
      kind: "IMAGE",
      imageUrl: "/images/fake-login.svg",
      explanation: "Страница, наподобяваща бранд, но с грешен домейн, е класически фишинг сигнал.",
      options: [
        "Цвят на логото",
        "Грешен домейн в адресната лента",
        "Поле за парола",
        "Отметка „Запомни ме“",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Получаваш неочакван файл invoice_update.zip. Коя е най-безопасната първа стъпка?",
      kind: "TEXT",
      explanation: "Неочакваните архиви често са носител на зловреден софтуер.",
      options: [
        "Разархивирам и преглеждам съдържанието",
        "Качвам файла в публичен скенер",
        "Проверявам подателя и докладвам",
        "Изпращам на колега да провери",
      ],
      correctIndex: 2,
    },
    {
      prompt: "Какво правиш с имейл, който изисква незабавна верификация на акаунта?",
      kind: "TEXT",
      explanation: "Спешност плюс натиск за акаунт е типичен фишинг модел.",
      options: [
        "Кликвам бързо линка, за да не ми блокират достъпа",
        "Проверявам през официалния портал, не през линка в имейла",
        "Отговарям с телефон за връзка",
        "Маркирам имейла като важен",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Открий подозрителния елемент в тази екранна снимка на URL лентата.",
      kind: "IMAGE",
      imageUrl: "/images/url-bar.svg",
      explanation: "Домейни с правописни имитации често се представят за реални брандове.",
      options: [
        "HTTPS икона",
        "Правописна грешка в домейна",
        "Икона за търсене",
        "Брой табове",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Ако не си сигурен дали имейл е фишинг, най-доброто действие е:",
      kind: "TEXT",
      explanation: "При съмнение ескалирай, вместо да взаимодействаш със съобщението.",
      options: [
        "Отварям линковете в инкогнито режим",
        "Питам подателя в същия имейл дали е истински",
        "Докладвам и не взаимодействам",
        "Разпечатвам имейла",
      ],
      correctIndex: 2,
    },
    {
      prompt: "Кое поведение увеличава най-много риска от фишинг?",
      kind: "TEXT",
      explanation: "Препращането на съмнителни съобщения увеличава обхвата на риска.",
      options: [
        "Проверка на правописа на домейна",
        "Вътрешно препращане на съмнителен имейл",
        "Използване на бутон за докладване",
        "Изтриване на съмнителен прикачен файл",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Кое показва, че този прозорец за сигурност е фалшив?",
      kind: "IMAGE",
      imageUrl: "/images/popup-warning.svg",
      explanation: "Изскачащи прозорци, които налагат незабавно изтегляне, са подозрителни.",
      options: [
        "Син бутон",
        "Спешен език + принудително изтегляне",
        "Голям шрифт",
        "Икона за затваряне на браузъра",
      ],
      correctIndex: 1,
    },
    {
      prompt: "След като разпознаеш фишинг, коя е финалната правилна стъпка?",
      kind: "TEXT",
      explanation: "Докладвай и документирай случая, за да се подобри защитата на екипа.",
      options: [
        "Запазвам случая само за себе си",
        "Докладвам в канала към IT/Сигурност",
        "Отговарям и предупреждавам атакуващия",
        "Архивирам в лична папка",
      ],
      correctIndex: 1,
    },
  ],
  URL: [
    {
      prompt: "Какво трябва да се провери първо в URL за вход?",
      kind: "TEXT",
      explanation: "Основният домейн е ключов сигнал за доверие.",
      options: [
        "Дизайнът на страницата",
        "Основният домейн",
        "Цветовата тема",
        "Колко бързо се зарежда страницата",
      ],
      correctIndex: 1,
    },
    {
      prompt: "URL адресът съдържа много думи на бранда преди непознат домейн. Това означава:",
      kind: "TEXT",
      explanation: "Триковете с поддомейни са честа фишинг техника.",
      options: [
        "Вероятно е легитимен",
        "Вероятно е имитация на домейн/социално инженерство",
        "Няма риск, щом има HTTPS",
        "Безопасен е след презареждане",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Кой елемент в URL лентата на екранната снимка е червен флаг?",
      kind: "IMAGE",
      imageUrl: "/images/url-bar.svg",
      explanation: "Неочакваното разширение на домейна е сериозен предупредителен знак.",
      options: [
        "Несъответствие в разширението на домейна",
        "Икона катинар",
        "Стрелка назад",
        "Икона за отметка",
      ],
      correctIndex: 0,
    },
    {
      prompt: "Ако URL адресът изглежда съмнителен, трябва да:",
      kind: "TEXT",
      explanation: "Никога не продължавай с въвеждане на данни за достъп.",
      options: [
        "Направя един опит за вход",
        "Затворя страницата и проверя през официалния сайт",
        "Изпращам екранна снимка на приятел за мнение",
        "Игнорирам предупреждението и продължа",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Само наличието на HTTPS означава, че страницата е:",
      kind: "TEXT",
      explanation: "HTTPS е необходимо, но не е достатъчно условие за доверие.",
      options: [
        "Винаги надеждна",
        "Възможно е да е фалшива въпреки HTTPS",
        "Безопасна само в конкретен браузър",
        "Безопасна, ако няма изскачащ прозорец",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Кое е подозрителното в тази екранна снимка на фалшива актуализация?",
      kind: "IMAGE",
      imageUrl: "/images/fake-update.svg",
      explanation:
        "Обновяването на браузър трябва да идва от доверен процес за актуализация, не от случайна страница.",
      options: [
        "Голям бутон за актуализация със спешен заплашителен текст",
        "Син фон",
        "Опростен дизайн",
        "Кратък URL",
      ],
      correctIndex: 0,
    },
    {
      prompt: "Най-добрият начин да провериш URL на банков портал е:",
      kind: "TEXT",
      explanation: "Използвай ръчно въведен официален адрес или доверена отметка.",
      options: [
        "Кликвам линк от имейл",
        "Въвеждам официалния URL ръчно",
        "Търся в интернет и отварям първия резултат",
        "Питам чатбота в страницата",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Грешка в една буква на познат домейн обикновено означава:",
      kind: "TEXT",
      explanation: "Домейни, които изглеждат подобно, са високорискови.",
      options: [
        "Няма проблем",
        "Вероятно фишинг домейн",
        "Временен технически проблем",
        "Регионално огледало",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Кое е най-безопасното поведение преди въвеждане на MFA код?",
      kind: "TEXT",
      explanation: "Първо валидирай домейна и очаквания контекст за вход.",
      options: [
        "Въвеждам бързо кода преди изтичане",
        "Проверявам домейна и автентичността на канала",
        "Пропускам полето за потребителско име",
        "Изключвам MFA",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Кое действие е правилно, когато URL изглежда фалшив?",
      kind: "TEXT",
      explanation: "Ескалирай и избегни всякакво взаимодействие.",
      options: [
        "Правя екранна снимка и докладвам",
        "Тествам с примерни данни",
        "Споделям с колеги за мнение",
        "Опитвам в друг браузър",
      ],
      correctIndex: 0,
    },
  ],
  SOCIAL_ENGINEERING: [
    {
      prompt: "Някой, представящ се за IT, иска OTP код. Кое е правилното действие?",
      kind: "TEXT",
      explanation: "Никога не споделяй OTP по телефон или чат.",
      options: [
        "Давам кода, ако човекът звучи убедително",
        "Прекратявам разговора и се обаждам на официалния IT номер",
        "Питам мениджъра и после давам кода",
        "Споделям само част от кода",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Основната тактика при спешно обаждане от „поддръжка“ е:",
      kind: "TEXT",
      explanation: "Атакуващите използват натиск чрез спешност и авторитет.",
      options: [
        "Много технически детайли",
        "Натиск чрез спешност и авторитет",
        "Дълго време на изчакване",
        "Шум на заден фон",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Кое е подозрително в тази екранна снимка на предупреждаващ прозорец?",
      kind: "IMAGE",
      imageUrl: "/images/popup-warning.svg",
      explanation:
        "Послания, базирани на страх и натиск за незабавно действие, са типичен модел за манипулация.",
      options: [
        "Неутрален тон",
        "Страх + натиск за незабавно действие",
        "Опростена икона",
        "Два бутона",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Ако обаждащият се поиска отдалечен достъп веднага, трябва да:",
      kind: "TEXT",
      explanation: "Използвай официалния процес с тикет и потвърди самоличността.",
      options: [
        "Разреша бързо, за да спестя време",
        "Откажа и проверя през официалния канал за поддръжка",
        "Поискам личен имейл",
        "Инсталирам инструмент за отдалечен достъп",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Споделянето на линк за смяна на парола с непознат обаждащ се е:",
      kind: "TEXT",
      explanation: "Равносилно е на предоставяне на достъп до акаунта.",
      options: [
        "Безопасно, ако разговорът се записва",
        "Високорисково и забранено",
        "Безопасно в работно време",
        "Разрешено за външни доставчици",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Фалшивата „поддръжка“ най-често иска първо какво?",
      kind: "TEXT",
      explanation: "Токени за автентикация и еднократни кодове.",
      options: ["График за отпуски", "OTP/MFA кодове", "Модел на лаптоп", "Офис локация"],
      correctIndex: 1,
    },
    {
      prompt: "Обаждащият се знае името и ролята ти. Това означава:",
      kind: "TEXT",
      explanation: "Публичната информация не доказва легитимност.",
      options: [
        "Обаждащият се със сигурност е вътрешен човек",
        "Пак трябва да се провери самоличността по официален процес",
        "Безопасно е да споделя данни за достъп",
        "Безопасно е да инсталирам софтуер",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Най-добрата финална стъпка след съмнително обаждане е:",
      kind: "TEXT",
      explanation: "Докладването помага за откриване на координирани кампании.",
      options: [
        "Забравям и продължавам работа",
        "Докладвам инцидента в канала за сигурност",
        "Блокирам само непознатия номер",
        "Рестартирам компютъра",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Тази фалшива екранна снимка за вход най-често се използва за:",
      kind: "IMAGE",
      imageUrl: "/images/fake-login.svg",
      explanation: "Кражба на данни за достъп след натиск със социално инженерство.",
      options: [
        "Събиране на абонаменти за бюлетин",
        "Кражба на данни за достъп",
        "Активация на софтуер",
        "Фирмена анкета",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Какво правиш, ако обаждащият се каже „мениджърът ти го одобри“?",
      kind: "TEXT",
      explanation: "Провери през независим официален канал.",
      options: [
        "Продължавам веднага",
        "Спирам и проверявам одобрението директно с мениджъра",
        "Споделям само част от данните",
        "Пренебрегвам политиката този път",
      ],
      correctIndex: 1,
    },
  ],
  MALWARE: [],
};

function buildProfiles(): Profile[] {
  const now = new Date().toISOString();
  const managers: Profile[] = [
    {
      id: "usr_admin_1",
      organizationId: ORG_ID,
      departmentId: "dept_hr",
      name: "Админ Демо",
      email: "admin@secureaware.demo",
      role: "ADMIN",
      isArchived: false,
      archivedAt: null,
      updatedAt: now,
    },
    {
      id: "usr_mgr_sales",
      organizationId: ORG_ID,
      departmentId: "dept_sales",
      name: "Мария Иванова",
      email: "m.ivanova@secureaware.demo",
      role: "MANAGER",
      isArchived: false,
      archivedAt: null,
      updatedAt: now,
    },
    {
      id: "usr_mgr_fin",
      organizationId: ORG_ID,
      departmentId: "dept_finance",
      name: "Петър Георгиев",
      email: "p.georgiev@secureaware.demo",
      role: "MANAGER",
      isArchived: false,
      archivedAt: null,
      updatedAt: now,
    },
    {
      id: "usr_mgr_hr",
      organizationId: ORG_ID,
      departmentId: "dept_hr",
      name: "Елица Тодорова",
      email: "e.todorova@secureaware.demo",
      role: "MANAGER",
      isArchived: false,
      archivedAt: null,
      updatedAt: now,
    },
  ];

  const employees: Profile[] = [];
  let counter = 1;
  for (const department of DEPARTMENTS) {
    for (let i = 1; i <= 10; i += 1) {
      const name = `${department.name} служител ${i}`;
      const emailPrefix = department.id.replace("dept_", "");
      employees.push({
        id: `usr_emp_${counter++}`,
        organizationId: ORG_ID,
        departmentId: department.id,
        name,
        email: `${emailPrefix}.user${i}@secureaware.demo`,
        role: "EMPLOYEE",
        isArchived: false,
        archivedAt: null,
        updatedAt: now,
      });
    }
  }
  return [...managers, ...employees];
}

function buildQuestionsForModule(module: ModuleBlueprint): {
  questionIds: string[];
  questions: TestQuestion[];
  options: TestOption[];
} {
  const templates = CATEGORY_QUESTION_TEMPLATES[module.category].slice(0, 10);
  const questions: TestQuestion[] = [];
  const options: TestOption[] = [];
  const questionIds: string[] = [];

  templates.forEach((template, idx) => {
    const questionId = `tq_${module.id}_${idx + 1}`;
    questionIds.push(questionId);
    questions.push({
      id: questionId,
      moduleId: module.id,
      kind: template.kind,
      order: idx + 1,
      prompt: template.prompt,
      imageUrl: template.imageUrl,
      explanation: template.explanation,
      isArchived: false,
      archivedAt: null,
      updatedAt: new Date().toISOString(),
    });

    template.options.forEach((text, optionIdx) => {
      options.push({
        id: `to_${module.id}_${idx + 1}_${optionIdx + 1}`,
        questionId,
        label: String.fromCharCode(65 + optionIdx),
        text,
        isCorrect: optionIdx === template.correctIndex,
        isArchived: false,
        archivedAt: null,
        updatedAt: new Date().toISOString(),
      });
    });
  });

  return { questionIds, questions, options };
}

function buildModulesAndTests(): {
  modules: TrainingModule[];
  testQuestions: TestQuestion[];
  testOptions: TestOption[];
} {
  const modules: TrainingModule[] = [];
  const testQuestions: TestQuestion[] = [];
  const testOptions: TestOption[] = [];

  MODULE_BLUEPRINTS.forEach((blueprint) => {
    const built = buildQuestionsForModule(blueprint);
    modules.push({
      ...blueprint,
      questionCount: 10,
      passThresholdPercent: 80,
      textSections: buildLongLessonSections(blueprint),
      videoMockFileName: null,
      videoMockFileSizeMb: null,
      testQuestionIds: built.questionIds,
      isArchived: false,
      archivedAt: null,
      updatedAt: new Date().toISOString(),
    });
    testQuestions.push(...built.questions);
    testOptions.push(...built.options);
  });

  return { modules, testQuestions, testOptions };
}

function buildInitialLearningProgress(params: {
  profiles: Profile[];
  modules: TrainingModule[];
}): LearningProgress[] {
  const { profiles, modules } = params;
  const employees = profiles.filter((profile) => profile.role === "EMPLOYEE");
  const now = new Date().toISOString();

  return employees.flatMap((employee) =>
    modules.map((module) => ({
      userId: employee.id,
      moduleId: module.id,
      videoCompleted: false,
      textCompleted: false,
      testUnlocked: false,
      attemptsCount: 0,
      lastScorePercent: null,
      lastPassed: null,
      updatedAt: now,
    }))
  );
}

function buildSeedAttempts(params: {
  profiles: Profile[];
  scenarios: Scenario[];
  options: ScenarioOption[];
}): { attempts: Attempt[]; riskEvents: RiskEvent[]; assignments: Assignment[] } {
  const { profiles, scenarios, options } = params;
  const employees = profiles.filter((p) => p.role === "EMPLOYEE");
  const now = new Date("2026-03-07T10:00:00.000Z");
  const categoryLabel: Record<ScenarioCategory, string> = {
    PHISHING: "фишинг",
    URL: "URL рискове",
    SOCIAL_ENGINEERING: "социално инженерство",
    MALWARE: "зловреден софтуер",
  };

  const attempts: Attempt[] = [];
  const riskEvents: RiskEvent[] = [];
  const assignments: Assignment[] = [];
  let attemptCounter = 1;
  let eventCounter = 1;
  let assignmentCounter = 1;

  employees.forEach((employee, employeeIdx) => {
    scenarios.forEach((scenario, scenarioIdx) => {
      const scenarioOptions = options.filter((o) => o.scenarioId === scenario.id);
      const wrongOption = scenarioOptions.find((o) => !o.isCorrect) ?? scenarioOptions[0];
      const bestOption =
        scenarioOptions
          .filter((o) => o.isCorrect)
          .sort((a, b) => b.weight - a.weight)[0] ?? scenarioOptions[0];
      const mediumOption =
        scenarioOptions.find((o) => o.isCorrect && o.weight <= 4) ?? bestOption;

      const behaviorBucket = (employeeIdx + scenarioIdx) % 5;
      const selectedOption =
        behaviorBucket === 0
          ? wrongOption
          : behaviorBucket === 1
            ? mediumOption
            : bestOption;
      const responseTimeMs =
        behaviorBucket === 0
          ? (scenario.timeLimitSec + 10) * 1000
          : behaviorBucket === 1
            ? scenario.timeLimitSec * 1000
            : Math.round((scenario.timeLimitSec * 0.45 + scenarioIdx * 1.5) * 1000);

      const result = computeAttemptResult({
        scenario,
        selectedOption,
        responseTimeMs,
      });
      const createdAt = new Date(now.getTime() - (employeeIdx + scenarioIdx) * 36e5).toISOString();

      const attempt: Attempt = {
        id: `att_${attemptCounter++}`,
        organizationId: ORG_ID,
        userId: employee.id,
        scenarioId: scenario.id,
        selectedOptionId: selectedOption.id,
        responseTimeMs,
        isCorrect: selectedOption.isCorrect,
        knowledgeScore: result.knowledgeScore,
        reactionRiskScore: result.reactionRiskScore,
        behavioralRisk: result.behavioralRisk,
        createdAt,
        isArchived: false,
        archivedAt: null,
        updatedAt: createdAt,
      };
      attempts.push(attempt);

      if (!selectedOption.isCorrect) {
        riskEvents.push({
          id: `evt_${eventCounter++}`,
          organizationId: ORG_ID,
          userId: employee.id,
          scenarioId: scenario.id,
          type: "WRONG_ACTION",
          severity: scenario.severity,
          createdAt,
          isArchived: false,
          archivedAt: null,
          updatedAt: createdAt,
        });
      }
      if (result.reactionRiskScore >= 70) {
        riskEvents.push({
          id: `evt_${eventCounter++}`,
          organizationId: ORG_ID,
          userId: employee.id,
          scenarioId: scenario.id,
          type: "SLOW_RESPONSE",
          severity: scenario.severity,
          createdAt,
          isArchived: false,
          archivedAt: null,
          updatedAt: createdAt,
        });
      }

      if (!selectedOption.isCorrect) {
        const moduleId =
          scenario.category === "PHISHING"
            ? "mini_phishing"
            : scenario.category === "URL"
              ? "mini_url"
              : "mini_social";
        assignments.push({
          id: `asg_${assignmentCounter++}`,
          organizationId: ORG_ID,
          userId: employee.id,
          moduleId,
          reason: `Автоматично последващо обучение след грешка в ${categoryLabel[scenario.category]}`,
          status: "PENDING",
          dueAt: new Date(now.getTime() + 7 * 24 * 36e5).toISOString(),
          retestAt: new Date(now.getTime() + 14 * 24 * 36e5).toISOString(),
          createdAt,
          isArchived: false,
          archivedAt: null,
          updatedAt: createdAt,
        });
      }
    });
  });

  return { attempts, riskEvents, assignments };
}

export function createSeedState(): SeedState {
  const { modules, testQuestions, testOptions } = buildModulesAndTests();
  const profiles = buildProfiles();
  const seedDerived = buildSeedAttempts({
    profiles,
    scenarios: SCENARIOS,
    options: SCENARIO_OPTIONS,
  });

  return {
    organization: { id: ORG_ID, name: "SecureAware Демо Организация" },
    departments: DEPARTMENTS,
    profiles,
    modules,
    scenarios: SCENARIOS,
    scenarioOptions: SCENARIO_OPTIONS,
    testQuestions,
    testOptions,
    learningProgress: buildInitialLearningProgress({ profiles, modules }),
    moduleCompletions: [],
    testSessions: [],
    attempts: seedDerived.attempts,
    riskEvents: seedDerived.riskEvents,
    assignments: seedDerived.assignments,
    assignmentRules: RULES,
  };
}
