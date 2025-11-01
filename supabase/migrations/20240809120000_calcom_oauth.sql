-- Cal.com OAuth and Calendar schema additions

-- Users metadata additions if needed (skip direct auth.users column updates in Supabase managed schema)

-- Tokens table
create table if not exists public.cal_com_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  token_type text default 'Bearer',
  expires_at timestamptz,
  scope text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.cal_com_tokens enable row level security;

drop policy if exists "Users can manage their own tokens" on public.cal_com_tokens;
create policy "Users can manage their own tokens"
on public.cal_com_tokens
for all
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- Calendar events mirror table (minimal for now)
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  cal_com_event_id text not null unique,
  salon_id uuid references public.salons(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  pet_id uuid references public.pets(id) on delete set null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration_minutes integer,
  status text default 'scheduled',
  attendee_email text,
  attendee_phone text,
  location text,
  meeting_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  synced_at timestamptz default now()
);

alter table public.calendar_events enable row level security;

drop policy if exists "Salon owners can manage calendar events" on public.calendar_events;
create policy "Salon owners can manage calendar events"
on public.calendar_events
for all
using (
  salon_id in (
    select id from public.salons where user_id = auth.uid()
  )
)
with check (
  salon_id in (
    select id from public.salons where user_id = auth.uid()
  )
);

-- Webhook logs
create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references public.salons(id),
  webhook_type text not null,
  payload jsonb not null,
  status text not null default 'pending',
  error_message text,
  processed_at timestamptz default now(),
  cal_com_event_id text
);

alter table public.webhook_logs enable row level security;

drop policy if exists "Salon owners can see their webhook logs" on public.webhook_logs;
create policy "Salon owners can see their webhook logs"
on public.webhook_logs
for select
using (
  salon_id in (
    select id from public.salons where user_id = auth.uid()
  ) or salon_id is null
);


