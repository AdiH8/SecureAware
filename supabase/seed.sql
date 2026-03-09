begin;

insert into organizations (id, name)
values ('org_secureaware_demo', 'SecureAware Демо организация')
on conflict (id) do update set name = excluded.name;

insert into departments (id, organization_id, name)
values
  ('dept_sales', 'org_secureaware_demo', 'Продажби'),
  ('dept_finance', 'org_secureaware_demo', 'Финанси'),
  ('dept_hr', 'org_secureaware_demo', 'Човешки ресурси')
on conflict (id) do update set name = excluded.name;

-- Demo-only reset policy.
delete from phishing_campaign_events
where campaign_id like 'phc_seed_%';

delete from attempts
where id like 'att_seed_%';

delete from risk_events
where id like 'evt_seed_%';

delete from assignments
where id like 'asg_seed_%';

delete from learning_progress
where user_id like 'usr_emp_%';

delete from module_completions
where user_id like 'usr_emp_%';

delete from test_options
where id like 'to_seed_%';

delete from test_questions
where id like 'tq_seed_%';

delete from scenario_options
where id like 'opt_seed_%';

delete from scenarios
where id like 'scn_seed_%';

delete from assignment_rules
where id like 'rule_seed_%';

delete from phishing_campaigns
where id like 'phc_seed_%';

delete from modules
where id in (
  'mod_phishing_core',
  'mod_url_core',
  'mod_social_core',
  'mini_phishing',
  'mini_url',
  'mini_social',
  'mod_legacy_archived'
);

delete from profiles
where id in (
  'usr_admin_1',
  'usr_mgr_sales',
  'usr_mgr_fin',
  'usr_mgr_hr',
  'usr_emp_1',
  'usr_emp_2',
  'usr_emp_3',
  'usr_emp_4',
  'usr_emp_5',
  'usr_emp_6',
  'usr_emp_7',
  'usr_emp_8',
  'usr_emp_9',
  'usr_emp_10',
  'usr_emp_11',
  'usr_emp_12'
);

