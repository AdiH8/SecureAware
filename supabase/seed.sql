insert into organizations (id, name)
values ('org_secureaware_demo', 'SecureAware Демо организация')
on conflict (id) do nothing;

insert into departments (id, organization_id, name)
values
  ('dept_sales', 'org_secureaware_demo', 'Продажби'),
  ('dept_finance', 'org_secureaware_demo', 'Финанси'),
  ('dept_hr', 'org_secureaware_demo', 'Човешки ресурси')
on conflict (id) do nothing;

insert into profiles (id, organization_id, department_id, name, email, role, is_archived, archived_at, updated_at)
values
  ('usr_admin_1', 'org_secureaware_demo', 'dept_hr', 'Админ Демо', 'admin@secureaware.demo', 'ADMIN', false, null, now()),
  ('usr_mgr_sales', 'org_secureaware_demo', 'dept_sales', 'Мария Иванова', 'm.ivanova@secureaware.demo', 'MANAGER', false, null, now()),
  ('usr_mgr_fin', 'org_secureaware_demo', 'dept_finance', 'Петър Георгиев', 'p.georgiev@secureaware.demo', 'MANAGER', false, null, now()),
  ('usr_mgr_hr', 'org_secureaware_demo', 'dept_hr', 'Елица Тодорова', 'e.todorova@secureaware.demo', 'MANAGER', false, null, now()),
  ('usr_emp_1', 'org_secureaware_demo', 'dept_sales', 'Иво Петров', 'ivo.petrov@secureaware.demo', 'EMPLOYEE', false, null, now())
on conflict (id) do nothing;

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
    '[
      "Този модул изгражда конкретна рутина за реакция при съмнителни имейли. Вместо да действаш импулсивно, първо проверяваш контекста, очакваността на заявката и връзката с текущите ти задачи. Когато заявката не съвпада с обичайния процес, я третираш като риск и преминаваш към вътрешната процедура за верификация, без да отваряш файлове и без да натискаш линкове.",
      "Първата техническа проверка е подателят и домейнът. Сравняваш внимателно адреса, езика, формата на подписа и как е формулирана спешността. Ако има натиск за незабавно действие, искане за плащане или събиране на достъп, това е ясен сигнал за повишено внимание. Решението трябва да се вземе след проверка през независим канал, а не чрез директен отговор на съмнителното съобщение.",
      "Втората проверка е по съдържание и структура. Разглеждаш прикачени файлове, наименования, скрити линкове и нетипични инструкции. Комбинация от необичаен тон, несъответстващ контекст и приканване към бързо действие увеличава вероятността за фишинг. При наличие на няколко индикатора не експериментираш самостоятелно, а ескалираш към IT/Сигурност по официалния канал.",
      "Правилната реакция включва ограничаване на риска за целия екип. Не препращаш имейла към колеги, не отваряш файловете локално и не тестваш линкове в личен браузър. Вместо това докладваш случая с достатъчно детайли, за да може екипът по сигурност да анализира инцидента. По този начин се намалява шансът същата атака да достигне и други отдели в организацията.",
      "След ескалацията е важно да документираш какво си видял и как си реагирал. Кратка и ясна информация за подателя, темата, вида на прикачения файл и конкретния риск помага за по-бърза оценка и обратна връзка. Това превръща всяка ситуация в учебен момент и подпомага изграждането на устойчива култура на киберсигурност в ежедневната работа.",
      "Финалната цел на модула е стабилно поведение под напрежение. Когато сроковете са кратки и комуникацията е интензивна, запазваш последователност: проверка, верификация, ескалация и документиране. Така защитата не зависи от случайност, а от повторяем процес, който ограничава човешките грешки и намалява риска от реален инцидент."
    ]'::jsonb,
    '["tq_ph_1"]'::jsonb,
    false,
    null,
    now()
  ),
  (
    'mini_phishing',
    'Мини модул: Безопасни действия при имейл',
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
    '[
      "Мини модулът затвърждава безопасната последователност след допусната грешка. Фокусът е върху бързо разпознаване на сигналите за риск и изпълнение на стандартната процедура без излишни отклонения. Целта е служителят да може да реагира правилно дори при натиск, спешни задачи и противоречива информация от външни източници.",
      "Първото правило е да се направи кратка проверка на подателя и контекста преди всяко действие. Ако искането е неочаквано или извън нормалния работен поток, съобщението не се обработва директно. Вместо това се инициира проверка през официален вътрешен канал, който е независим от съдържанието на самия имейл.",
      "Второто правило е да не се отварят прикачени файлове и линкове преди потвърждение. Дори когато текстът изглежда убедителен, имитациите често използват визуално познати елементи, за да ускорят грешно решение. Контролираното забавяне и дисциплината в процеса са ключови за намаляване на риска от компрометиране.",
      "Третото правило е своевременно докладване с ясни факти. Когато сигнализираш IT/Сигурност за съмнителен имейл, подпомагаш ранното откриване на кампания и защитаваш колегите си. Една навременна реакция може да предотврати масово разпространение на същата атака в различни екипи.",
      "Мини обучението подчертава, че правилната реакция е повторяем навик, а не еднократно действие. Чрез кратки контролни проверки и ясни стъпки служителят изгражда увереност какво да прави при следващ подобен случай. Това намалява зависимостта от интуиция и повишава предвидимостта на поведението.",
      "След финализиране на мини модула следва ретест по план, за да се измери реална промяна в поведението. Ако резултатът е стабилен, рискът намалява и модулът се счита за успешно затвърден. Ако има нови грешки, системата възлага допълнително повторение с конкретни препоръки за подобрение."
    ]'::jsonb,
    '[]'::jsonb,
    false,
    null,
    now()
  )
