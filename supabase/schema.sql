create table if not exists organizations (
  id text primary key,
  name text not null
);

create table if not exists departments (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null
);

create table if not exists profiles (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  department_id text not null references departments(id),
  name text not null,
  email text not null unique,
  role text not null check (role in ('EMPLOYEE', 'MANAGER', 'ADMIN')),
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists modules (
  id text primary key,
  title text not null,
  category text not null,
  is_mini boolean not null default false,
  order_index int not null default 1,
  duration_minutes int not null,
  video_duration_sec int not null default 300,
  video_mock_file_name text,
  video_mock_file_size_mb numeric,
  question_count int not null default 10,
  pass_threshold_percent int not null default 80,
  description text not null,
  bullet_points jsonb not null default '[]'::jsonb,
  text_sections jsonb not null default '[]'::jsonb,
  test_question_ids jsonb not null default '[]'::jsonb,
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists scenarios (
  id text primary key,
  module_id text not null references modules(id) on delete cascade,
  category text not null,
  severity text not null,
  title text not null,
  prompt text not null,
  time_limit_sec int not null,
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists scenario_options (
  id text primary key,
  scenario_id text not null references scenarios(id) on delete cascade,
  label text not null,
  text text not null,
  is_correct boolean not null,
  weight int not null,
  action_type text not null,
  explanation text not null,
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists test_questions (
  id text primary key,
  module_id text not null references modules(id) on delete cascade,
  kind text not null check (kind in ('TEXT', 'IMAGE')),
  order_index int not null,
  prompt text not null,
  image_url text,
  explanation text not null,
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists test_options (
  id text primary key,
  question_id text not null references test_questions(id) on delete cascade,
  label text not null,
  text text not null,
  is_correct boolean not null,
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists attempts (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  scenario_id text not null references scenarios(id) on delete cascade,
  selected_option_id text references scenario_options(id),
  response_time_ms int not null,
  is_correct boolean not null,
  knowledge_score int not null,
  reaction_risk_score int not null,
  behavioral_risk text not null check (behavioral_risk in ('HIGH', 'MEDIUM', 'SECURE')),
  created_at timestamptz not null default now(),
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists risk_events (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  scenario_id text not null references scenarios(id) on delete cascade,
  type text not null,
  severity text not null,
  created_at timestamptz not null default now(),
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists assignments (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  module_id text not null references modules(id) on delete cascade,
  reason text not null,
  status text not null check (status in ('PENDING', 'COMPLETED')),
  due_at timestamptz not null,
  retest_at timestamptz,
  created_at timestamptz not null default now(),
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists assignment_rules (
  id text primary key,
  category text not null,
  trigger text not null check (trigger in ('WRONG_ANSWER', 'HIGH_REACTION_RISK')),
  module_id text not null references modules(id) on delete cascade,
  due_in_days int not null,
  retest_in_days int not null,
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists phishing_campaigns (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  department_id text not null references departments(id),
  name text not null,
  template_id text not null,
  subject text not null,
  sender_name text not null,
  content text not null,
  status text not null check (status in ('DRAFT', 'QUEUED', 'SENT', 'COMPLETED', 'ARCHIVED')),
  sent_count int not null default 0,
  opened_count int not null default 0,
  clicked_count int not null default 0,
  reported_count int not null default 0,
  click_rate int not null default 0,
  report_rate int not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  is_archived boolean not null default false,
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

