-- migration: 20240730120000_create_salons_table.sql
-- purpose: Create the salons table to store information about grooming salons.
-- author: Gemini

-- create the salons table
create table if not exists public.salons (
    id uuid not null primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name text not null,
    owner_id uuid not null references auth.users(id) on delete cascade
);

-- add comments to the columns
comment on column public.salons.id is 'Unique identifier for the salon.';
comment on column public.salons.created_at is 'Timestamp of when the salon was created.';
comment on column public.salons.name is 'Name of the grooming salon.';
comment on column public.salons.owner_id is 'Foreign key to the user who owns the salon.';

-- enable row level security for the salons table
alter table public.salons enable row level security;

-- create policy for authenticated users to insert their own salon
create policy "Allow authenticated users to insert their own salon"
on public.salons for insert
to authenticated
with check (auth.uid() = owner_id);

-- create policy for users to view their own salon
create policy "Allow authenticated users to view their own salon"
on public.salons for select
to authenticated
using (auth.uid() = owner_id);

-- create policy for users to update their own salon
create policy "Allow authenticated users to update their own salon"
on public.salons for update
to authenticated
using (auth.uid() = owner_id);

-- create policy for users to delete their own salon
create policy "Allow authenticated users to delete their own salon"
on public.salons for delete
to authenticated
using (auth.uid() = owner_id); 