on conflict (id) do nothing;

insert into test_questions (id, module_id, kind, order_index, prompt, image_url, explanation, is_archived, archived_at, updated_at)
values
  (
    'tq_ph_1',
    'mod_phishing_core',
    'TEXT',
    1,
    'Получаваш имейл за неплатена доставка с прикачен invoice.pdf. Какво правиш първо?',
    null,
    'Първо провери подателя и докладвай, без да отваряш файла.',
    false,
    null,
    now()
  )
on conflict (id) do nothing;

insert into test_options (id, question_id, label, text, is_correct, is_archived, archived_at, updated_at)
values
  ('to_ph_1_a', 'tq_ph_1', 'A', 'Отварям файла веднага', false, false, null, now()),
  ('to_ph_1_b', 'tq_ph_1', 'B', 'Проверявам подателя', true, false, null, now()),
  ('to_ph_1_c', 'tq_ph_1', 'C', 'Препращам на колега', false, false, null, now()),
  ('to_ph_1_d', 'tq_ph_1', 'D', 'Игнорирам', false, false, null, now())
on conflict (id) do nothing;

insert into scenarios (id, module_id, category, severity, title, prompt, time_limit_sec, is_archived, archived_at, updated_at)
values
  (
    'scn_phishing_invoice',
    'mod_phishing_core',
    'PHISHING',
    'HIGH',
    'Куриерска фактура',
    'Имейл със спешна фактура и прикачен файл.',
    20,
    false,
    null,
    now()
  )
on conflict (id) do nothing;

insert into scenario_options (
  id, scenario_id, label, text, is_correct, weight, action_type, explanation,
  is_archived, archived_at, updated_at
)
values
  ('opt_ph_a', 'scn_phishing_invoice', 'A', 'Отварям файла', false, 1, 'OPEN_ATTACHMENT', 'Рисково действие.', false, null, now()),
  ('opt_ph_b', 'scn_phishing_invoice', 'B', 'Проверявам подателя', true, 4, 'VERIFY_SENDER', 'Коректна първа стъпка.', false, null, now()),
  ('opt_ph_c', 'scn_phishing_invoice', 'C', 'Препращам на колега', false, 2, 'FORWARD_EMAIL', 'Разпространява риска.', false, null, now()),
  ('opt_ph_d', 'scn_phishing_invoice', 'D', 'Докладвам към IT', true, 5, 'REPORT_TO_IT', 'Най-добра реакция.', false, null, now())
on conflict (id) do nothing;

insert into assignment_rules (
  id, category, trigger, module_id, due_in_days, retest_in_days, is_archived, archived_at, updated_at
)
values
  ('rule_ph_wrong', 'PHISHING', 'WRONG_ANSWER', 'mini_phishing', 7, 14, false, null, now())
on conflict (id) do nothing;

