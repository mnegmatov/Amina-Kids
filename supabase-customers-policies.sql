-- ============================================================================
-- FIX #2 — customers table exposed to anon
-- ============================================================================
-- Problem: the old checkout flow read/wrote `customers` directly from the
-- browser (find-by-phone, then insert or update). For that to have worked
-- at all, `customers` must currently have an anon-facing SELECT/INSERT/
-- UPDATE policy — which also means anyone can look up or overwrite another
-- customer's name/email/address if they know (or guess/enumerate) a phone
-- number.
--
-- Fix: checkout no longer touches `customers` directly. All customer
-- find-or-create logic now happens inside create_order_secure() (see
-- supabase-secure-checkout-rpc.sql), which runs as SECURITY DEFINER and so
-- doesn't need anon to have any grant on `customers` at all. Run that file
-- first, then this one.
--
-- Result once both files are applied:
--   - anon / public: no access to `customers` whatsoever
--   - authenticated admins (in admin_users): SELECT only, for the admin
--     dashboard's future customer list
--   - checkout: still works, via the RPC's elevated internal access
-- ============================================================================

alter table public.customers enable row level security;

-- ----------------------------------------------------------------------------
-- STEP 1 — see what's actually on this table right now before changing it:
-- ----------------------------------------------------------------------------
--   select policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where schemaname = 'public' and tablename = 'customers'
--   order by cmd;
--
-- ----------------------------------------------------------------------------
-- STEP 2 — add the admin read policy (safe to run now, doesn't remove
-- anything):
-- ----------------------------------------------------------------------------
drop policy if exists "Admins can view customers" on public.customers;
create policy "Admins can view customers"
on public.customers
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- STEP 3 — drop legacy anon-facing SELECT/INSERT/UPDATE policies:
-- ----------------------------------------------------------------------------
drop policy if exists "Anyone can view customers by phone" on public.customers;
drop policy if exists "Anyone can create customers" on public.customers;
drop policy if exists "Anyone can update customers" on public.customers;

-- After this step, anon/public has zero access to `customers` — no SELECT,
-- no INSERT, no UPDATE. Only the admin SELECT policy above (for signed-in
-- admins) and the SECURITY DEFINER RPC (for checkout) can touch this table.

