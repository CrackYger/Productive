-- v0.1 — Aufgaben mit Einheiten, Tageszeit, Lese-Verknüpfung; Bücher mit Cover-Bild

alter table public.productive_tasks
  add column if not exists unit text not null default 'none'
    check (unit in ('none', 'pages', 'minutes', 'count')),
  add column if not exists target_amount integer
    check (target_amount is null or target_amount > 0),
  add column if not exists progress_amount integer not null default 0
    check (progress_amount >= 0),
  add column if not exists time_of_day text not null default 'any'
    check (time_of_day in ('any', 'morning', 'midday', 'evening')),
  add column if not exists category text not null default 'other'
    check (category in ('school', 'sport', 'personal', 'work', 'reading', 'other')),
  add column if not exists book_id uuid references public.productive_books(id) on delete set null;

create index if not exists productive_tasks_user_time_of_day_idx
  on public.productive_tasks (user_id, time_of_day);

alter table public.productive_books
  add column if not exists cover_url text;
