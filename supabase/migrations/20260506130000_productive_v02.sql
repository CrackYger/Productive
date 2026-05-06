-- V0.2 — Aufgaben: Übersprungen, Wiederholung; Schule: Hausaufgaben, Noten, Fehlstunden

alter table public.productive_tasks
  add column if not exists skipped boolean not null default false,
  add column if not exists recurrence text not null default 'none'
    check (recurrence in ('none', 'daily', 'weekly', 'weekdays')),
  add column if not exists recurrence_days int[] not null default '{}',
  add column if not exists last_completed_date date;

create table if not exists public.productive_homework (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  subject_id uuid not null references public.productive_subjects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.productive_grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  subject_id uuid not null references public.productive_subjects(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 100),
  grade numeric(2,1) not null check (grade >= 1.0 and grade <= 6.0),
  type text not null default 'exam' check (type in ('exam', 'quarterly')),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.productive_absences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  subject_id uuid not null references public.productive_subjects(id) on delete cascade,
  date date not null default current_date,
  hours integer not null check (hours >= 1 and hours <= 20),
  excused boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists productive_homework_subject_idx
  on public.productive_homework (subject_id, created_at);
create index if not exists productive_grades_subject_idx
  on public.productive_grades (subject_id, date desc);
create index if not exists productive_absences_subject_idx
  on public.productive_absences (subject_id, date desc);

drop trigger if exists productive_homework_updated_at on public.productive_homework;
create trigger productive_homework_updated_at
before update on public.productive_homework
for each row execute function public.set_updated_at();

alter table public.productive_homework enable row level security;
alter table public.productive_grades enable row level security;
alter table public.productive_absences enable row level security;

create policy "homework_select_own"  on public.productive_homework for select  using (user_id = auth.uid());
create policy "homework_insert_own"  on public.productive_homework for insert  with check (user_id = auth.uid());
create policy "homework_update_own"  on public.productive_homework for update  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "homework_delete_own"  on public.productive_homework for delete  using (user_id = auth.uid());

create policy "grades_select_own"    on public.productive_grades   for select  using (user_id = auth.uid());
create policy "grades_insert_own"    on public.productive_grades   for insert  with check (user_id = auth.uid());
create policy "grades_delete_own"    on public.productive_grades   for delete  using (user_id = auth.uid());

create policy "absences_select_own"  on public.productive_absences for select  using (user_id = auth.uid());
create policy "absences_insert_own"  on public.productive_absences for insert  with check (user_id = auth.uid());
create policy "absences_update_own"  on public.productive_absences for update  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "absences_delete_own"  on public.productive_absences for delete  using (user_id = auth.uid());
