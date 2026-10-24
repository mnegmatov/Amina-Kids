-- ============================================================================
-- AMINA KIDS — Production Security Hardening Migration
-- ============================================================================
-- Features & Guarantees:
--   1. admin_users: Table creation, RLS enablement, revoke all write grants,
--      and create self-inspection policy for authenticated admin users.
--   2. orders & order_items: Revoke direct table-level INSERT permissions and
--      idempotently drop any legacy anon/public direct INSERT policies so that
--      all orders must flow through create_order_secure().
--   3. product_reviews: Rating constraint (1-5 stars) and hardened RLS insert
--      policy ensuring public submissions cannot bypass pending status or ratings.
--   4. customers: Ensures RLS is active and anon cannot read/write directly.
--
-- Safe and idempotent: can be reviewed and executed in Supabase SQL Editor.
-- Safe to re-run multiple times without side effects.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. admin_users Table & RLS Protection
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Defense in depth: Strip table-level write grants from public, anon, authenticated
revoke all on public.admin_users from public, anon, authenticated;
grant select on public.admin_users to authenticated;

-- Authenticated users can only read their own row to verify admin membership
drop policy if exists "Admins can view own admin record" on public.admin_users;
drop policy if exists "Users can check own admin status" on public.admin_users;

create policy "Admins can view own admin record"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- NOTE: No INSERT, UPDATE, or DELETE policies exist for authenticated or anon.
-- In PostgreSQL, enabling RLS with no write policies strictly DENIES all client-side
-- inserts, updates, and deletes. Administrator accounts can only be provisioned
-- directly via the Supabase Dashboard SQL Editor or service_role.

-- ----------------------------------------------------------------------------
-- 2. Drop Legacy Direct INSERT Policies on orders and order_items
-- ----------------------------------------------------------------------------
-- create_order_secure() is the only authorized gateway for order placement.
-- Dropping any direct INSERT policies prevents malicious clients from bypassing
-- server-side pricing, inventory decrements, and promo code validation.

revoke insert on public.orders, public.order_items from public, anon, authenticated;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

do $$
declare
  r record;
begin
  for r in (
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('orders', 'order_items')
      and cmd = 'INSERT'
      and ('anon' = any(roles) or 'public' = any(roles))
  ) loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 3. product_reviews Integrity Constraint & Hardened RLS
-- ----------------------------------------------------------------------------
-- Restrict review ratings to valid integer values between 1 and 5 stars.
alter table public.product_reviews
  drop constraint if exists product_reviews_rating_range;

alter table public.product_reviews
  add constraint product_reviews_rating_range check (rating >= 1 and rating <= 5);

-- Hardened insert policy: enforce status = 'pending', rating 1-5, and non-empty author/comment
drop policy if exists "Anyone can submit a pending review" on public.product_reviews;

create policy "Anyone can submit a pending review"
on public.product_reviews
for insert
to anon, authenticated
with check (
  status = 'pending'
  and rating >= 1
  and rating <= 5
  and length(trim(author)) > 0
  and length(trim(comment)) > 0
);

-- ----------------------------------------------------------------------------
-- 4. customers Table Lockdown Confirmation
-- ----------------------------------------------------------------------------
alter table public.customers enable row level security;

-- Drop any legacy anon-facing direct read/write policies on customers
drop policy if exists "Anyone can view customers by phone" on public.customers;
drop policy if exists "Anyone can create customers" on public.customers;
drop policy if exists "Anyone can update customers" on public.customers;

-- Ensure authenticated admins can view customers for CRM / dashboard
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
