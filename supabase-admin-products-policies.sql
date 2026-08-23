-- ============================================================================
-- Admin-only write access to products / product_variants
-- ============================================================================
-- Problem: unlike `orders`, `customers`, and storage (all covered by earlier
-- migrations), there is no migration file in this repo that grants or
-- restricts write access to `products` / `product_variants`. The admin
-- panel already creates/edits/deletes products successfully in local
-- testing, which means one of two things is currently true in Supabase:
--
--   (a) RLS is enabled on these tables with a working policy set that was
--       configured directly in the Supabase dashboard and never exported
--       to a migration file, or
--   (b) RLS is disabled entirely (or has an open policy), which would also
--       let a signed-out visitor insert/update/delete products directly —
--       the same class of gap that was found and fixed on `customers`.
--
-- This migration does not assume which case you're in. It only ADDS:
--   - an explicit public SELECT policy (so the storefront's anon read
--     keeps working no matter what, even once RLS is confirmed on), and
--   - admin-only (`admin_users`) INSERT/UPDATE/DELETE policies.
--
-- Because Postgres RLS policies are permissive (OR'd together), this alone
-- cannot break anything that currently works, and it cannot silently
-- re-open anything either — but if case (a) already has an existing
-- anon/public INSERT/UPDATE/DELETE policy on either table, that old policy
-- would still allow writes alongside the new admin-only one. Run STEP 1
-- below first and check.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1 — see what's actually on these tables right now before changing
-- anything (also tells you whether RLS is even enabled):
-- ----------------------------------------------------------------------------
--   select relname, relrowsecurity
--   from pg_class
--   where relname in ('products', 'product_variants');
--
--   select policyname, tablename, cmd, roles, qual, with_check
--   from pg_policies
--   where schemaname = 'public' and tablename in ('products', 'product_variants')
--   order by tablename, cmd;
--
-- If STEP 1 shows an existing anon/public INSERT, UPDATE, or DELETE policy
-- on either table, drop it by its exact name after confirming the admin
-- panel still works with the policies below in place:
--
--   drop policy "<paste exact policyname>" on public.products;
--   drop policy "<paste exact policyname>" on public.product_variants;
--
-- ----------------------------------------------------------------------------
-- STEP 2 — safe to run now:
-- ----------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.product_variants enable row level security;

-- Public read — required for the storefront catalog (anon, no session).
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Public can view product variants" on public.product_variants;
create policy "Public can view product variants"
on public.product_variants
for select
to anon, authenticated
using (true);

-- Admin-only writes.
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products
for update
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products
for delete
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "Admins can insert product variants" on public.product_variants;
create policy "Admins can insert product variants"
on public.product_variants
for insert
to authenticated
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "Admins can update product variants" on public.product_variants;
create policy "Admins can update product variants"
on public.product_variants
for update
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "Admins can delete product variants" on public.product_variants;
create policy "Admins can delete product variants"
on public.product_variants
for delete
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

-- Note: `create_order_secure()` (see supabase-secure-checkout-rpc.sql) is
-- SECURITY DEFINER and decrements `product_variants.stock_quantity` itself
-- regardless of the caller's table-level grants, so checkout is unaffected
-- by any of the above.
