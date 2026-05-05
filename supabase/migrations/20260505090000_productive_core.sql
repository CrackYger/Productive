create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.productive_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.productive_settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  daily_pages_goal integer not null default 12 check (daily_pages_goal between 1 and 250),
  yearly_book_goal integer not null default 12 check (yearly_book_goal between 1 and 250),
  notifications_enabled boolean not null default false,
  compact_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.productive_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 160),
  description text,
  priority text not null default 'mittel' check (priority in ('hoch', 'mittel', 'niedrig')),
  done boolean not null default false,
  due_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.productive_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 180),
  author text not null default 'Unbekannt',
  pages integer not null check (pages > 0 and pages <= 20000),
  current_page integer not null default 0 check (current_page >= 0),
  color text not null default '#00C2C2' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint productive_books_current_page_bounds check (current_page <= pages)
);

create table if not exists public.productive_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 80),
  grade numeric(2,1) not null check (grade >= 1.0 and grade <= 6.0),
  next_event text not null default '',
  color text not null default '#00C2C2' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  done integer not null default 0 check (done >= 0),
  total integer not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint productive_subjects_progress_bounds check (done <= total),
  constraint productive_subjects_user_name_unique unique (user_id, name)
);

create table if not exists public.productive_activity_days (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  activity_date date not null default current_date,
  created_at timestamptz not null default now(),
  primary key (user_id, activity_date)
);

create table if not exists public.productive_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  message text not null check (char_length(message) between 3 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists productive_tasks_user_due_idx on public.productive_tasks (user_id, due_date, created_at);
create index if not exists productive_books_user_created_idx on public.productive_books (user_id, created_at);
create index if not exists productive_subjects_user_created_idx on public.productive_subjects (user_id, created_at);
create index if not exists productive_activity_user_date_idx on public.productive_activity_days (user_id, activity_date desc);
create index if not exists productive_feedback_user_created_idx on public.productive_feedback (user_id, created_at desc);

drop trigger if exists productive_profiles_updated_at on public.productive_profiles;
create trigger productive_profiles_updated_at
before update on public.productive_profiles
for each row execute function public.set_updated_at();

drop trigger if exists productive_settings_updated_at on public.productive_settings;
create trigger productive_settings_updated_at
before update on public.productive_settings
for each row execute function public.set_updated_at();

drop trigger if exists productive_tasks_updated_at on public.productive_tasks;
create trigger productive_tasks_updated_at
before update on public.productive_tasks
for each row execute function public.set_updated_at();

drop trigger if exists productive_books_updated_at on public.productive_books;
create trigger productive_books_updated_at
before update on public.productive_books
for each row execute function public.set_updated_at();

drop trigger if exists productive_subjects_updated_at on public.productive_subjects;
create trigger productive_subjects_updated_at
before update on public.productive_subjects
for each row execute function public.set_updated_at();

alter table public.productive_profiles enable row level security;
alter table public.productive_settings enable row level security;
alter table public.productive_tasks enable row level security;
alter table public.productive_books enable row level security;
alter table public.productive_subjects enable row level security;
alter table public.productive_activity_days enable row level security;
alter table public.productive_feedback enable row level security;

create policy "profiles_select_own" on public.productive_profiles
for select using (id = auth.uid());
create policy "profiles_insert_own" on public.productive_profiles
for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.productive_profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "settings_select_own" on public.productive_settings
for select using (user_id = auth.uid());
create policy "settings_insert_own" on public.productive_settings
for insert with check (user_id = auth.uid());
create policy "settings_update_own" on public.productive_settings
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tasks_select_own" on public.productive_tasks
for select using (user_id = auth.uid());
create policy "tasks_insert_own" on public.productive_tasks
for insert with check (user_id = auth.uid());
create policy "tasks_update_own" on public.productive_tasks
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks_delete_own" on public.productive_tasks
for delete using (user_id = auth.uid());

create policy "books_select_own" on public.productive_books
for select using (user_id = auth.uid());
create policy "books_insert_own" on public.productive_books
for insert with check (user_id = auth.uid());
create policy "books_update_own" on public.productive_books
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "books_delete_own" on public.productive_books
for delete using (user_id = auth.uid());

create policy "subjects_select_own" on public.productive_subjects
for select using (user_id = auth.uid());
create policy "subjects_insert_own" on public.productive_subjects
for insert with check (user_id = auth.uid());
create policy "subjects_update_own" on public.productive_subjects
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "subjects_delete_own" on public.productive_subjects
for delete using (user_id = auth.uid());

create policy "activity_select_own" on public.productive_activity_days
for select using (user_id = auth.uid());
create policy "activity_insert_own" on public.productive_activity_days
for insert with check (user_id = auth.uid());
create policy "activity_delete_own" on public.productive_activity_days
for delete using (user_id = auth.uid());

create policy "feedback_select_own" on public.productive_feedback
for select using (user_id = auth.uid());
create policy "feedback_insert_own" on public.productive_feedback
for insert with check (user_id = auth.uid());
