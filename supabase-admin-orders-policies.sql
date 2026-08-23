-- Admin-only access to order data.
-- Run once in Supabase SQL Editor. The DROP statements make this safe to re-run.

drop policy if exists "Admins can view orders" on public.orders;
create policy "Admins can view orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admins can view order items" on public.order_items;
create policy "Admins can view order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);