insert into profiles (id, organization_id, department_id, name, email, role, is_archived, archived_at, updated_at)
values
  ('usr_admin_1', 'org_secureaware_demo', 'dept_hr', 'Админ Демо', 'admin@secureaware.demo', 'ADMIN', false, null, '2026-03-09T08:00:00Z'),
  ('usr_mgr_sales', 'org_secureaware_demo', 'dept_sales', 'Мария Иванова', 'm.ivanova@secureaware.demo', 'MANAGER', false, null, '2026-03-09T08:00:00Z'),
  ('usr_mgr_fin', 'org_secureaware_demo', 'dept_finance', 'Петър Георгиев', 'p.georgiev@secureaware.demo', 'MANAGER', false, null, '2026-03-09T08:00:00Z'),
  ('usr_mgr_hr', 'org_secureaware_demo', 'dept_hr', 'Елица Тодорова', 'e.todorova@secureaware.demo', 'MANAGER', false, null, '2026-03-09T08:00:00Z'),

  ('usr_emp_1', 'org_secureaware_demo', 'dept_sales', 'Иво Петров', 'ivo.petrov@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),
  ('usr_emp_2', 'org_secureaware_demo', 'dept_sales', 'Надежда Стоянова', 'nadezhda.stoyanova@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),
  ('usr_emp_3', 'org_secureaware_demo', 'dept_sales', 'Асен Димитров', 'asen.dimitrov@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),
  ('usr_emp_4', 'org_secureaware_demo', 'dept_sales', 'Милена Георгиева', 'milena.georgieva@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),

  ('usr_emp_5', 'org_secureaware_demo', 'dept_finance', 'Борислав Илиев', 'borislav.iliev@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),
  ('usr_emp_6', 'org_secureaware_demo', 'dept_finance', 'Теодора Николова', 'teodora.nikolova@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),
  ('usr_emp_7', 'org_secureaware_demo', 'dept_finance', 'Кристиан Василев', 'kristian.vasilev@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),

  ('usr_emp_8', 'org_secureaware_demo', 'dept_hr', 'Десислава Маринова', 'desislava.marinova@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),
  ('usr_emp_9', 'org_secureaware_demo', 'dept_hr', 'Симеон Тодоров', 'simeon.todorov@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),
  ('usr_emp_10', 'org_secureaware_demo', 'dept_hr', 'Ралица Попова', 'ralitsa.popova@secureaware.demo', 'EMPLOYEE', false, null, '2026-03-09T08:00:00Z'),

  ('usr_emp_11', 'org_secureaware_demo', 'dept_sales', 'Архивиран служител 1', 'archived.sales1@secureaware.demo', 'EMPLOYEE', true, '2026-02-02T08:00:00Z', '2026-02-02T08:00:00Z'),
  ('usr_emp_12', 'org_secureaware_demo', 'dept_hr', 'Архивиран служител 2', 'archived.hr2@secureaware.demo', 'EMPLOYEE', true, '2026-01-20T08:00:00Z', '2026-01-20T08:00:00Z');

insert into modules (
  id, title, category, is_mini, order_index, duration_minutes, video_duration_sec,
  video_mock_file_name, video_mock_file_size_mb,
  question_count, pass_threshold_percent, description, bullet_points, text_sections,
  test_question_ids, is_archived, archived_at, updated_at
)
values
  (
    'mod_phishing_core',
    'Фишинг осведоменост',
    'PHISHING',
    false,
    1,
    7,
    380,
    'phishing-awareness-demo.mp4',
    14.6,
    10,
    80,
    'Как да разпознаваш фишинг имейли и спешни подвеждащи искания.',
    '["Провери подателя","Не отваряй прикачени файлове","Докладвай към IT"]'::jsonb,
    '["Раздел 1: Анализ на контекста и подателя.","Раздел 2: Проверка на домейн и линкове.","Раздел 3: Прикачени файлове и рискове.","Раздел 4: Ескалация към IT.","Раздел 5: Документиране на инцидент.","Раздел 6: Навици за устойчива реакция."]'::jsonb,
    '["tq_seed_ph_1"]'::jsonb,
    false,
    null,
    '2026-03-09T08:00:00Z'
  ),
  (
    'mod_url_core',
    'Разпознаване на URL',
    'URL',
    false,
    2,
    6,
    360,
    null,
    null,
    10,
    80,
    'Как да валидираш URL адреси и login страници.',
    '["Провери основния домейн","Потвърди HTTPS","Не въвеждай данни при съмнение"]'::jsonb,
    '["Раздел 1: Основен домейн.","Раздел 2: Поддомейни и измами.","Раздел 3: HTTPS и сертификати.","Раздел 4: Визуални имитации.","Раздел 5: Проверка през официален канал.","Раздел 6: Процедура при риск."]'::jsonb,
    '["tq_seed_url_1"]'::jsonb,
    false,
    null,
    '2026-03-09T08:00:00Z'
  ),
  (
    'mod_social_core',
    'Защита от социално инженерство',
    'SOCIAL_ENGINEERING',
    false,
    3,
    6,
    340,
    null,
    null,
    10,
    80,
    'Реакция при телефонен натиск и фалшива самоличност.',
    '["Никога не давай OTP","Провери самоличност","Ескалирай съмнителни искания"]'::jsonb,
    '["Раздел 1: Модели на натиск.","Раздел 2: Фалшив авторитет.","Раздел 3: OTP и MFA защита.","Раздел 4: Обратно позвъняване.","Раздел 5: Вътрешен процес.","Раздел 6: Поведение под напрежение."]'::jsonb,
    '["tq_seed_soc_1"]'::jsonb,
    false,
    null,
    '2026-03-09T08:00:00Z'
  ),
  (
    'mini_phishing',
    'Мини модул: Имейл сигурност',
    'PHISHING',
    true,
    101,
    4,
    220,
    null,
    null,
    5,
    80,
    'Кратко затвърждаване след грешка във фишинг сценарий.',
    '["Провери подателя","Не кликай линкове","Докладвай"]'::jsonb,
    '["Раздел 1: Сигнали за риск.","Раздел 2: Проверка на подател.","Раздел 3: Ескалация.","Раздел 4: Добри практики.","Раздел 5: Чести грешки.","Раздел 6: Ретест и затвърждаване."]'::jsonb,
    '["tq_seed_mph_1"]'::jsonb,
    false,
    null,
    '2026-03-09T08:00:00Z'
  ),
  (
    'mini_url',
    'Мини модул: Проверка на URL',
    'URL',
    true,
    102,
    4,
    230,
    null,
    null,
    5,
    80,
    'Кратко затвърждаване за URL верификация.',
    '["Провери домейн","Провери HTTPS","Докладвай фалшиви страници"]'::jsonb,
    '["Раздел 1: Домейн проверка.","Раздел 2: Поддомейни.","Раздел 3: HTTPS.","Раздел 4: Имитации.","Раздел 5: Риск сигнал.","Раздел 6: Ретест."]'::jsonb,
    '["tq_seed_murl_1"]'::jsonb,
    false,
    null,
    '2026-03-09T08:00:00Z'
  ),
  (
    'mini_social',
    'Мини модул: Проверка на обаждащ се',
    'SOCIAL_ENGINEERING',
    true,
    103,
    4,
    220,
    null,
    null,
    5,
    80,
    'Кратко затвърждаване за social engineering реакции.',
    '["Не давай OTP","Обратно позвъняване","Ескалация"]'::jsonb,
    '["Раздел 1: Социален натиск.","Раздел 2: Авторитет.","Раздел 3: OTP защита.","Раздел 4: Валидация.","Раздел 5: Ескалация.","Раздел 6: Практика."]'::jsonb,
    '["tq_seed_msoc_1"]'::jsonb,
    false,
    null,
    '2026-03-09T08:00:00Z'
  ),
  (
    'mod_legacy_archived',
    'Архивен модул: Legacy политика',
    'PHISHING',
    true,
    999,
    5,
    240,
    null,
    null,
    5,
    80,
    'Стар модул за демонстрация на архивирано съдържание.',
    '["Архивен курс","Не е активен","Само за история"]'::jsonb,
    '["Раздел 1: Архив.","Раздел 2: Legacy.","Раздел 3: История.","Раздел 4: Контрол.","Раздел 5: Съвместимост.","Раздел 6: Демо edge case."]'::jsonb,
    '[]'::jsonb,
    true,
    '2026-01-10T09:00:00Z',
    '2026-01-10T09:00:00Z'
  );

insert into test_questions (id, module_id, kind, order_index, prompt, image_url, explanation, is_archived, archived_at, updated_at)
values
  ('tq_seed_ph_1', 'mod_phishing_core', 'TEXT', 1, 'Получаваш имейл за неплатена доставка. Какво правиш първо?', null, 'Провери подателя и докладвай.', false, null, '2026-03-09T08:00:00Z'),
  ('tq_seed_url_1', 'mod_url_core', 'TEXT', 1, 'Кое е най-важното при URL проверка?', null, 'Провери основния домейн.', false, null, '2026-03-09T08:00:00Z'),
  ('tq_seed_soc_1', 'mod_social_core', 'TEXT', 1, 'Непознат иска OTP код по телефона. Как реагираш?', null, 'Затваряш и звъниш на официалния IT номер.', false, null, '2026-03-09T08:00:00Z'),
  ('tq_seed_mph_1', 'mini_phishing', 'TEXT', 1, 'Кое е правилно действие при съмнителен имейл?', null, 'Докладване към IT.', false, null, '2026-03-09T08:00:00Z'),
  ('tq_seed_murl_1', 'mini_url', 'TEXT', 1, 'Кое е червен флаг в URL?', null, 'Непознат домейн с имитация.', false, null, '2026-03-09T08:00:00Z'),
  ('tq_seed_msoc_1', 'mini_social', 'TEXT', 1, 'Кое е правилно при social engineering натиск?', null, 'Независима верификация.', false, null, '2026-03-09T08:00:00Z');

insert into test_options (id, question_id, label, text, is_correct, is_archived, archived_at, updated_at)
values
  ('to_seed_ph_1_a', 'tq_seed_ph_1', 'A', 'Отварям файла', false, false, null, '2026-03-09T08:00:00Z'),
  ('to_seed_ph_1_b', 'tq_seed_ph_1', 'B', 'Проверявам подателя', true, false, null, '2026-03-09T08:00:00Z'),
  ('to_seed_ph_1_c', 'tq_seed_ph_1', 'C', 'Препращам на колега', false, false, null, '2026-03-09T08:00:00Z'),

  ('to_seed_url_1_a', 'tq_seed_url_1', 'A', 'Проверка на основен домейн', true, false, null, '2026-03-09T08:00:00Z'),
  ('to_seed_url_1_b', 'tq_seed_url_1', 'B', 'Проверка на лого', false, false, null, '2026-03-09T08:00:00Z'),
  ('to_seed_url_1_c', 'tq_seed_url_1', 'C', 'Проверка на цветове', false, false, null, '2026-03-09T08:00:00Z'),

  ('to_seed_soc_1_a', 'tq_seed_soc_1', 'A', 'Давам OTP', false, false, null, '2026-03-09T08:00:00Z'),
  ('to_seed_soc_1_b', 'tq_seed_soc_1', 'B', 'Затварям и звъня на официалния IT номер', true, false, null, '2026-03-09T08:00:00Z'),
  ('to_seed_soc_1_c', 'tq_seed_soc_1', 'C', 'Питам защо и давам част от кода', false, false, null, '2026-03-09T08:00:00Z'),

  ('to_seed_mph_1_a', 'tq_seed_mph_1', 'A', 'Игнорирам', false, false, null, '2026-03-09T08:00:00Z'),
  ('to_seed_mph_1_b', 'tq_seed_mph_1', 'B', 'Докладвам към IT', true, false, null, '2026-03-09T08:00:00Z'),

  ('to_seed_murl_1_a', 'tq_seed_murl_1', 'A', 'Непознат домейн', true, false, null, '2026-03-09T08:00:00Z'),
  ('to_seed_murl_1_b', 'tq_seed_murl_1', 'B', 'Фирмено лого', false, false, null, '2026-03-09T08:00:00Z'),

  ('to_seed_msoc_1_a', 'tq_seed_msoc_1', 'A', 'Верифицирам през официален канал', true, false, null, '2026-03-09T08:00:00Z'),
  ('to_seed_msoc_1_b', 'tq_seed_msoc_1', 'B', 'Действам веднага', false, false, null, '2026-03-09T08:00:00Z');

insert into scenarios (id, module_id, category, severity, title, prompt, time_limit_sec, is_archived, archived_at, updated_at)
values
  ('scn_seed_ph', 'mod_phishing_core', 'PHISHING', 'HIGH', 'Куриерска фактура', 'Имейл със спешна фактура и прикачен файл.', 20, false, null, '2026-03-09T08:00:00Z'),
  ('scn_seed_url', 'mod_url_core', 'URL', 'MEDIUM', 'Фалшив login URL', 'Страница за вход с подозрителен домейн.', 25, false, null, '2026-03-09T08:00:00Z'),
  ('scn_seed_soc', 'mod_social_core', 'SOCIAL_ENGINEERING', 'CRITICAL', 'Фалшиво IT обаждане', 'Искат OTP код по телефона.', 20, false, null, '2026-03-09T08:00:00Z');

insert into scenario_options (id, scenario_id, label, text, is_correct, weight, action_type, explanation, is_archived, archived_at, updated_at)
values
  ('opt_seed_ph_a', 'scn_seed_ph', 'A', 'Отварям файла', false, 1, 'OPEN_ATTACHMENT', 'Рисково действие.', false, null, '2026-03-09T08:00:00Z'),
  ('opt_seed_ph_b', 'scn_seed_ph', 'B', 'Проверявам подателя', true, 4, 'VERIFY_SENDER', 'Коректна първа стъпка.', false, null, '2026-03-09T08:00:00Z'),
  ('opt_seed_ph_c', 'scn_seed_ph', 'C', 'Докладвам към IT', true, 5, 'REPORT_TO_IT', 'Най-добра реакция.', false, null, '2026-03-09T08:00:00Z'),

  ('opt_seed_url_a', 'scn_seed_url', 'A', 'Въвеждам данни', false, 1, 'CLICK_LINK', 'Рисково действие.', false, null, '2026-03-09T08:00:00Z'),
  ('opt_seed_url_b', 'scn_seed_url', 'B', 'Проверявам домейна', true, 5, 'VERIFY_SENDER', 'Добра реакция.', false, null, '2026-03-09T08:00:00Z'),

  ('opt_seed_soc_a', 'scn_seed_soc', 'A', 'Давам OTP', false, 1, 'SHARE_OTP', 'Критична грешка.', false, null, '2026-03-09T08:00:00Z'),
  ('opt_seed_soc_b', 'scn_seed_soc', 'B', 'Затварям и звъня на официалния IT номер', true, 5, 'CALL_OFFICIAL_SUPPORT', 'Правилно действие.', false, null, '2026-03-09T08:00:00Z');

insert into assignment_rules (id, category, trigger, module_id, due_in_days, retest_in_days, is_archived, archived_at, updated_at)
values
  ('rule_seed_ph_wrong', 'PHISHING', 'WRONG_ANSWER', 'mini_phishing', 7, 14, false, null, '2026-03-09T08:00:00Z'),
  ('rule_seed_url_wrong', 'URL', 'WRONG_ANSWER', 'mini_url', 7, 14, false, null, '2026-03-09T08:00:00Z'),
  ('rule_seed_soc_wrong', 'SOCIAL_ENGINEERING', 'WRONG_ANSWER', 'mini_social', 7, 14, false, null, '2026-03-09T08:00:00Z');

insert into learning_progress (
  user_id, module_id, video_completed, text_completed, test_unlocked,
  attempts_count, last_score_percent, last_passed, updated_at
)
select
  p.id,
  m.id,
  false,
  false,
  false,
  0,
  null,
  null,
  '2026-03-06T09:00:00Z'::timestamptz
from profiles p
join modules m on m.is_archived = false
where p.role = 'EMPLOYEE'
  and p.id in (
    'usr_emp_1','usr_emp_2','usr_emp_3','usr_emp_4','usr_emp_5','usr_emp_6','usr_emp_7','usr_emp_8','usr_emp_9','usr_emp_10','usr_emp_11','usr_emp_12'
  );

with overrides (
  user_id, module_id, video_completed, text_completed, test_unlocked,
  attempts_count, last_score_percent, last_passed, updated_at
) as (
  values
    ('usr_emp_5', 'mod_phishing_core', true, true, true, 1, 95, true, '2026-03-06T11:00:00Z'::timestamptz),
    ('usr_emp_5', 'mod_url_core', true, true, true, 1, 92, true, '2026-03-06T12:00:00Z'::timestamptz),
    ('usr_emp_5', 'mod_social_core', true, true, true, 1, 90, true, '2026-03-06T13:00:00Z'::timestamptz),

    ('usr_emp_6', 'mod_phishing_core', true, true, true, 3, 84, true, '2026-03-06T14:00:00Z'::timestamptz),
    ('usr_emp_6', 'mod_url_core', true, true, true, 2, 81, true, '2026-03-06T15:00:00Z'::timestamptz),
    ('usr_emp_6', 'mod_social_core', true, true, true, 2, 74, false, '2026-03-06T16:00:00Z'::timestamptz),
    ('usr_emp_6', 'mini_phishing', true, true, true, 1, 88, true, '2026-03-06T17:00:00Z'::timestamptz),

    ('usr_emp_7', 'mod_phishing_core', true, true, true, 1, 68, false, '2026-03-06T18:00:00Z'::timestamptz),
    ('usr_emp_7', 'mod_url_core', false, true, false, 0, null, null, '2026-03-06T19:00:00Z'::timestamptz),
    ('usr_emp_7', 'mini_url', true, true, true, 2, 82, true, '2026-03-06T20:00:00Z'::timestamptz),

    ('usr_emp_8', 'mod_phishing_core', false, true, false, 0, null, null, '2026-03-06T21:00:00Z'::timestamptz),
    ('usr_emp_8', 'mod_social_core', true, true, true, 1, 86, true, '2026-03-06T22:00:00Z'::timestamptz),

    ('usr_emp_9', 'mod_phishing_core', true, false, true, 0, null, null, '2026-03-06T23:00:00Z'::timestamptz),
    ('usr_emp_9', 'mod_url_core', true, true, true, 1, 79, false, '2026-03-07T00:00:00Z'::timestamptz),
    ('usr_emp_9', 'mod_social_core', false, true, false, 0, null, null, '2026-03-07T01:00:00Z'::timestamptz),

    ('usr_emp_10', 'mod_phishing_core', true, true, true, 2, 89, true, '2026-03-07T02:00:00Z'::timestamptz),
    ('usr_emp_10', 'mod_url_core', true, true, true, 1, 91, true, '2026-03-07T03:00:00Z'::timestamptz),
    ('usr_emp_10', 'mod_social_core', true, true, true, 1, 88, true, '2026-03-07T04:00:00Z'::timestamptz),
    ('usr_emp_10', 'mini_social', true, true, true, 2, 85, true, '2026-03-07T05:00:00Z'::timestamptz),

    ('usr_emp_11', 'mod_phishing_core', true, true, true, 4, 62, false, '2026-01-15T09:00:00Z'::timestamptz)
)
update learning_progress lp
set
  video_completed = o.video_completed,
  text_completed = o.text_completed,
  test_unlocked = o.test_unlocked,
  attempts_count = o.attempts_count,
  last_score_percent = o.last_score_percent,
  last_passed = o.last_passed,
  updated_at = o.updated_at
from overrides o
where lp.user_id = o.user_id
  and lp.module_id = o.module_id;

insert into module_completions (
  user_id, module_id, score_percent, completed_at, is_archived, archived_at, updated_at
)
values
  ('usr_emp_5', 'mod_phishing_core', 95, '2026-03-06T11:00:00Z', false, null, '2026-03-06T11:00:00Z'),
  ('usr_emp_5', 'mod_url_core', 92, '2026-03-06T12:00:00Z', false, null, '2026-03-06T12:00:00Z'),
  ('usr_emp_5', 'mod_social_core', 90, '2026-03-06T13:00:00Z', false, null, '2026-03-06T13:00:00Z'),
  ('usr_emp_6', 'mod_phishing_core', 84, '2026-03-06T14:00:00Z', false, null, '2026-03-06T14:00:00Z'),
  ('usr_emp_6', 'mod_url_core', 81, '2026-03-06T15:00:00Z', false, null, '2026-03-06T15:00:00Z'),
  ('usr_emp_6', 'mini_phishing', 88, '2026-03-06T17:00:00Z', false, null, '2026-03-06T17:00:00Z'),
  ('usr_emp_7', 'mini_url', 82, '2026-03-06T20:00:00Z', false, null, '2026-03-06T20:00:00Z'),
  ('usr_emp_8', 'mod_social_core', 86, '2026-03-06T22:00:00Z', false, null, '2026-03-06T22:00:00Z'),
  ('usr_emp_10', 'mod_phishing_core', 89, '2026-03-07T02:00:00Z', false, null, '2026-03-07T02:00:00Z'),
  ('usr_emp_10', 'mod_url_core', 91, '2026-03-07T03:00:00Z', false, null, '2026-03-07T03:00:00Z'),
  ('usr_emp_10', 'mod_social_core', 88, '2026-03-07T04:00:00Z', false, null, '2026-03-07T04:00:00Z'),
  ('usr_emp_10', 'mini_social', 85, '2026-03-07T05:00:00Z', false, null, '2026-03-07T05:00:00Z'),
  ('usr_emp_11', 'mini_phishing', 72, '2026-01-15T09:00:00Z', true, '2026-02-01T08:00:00Z', '2026-02-01T08:00:00Z');

insert into phishing_campaigns (
  id, organization_id, department_id, name, template_id, subject, sender_name, content, status,
  sent_count, opened_count, clicked_count, reported_count, click_rate, report_rate,
  started_at, completed_at, created_at, is_archived, archived_at, updated_at
)
values
  (
    'phc_seed_sales_completed', 'org_secureaware_demo', 'dept_sales', 'Кампания Продажби Q1', 'tpl_courier_invoice',
    'Спешно: неплатена доставка', 'Куриер Поддръжка', 'Тестово съдържание за кампания Продажби.', 'COMPLETED',
    4, 3, 1, 1, 25, 25,
    '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', '2026-03-01T08:00:00Z', false, null, '2026-03-01T10:00:00Z'
  ),
  (
    'phc_seed_fin_completed', 'org_secureaware_demo', 'dept_finance', 'Кампания Финанси плащания', 'tpl_password_reset',
    'Неуспешен вход, потвърдете профила', 'IT Поддръжка', 'Тестово съдържание за кампания Финанси.', 'COMPLETED',
    3, 3, 1, 1, 33, 33,
    '2026-03-03T09:00:00Z', '2026-03-03T10:00:00Z', '2026-03-03T08:00:00Z', false, null, '2026-03-03T10:00:00Z'
  ),
  (
    'phc_seed_hr_sent', 'org_secureaware_demo', 'dept_hr', 'Кампания HR политика бонуси', 'tpl_bonus_update',
    'Актуализация на бонус политика', 'HR Екип', 'Тестово съдържание за кампания HR.', 'SENT',
    3, 3, 1, 1, 33, 33,
    '2026-03-06T09:00:00Z', null, '2026-03-06T08:00:00Z', false, null, '2026-03-06T09:00:00Z'
  ),
  (
    'phc_seed_sales_draft', 'org_secureaware_demo', 'dept_sales', 'Кампания Продажби април', 'tpl_courier_invoice',
    'Спешно: неплатена доставка', 'Куриер Поддръжка', 'Чернова за следваща кампания.', 'DRAFT',
    0, 0, 0, 0, 0, 0,
    null, null, '2026-03-08T09:00:00Z', false, null, '2026-03-08T09:00:00Z'
  ),
  (
    'phc_seed_hr_archived', 'org_secureaware_demo', 'dept_hr', 'Кампания HR архив', 'tpl_bonus_update',
    'Актуализация на бонус политика', 'HR Екип', 'Архивирана демо кампания.', 'ARCHIVED',
    3, 2, 1, 0, 33, 0,
    '2026-01-15T09:00:00Z', '2026-01-15T10:00:00Z', '2026-01-15T08:00:00Z', true, '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'
  );

insert into phishing_campaign_events (
  id, campaign_id, organization_id, user_id, department_id, action, created_at, is_archived, archived_at, updated_at
)
values
  ('pce_seed_1_1', 'phc_seed_sales_completed', 'org_secureaware_demo', 'usr_emp_1', 'dept_sales', 'REPORTED', '2026-03-01T09:00:00Z', false, null, '2026-03-01T10:00:00Z'),
  ('pce_seed_1_2', 'phc_seed_sales_completed', 'org_secureaware_demo', 'usr_emp_2', 'dept_sales', 'OPENED', '2026-03-01T09:06:00Z', false, null, '2026-03-01T10:00:00Z'),
  ('pce_seed_1_3', 'phc_seed_sales_completed', 'org_secureaware_demo', 'usr_emp_3', 'dept_sales', 'CLICKED', '2026-03-01T09:12:00Z', false, null, '2026-03-01T10:00:00Z'),
  ('pce_seed_1_4', 'phc_seed_sales_completed', 'org_secureaware_demo', 'usr_emp_4', 'dept_sales', 'IGNORED', '2026-03-01T09:18:00Z', false, null, '2026-03-01T10:00:00Z'),

  ('pce_seed_2_1', 'phc_seed_fin_completed', 'org_secureaware_demo', 'usr_emp_5', 'dept_finance', 'REPORTED', '2026-03-03T09:00:00Z', false, null, '2026-03-03T10:00:00Z'),
  ('pce_seed_2_2', 'phc_seed_fin_completed', 'org_secureaware_demo', 'usr_emp_6', 'dept_finance', 'OPENED', '2026-03-03T09:06:00Z', false, null, '2026-03-03T10:00:00Z'),
  ('pce_seed_2_3', 'phc_seed_fin_completed', 'org_secureaware_demo', 'usr_emp_7', 'dept_finance', 'CLICKED', '2026-03-03T09:12:00Z', false, null, '2026-03-03T10:00:00Z'),

  ('pce_seed_3_1', 'phc_seed_hr_sent', 'org_secureaware_demo', 'usr_emp_8', 'dept_hr', 'OPENED', '2026-03-06T09:00:00Z', false, null, '2026-03-06T09:00:00Z'),
  ('pce_seed_3_2', 'phc_seed_hr_sent', 'org_secureaware_demo', 'usr_emp_9', 'dept_hr', 'REPORTED', '2026-03-06T09:06:00Z', false, null, '2026-03-06T09:00:00Z'),
  ('pce_seed_3_3', 'phc_seed_hr_sent', 'org_secureaware_demo', 'usr_emp_10', 'dept_hr', 'CLICKED', '2026-03-06T09:12:00Z', false, null, '2026-03-06T09:00:00Z'),

  ('pce_seed_5_1', 'phc_seed_hr_archived', 'org_secureaware_demo', 'usr_emp_8', 'dept_hr', 'OPENED', '2026-01-15T09:00:00Z', true, '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('pce_seed_5_2', 'phc_seed_hr_archived', 'org_secureaware_demo', 'usr_emp_9', 'dept_hr', 'CLICKED', '2026-01-15T09:06:00Z', true, '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ('pce_seed_5_3', 'phc_seed_hr_archived', 'org_secureaware_demo', 'usr_emp_10', 'dept_hr', 'IGNORED', '2026-01-15T09:12:00Z', true, '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z');

insert into attempts (
  id, organization_id, user_id, scenario_id, selected_option_id, response_time_ms, is_correct,
  knowledge_score, reaction_risk_score, behavioral_risk, created_at, is_archived, archived_at, updated_at
)
values
  ('att_seed_1', 'org_secureaware_demo', 'usr_emp_1', 'scn_seed_ph', 'opt_seed_ph_c', 9000, true, 92, 18, 'SECURE', '2026-03-04T08:00:00Z', true, '2026-02-03T10:00:00Z', '2026-02-03T10:00:00Z'),
  ('att_seed_2', 'org_secureaware_demo', 'usr_emp_2', 'scn_seed_ph', 'opt_seed_ph_b', 11000, true, 88, 25, 'SECURE', '2026-03-04T09:00:00Z', false, null, '2026-03-04T09:00:00Z'),
  ('att_seed_3', 'org_secureaware_demo', 'usr_emp_3', 'scn_seed_ph', 'opt_seed_ph_a', 32000, false, 15, 85, 'HIGH', '2026-03-04T10:00:00Z', false, null, '2026-03-04T10:00:00Z'),
  ('att_seed_4', 'org_secureaware_demo', 'usr_emp_4', 'scn_seed_url', 'opt_seed_url_b', 13000, true, 86, 30, 'SECURE', '2026-03-04T11:00:00Z', false, null, '2026-03-04T11:00:00Z'),
  ('att_seed_5', 'org_secureaware_demo', 'usr_emp_5', 'scn_seed_url', 'opt_seed_url_a', 27000, false, 24, 72, 'HIGH', '2026-03-04T12:00:00Z', false, null, '2026-03-04T12:00:00Z'),
  ('att_seed_6', 'org_secureaware_demo', 'usr_emp_6', 'scn_seed_soc', 'opt_seed_soc_b', 9000, true, 90, 20, 'SECURE', '2026-03-04T13:00:00Z', false, null, '2026-03-04T13:00:00Z'),
  ('att_seed_7', 'org_secureaware_demo', 'usr_emp_7', 'scn_seed_soc', 'opt_seed_soc_a', 24000, false, 18, 78, 'HIGH', '2026-03-04T14:00:00Z', false, null, '2026-03-04T14:00:00Z');

insert into risk_events (
  id, organization_id, user_id, scenario_id, type, severity, created_at, is_archived, archived_at, updated_at
)
values
  ('evt_seed_1', 'org_secureaware_demo', 'usr_emp_3', 'scn_seed_ph', 'WRONG_ACTION', 'HIGH', '2026-03-04T10:00:00Z', true, '2026-02-03T10:00:00Z', '2026-02-03T10:00:00Z'),
  ('evt_seed_2', 'org_secureaware_demo', 'usr_emp_5', 'scn_seed_url', 'WRONG_ACTION', 'MEDIUM', '2026-03-04T12:00:00Z', false, null, '2026-03-04T12:00:00Z'),
  ('evt_seed_3', 'org_secureaware_demo', 'usr_emp_7', 'scn_seed_soc', 'WRONG_ACTION', 'CRITICAL', '2026-03-04T14:00:00Z', false, null, '2026-03-04T14:00:00Z');

insert into assignments (
  id, organization_id, user_id, module_id, reason, status, due_at, retest_at, created_at, is_archived, archived_at, updated_at
)
values
  ('asg_seed_1', 'org_secureaware_demo', 'usr_emp_3', 'mini_phishing', 'Автоматично follow-up обучение след грешка във фишинг.', 'PENDING', '2026-03-11T10:00:00Z', '2026-03-18T10:00:00Z', '2026-03-04T10:00:00Z', true, '2026-02-03T10:00:00Z', '2026-02-03T10:00:00Z'),
  ('asg_seed_2', 'org_secureaware_demo', 'usr_emp_5', 'mini_url', 'Автоматично follow-up обучение след URL риск.', 'PENDING', '2026-03-11T12:00:00Z', '2026-03-18T12:00:00Z', '2026-03-04T12:00:00Z', false, null, '2026-03-04T12:00:00Z'),
  ('asg_seed_3', 'org_secureaware_demo', 'usr_emp_7', 'mini_social', 'Автоматично follow-up обучение след social engineering риск.', 'PENDING', '2026-03-11T14:00:00Z', '2026-03-18T14:00:00Z', '2026-03-04T14:00:00Z', false, null, '2026-03-04T14:00:00Z');

commit;
