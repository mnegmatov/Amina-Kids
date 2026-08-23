-- ============================================================================
-- Keep products.in_stock consistent with product_variants.stock_quantity
-- ============================================================================
-- Run this whole file once in the Supabase SQL Editor. Safe to re-run.
--
-- What this does:
--   1. After any INSERT/UPDATE/DELETE on product_variants, sets the parent
--      product's in_stock = true if at least one variant has stock_quantity > 0,
--      otherwise false.
--   2. One-time backfill so existing products match current variant stock.
--
-- Does NOT change RLS. Does NOT replace create_order_secure().
-- Checkout still deducts stock and remains the authoritative stock check.
-- ============================================================================

create or replace function public.sync_product_in_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id text;
begin
  v_product_id := coalesce(NEW.product_id, OLD.product_id);
  if v_product_id is null then
    return coalesce(NEW, OLD);
  end if;

  update public.products
  set in_stock = exists (
    select 1
    from public.product_variants
    where product_id = v_product_id
      and stock_quantity > 0
  )
  where id = v_product_id;

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists trg_sync_product_in_stock on public.product_variants;

create trigger trg_sync_product_in_stock
after insert or update of stock_quantity, product_id or delete
on public.product_variants
for each row
execute procedure public.sync_product_in_stock();

-- Backfill current catalog so in_stock matches live variant stock.
update public.products p
set in_stock = exists (
  select 1
  from public.product_variants pv
  where pv.product_id = p.id
    and pv.stock_quantity > 0
);
