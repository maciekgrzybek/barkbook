-- migration: 20240730120500_create_clients_and_dogs_tables.sql
-- purpose: Create the clients and dogs tables.
-- author: Gemini

-- create the clients table
create table if not exists public.clients (
    id uuid not null primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name text not null,
    phone text not null,
    email text,
    address text,
    salon_id uuid not null references public.salons(id) on delete cascade,
    consent_given boolean not null default false,
    consent_date timestamptz
);

comment on column public.clients.salon_id is 'The salon this client belongs to.';
comment on column public.clients.consent_given is 'If the client has given consent for data processing.';
comment on column public.clients.consent_date is 'The date the consent was given.';

alter table public.clients enable row level security;

-- create the dogs table
create table if not exists public.dogs (
    id uuid not null primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name text not null,
    breed text,
    age int,
    health_issues text,
    allergies text,
    preferences text,
    notes text,
    client_id uuid not null references public.clients(id) on delete cascade
);

comment on column public.dogs.client_id is 'The client that owns this dog.';

alter table public.dogs enable row level security;

-- RLS for clients
create policy "Users can manage clients of their own salon"
on public.clients for all
to authenticated
using (
  exists (
    select 1 from public.salons
    where salons.id = clients.salon_id and salons.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.salons
    where salons.id = clients.salon_id and salons.user_id = auth.uid()
  )
);

-- RLS for dogs
create policy "Users can manage dogs of clients in their own salon"
on public.dogs for all
to authenticated
using (
  exists (
    select 1 from public.clients
    join public.salons on clients.salon_id = salons.id
    where clients.id = dogs.client_id and salons.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.clients
    join public.salons on clients.salon_id = salons.id
    where clients.id = dogs.client_id and salons.user_id = auth.uid()
  )
); 