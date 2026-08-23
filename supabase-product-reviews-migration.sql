-- ============================================================================
-- PRODUCT REVIEWS — safe migration for the EXISTING table
-- ============================================================================
-- The previous supabase-product-reviews.sql assumed product_reviews didn't
-- exist yet and tried to CREATE TABLE IF NOT EXISTS with a uuid id — but a
-- table with this shape already exists in production:
--
--   id            text
--   product_id    text
--   author        text
--   rating        integer
--   review_date   date
--   comment       text
--   verified      boolean
--   created_at    timestamptz
--
-- This migration does NOT touch that shape. It only adds a `status` column
-- and the RLS policies needed for moderation, on top of what's already
-- there. No table is dropped, no rows are deleted, no existing column is
-- removed or retyped.
--
-- Superseded: supabase-product-reviews.sql (do not run it against this
-- database — it will fail on CREATE TABLE, exactly as already happened).
-- Use this file instead.
--
-- Safe to run more than once — every step is written to be idempotent.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1 — inspect before changing anything. Run these manually and check
-- the output; nothing below depends on you doing this, but it's worth
-- confirming what's actually there first.
-- ----------------------------------------------------------------------------
--   select column_name, data_type, is_nullable, column_default
--   from information_schema.columns
--   where table_schema = 'public' and table_name = 'product_reviews'
--   order by ordinal_position;
--
--   select relrowsecurity from pg_class where relname = 'product_reviews';
--
--   select policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where schemaname = 'public' and tablename = 'product_reviews';
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- STEP 2 — add `status`, backfilling from the existing `verified` column so
-- no review disappears or silently changes meaning: anything already marked
-- verified is treated as already-approved; everything else starts pending
-- (i.e. it now needs a moderation pass it never had before, since the old
-- flow published every review immediately).
-- ----------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'product_reviews' and column_name = 'status'
  ) then
    alter table public.product_reviews add column status text;
  end if;
end $$;

update public.product_reviews
set status = case when verified then 'approved' else 'pending' end
where status is null;

alter table public.product_reviews alter column status set default 'pending';
alter table public.product_reviews alter column status set not null;

alter table public.product_reviews drop constraint if exists product_reviews_status_check;
alter table public.product_reviews
  add constraint product_reviews_status_check check (status in ('pending', 'approved', 'rejected'));

-- ----------------------------------------------------------------------------
-- STEP 3 — RLS. Enabling RLS on a table that already has it enabled is a
-- harmless no-op; each policy is dropped and recreated by name so this is
-- safe to run twice.
-- ----------------------------------------------------------------------------

alter table public.product_reviews enable row level security;

-- Public (anon + authenticated) can only ever see approved reviews.
drop policy if exists "Public can view approved reviews" on public.product_reviews;
create policy "Public can view approved reviews"
on public.product_reviews
for select
to anon, authenticated
using (status = 'approved');

-- Anyone can submit a review, but it can only ever land as 'pending' — the
-- with_check makes this a hard database constraint, not just a UI default,
-- so a client can't insert itself straight to 'approved'.
drop policy if exists "Anyone can submit a pending review" on public.product_reviews;
create policy "Anyone can submit a pending review"
on public.product_reviews
for insert
to anon, authenticated
with check (status = 'pending');

-- Admins can see every review regardless of status, for the moderation queue.
drop policy if exists "Admins can view all reviews" on public.product_reviews;
create policy "Admins can view all reviews"
on public.product_reviews
for select
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

-- Admins can update (approve/reject) reviews.
drop policy if exists "Admins can update review status" on public.product_reviews;
create policy "Admins can update review status"
on public.product_reviews
for update
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

-- Admins can delete reviews.
drop policy if exists "Admins can delete reviews" on public.product_reviews;
create policy "Admins can delete reviews"
on public.product_reviews
for delete
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

-- ----------------------------------------------------------------------------
-- Nothing else about the table changes: id, product_id, author, rating,
-- review_date, comment, verified, created_at are all untouched, and every
-- existing row keeps its original id and product_id.
-- ----------------------------------------------------------------------------
