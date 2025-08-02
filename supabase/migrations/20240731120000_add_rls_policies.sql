
create policy "Allow full access to own salon clients" on public.clients for all
  using (
    exists (
      select 1
      from salons
      where
        salons.id = clients.salon_id and salons.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from salons
      where
        salons.id = clients.salon_id and salons.user_id = auth.uid()
    )
  );

create policy "Allow full access to own salon pets" on public.pets for all
  using (
    exists (
      select 1
      from salons
      where
        salons.id = pets.salon_id and salons.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from salons
      where
        salons.id = pets.salon_id and salons.user_id = auth.uid()
    )
  );

create policy "Allow full access to own client pets" on public.client_pets for all
  using (
    exists (
      select 1
      from clients
      where
        clients.id = client_pets.client_id
    )
  )
  with check (
    exists (
      select 1
      from clients
      where
        clients.id = client_pets.client_id
    )
  ); 