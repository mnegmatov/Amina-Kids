-- ============================================================================
-- PROMO CODES — table, admin RLS, and a safe public validation RPC
-- ============================================================================
-- Replaces the two hardcoded promo codes (FIRST10 = -10%, AMINA20 = -20%)
-- that previously lived in App.tsx (client preview) AND inside
-- create_order_secure() (authoritative) with a single source of truth.
--
-- Run this file BEFORE the updated supabase-secure-checkout-rpc.sql, since
-- that function is updated by this pass to read from this table.
--
-- Access model:
--   - `promo_codes` itself has NO grant to anon/authenticated at all — not
--     even SELECT. Admins (via admin_users) get full CRUD through RLS for
--     the admin panel.
--   - `validate_promo_code(text)` is a SECURITY DEFINER function granted
--     EXECUTE to anon/authenticated. It's read-only (never increments
--     usage) and only returns whether a code is currently valid plus its
--     discount percentage — nothing else from the row. This is what the
--     cart/checkout UI calls to show a live preview.
--   - The actual discount that gets charged is still only ever decided
--     inside create_order_secure(), which locks the row with `FOR UPDATE`
--     (same pattern as stock) and increments usage_count itself. The
--     client-side preview is advisory only, exactly like the existing
--     stock-check flow.
-- ============================================================================

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percentage numeric not null check (discount_percentage > 0 and discount_percentage <= 100),
  is_active boolean not null default true,
  expires_at timestamptz null,
  usage_limit int null check (usage_limit is null or usage_limit > 0),
  usage_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;

-- No anon/authenticated policy at all on the table itself — admins only.
drop policy if exists "Admins can view promo codes" on public.promo_codes;
create policy "Admins can view promo codes"
on public.promo_codes
for select
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "Admins can insert promo codes" on public.promo_codes;
create policy "Admins can insert promo codes"
on public.promo_codes
for insert
to authenticated
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "Admins can update promo codes" on public.promo_codes;
create policy "Admins can update promo codes"
on public.promo_codes
for update
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "Admins can delete promo codes" on public.promo_codes;
create policy "Admins can delete promo codes"
on public.promo_codes
for delete
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

-- ----------------------------------------------------------------------------
-- Read-only preview RPC — safe for anon to call directly from the cart.
-- ----------------------------------------------------------------------------
create or replace function public.validate_promo_code(p_code text)
returns table (
  is_valid boolean,
  discount_percentage numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
begin
  if p_code is null or length(trim(p_code)) = 0 then
    return query select false, null::numeric;
    return;
  end if;

  select pc.discount_percentage, pc.is_active, pc.expires_at, pc.usage_limit, pc.usage_count
  into v_row
  from public.promo_codes pc
  where upper(pc.code) = upper(trim(p_code));

  if v_row is null
     or not v_row.is_active
     or (v_row.expires_at is not null and v_row.expires_at <= now())
     or (v_row.usage_limit is not null and v_row.usage_count >= v_row.usage_limit)
  then
    return query select false, null::numeric;
    return;
  end if;

  return query select true, v_row.discount_percentage;
end;
$$;

revoke all on function public.validate_promo_code(text) from public;
grant execute on function public.validate_promo_code(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Seed the two existing codes so nothing breaks the moment this is applied —
-- customers who already know FIRST10 / AMINA20 keep working exactly as
-- before, now served from this table instead of hardcoded SQL.
-- ----------------------------------------------------------------------------
insert into public.promo_codes (code, discount_percentage, is_active)
values
  ('FIRST10', 10, true),
  ('AMINA20', 20, true)
on conflict (code) do nothing;
