-- ============================================================================
-- SECURE CHECKOUT RPC — server-side totals, inventory control & validation
-- ============================================================================
-- Features & Guarantees:
--   - Authoritative pricing: price is always read from `public.products.price`.
--   - Inventory Control: checks `public.product_variants.stock_quantity` >= quantity.
--   - Race-Condition Protection: uses `SELECT ... FOR UPDATE OF pv` to lock
--     the variant row during checkout so concurrent buyers cannot oversell stock.
--   - Atomic Rollback: if any line item has insufficient stock or errors, the
--     entire transaction rolls back (no partial orders or inconsistent deductions).
--   - Variant Validation: each (product_id, color_name, color_hex, size) must
--     match an existing active variant in `public.product_variants`.
--   - Duplicate Prevention: the same variant cannot appear twice in one order.
--   - Automatic Inventory Deduction: decrements `product_variants.stock_quantity`
--     and synchronizes `products.in_stock` when all variants run out of stock.
--
-- SECURITY DEFINER lets this function write to `orders`, `order_items`, `customers`,
-- `product_variants`, and (since the promo-codes pass) `promo_codes` regardless
-- of caller's direct RLS table grants.
--
-- Depends on `public.promo_codes` — run supabase-promo-codes.sql first if this
-- is a fresh setup. Re-running this file on an existing database is still
-- safe either way (CREATE OR REPLACE).
-- Run this whole file once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================================
--
-- Privilege check: this function grants EXECUTE to anon/authenticated and
-- nothing else. It does not grant them SELECT/INSERT/UPDATE on `orders`,
-- `order_items`, `customers`, `products`, or `product_variants` — those
-- roles get no new table-level access at all. Only calls that go through
-- this function's own validation logic can write anything, and only what
-- this function itself chooses to write.
--
-- Run this whole file once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================================

create or replace function public.create_order_secure(
  p_full_name text,
  p_phone text,
  p_email text,
  p_city text,
  p_address text,
  p_delivery_method text,
  p_payment_method text,
  p_comment text,
  p_promo_code text,
  p_items jsonb -- [{ "product_id": "...", "color_name": "...", "color_hex": "...", "size": "...", "quantity": 2 }, ...]
)
returns table (
  order_id uuid,
  subtotal numeric,
  discount_amount numeric,
  delivery_amount numeric,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_id uuid := gen_random_uuid();
  v_subtotal numeric := 0;
  v_discount_rate numeric := 0;
  v_discount_amount numeric := 0;
  v_delivery_amount numeric := 0;
  v_total numeric := 0;
  v_item jsonb;
  v_price numeric;
  v_qty int;
  v_product_id text;
  v_product_name text;
  v_color_name text;
  v_color_hex text;
  v_size text;
  v_variant_id bigint;
  v_stock_quantity int;
  v_seen_variants text[] := '{}';
  v_variant_key text;
  v_affected_product_ids text[] := '{}';
  v_pid text;
  v_promo_id uuid;
  v_promo_discount_percentage numeric;
  v_promo_is_active boolean;
  v_promo_expires_at timestamptz;
  v_promo_usage_limit int;
  v_promo_usage_count int;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Корзина пуста' using errcode = '22023';
  end if;

  if p_delivery_method not in ('courier', 'pickup', 'showroom') then
    raise exception 'Некорректный способ доставки' using errcode = '22023';
  end if;

  if p_payment_method not in ('card', 'cash') then
    raise exception 'Некорректный способ оплаты' using errcode = '22023';
  end if;

  if p_full_name is null or length(trim(p_full_name)) = 0 then
    raise exception 'Укажите имя получателя' using errcode = '22023';
  end if;

  if p_city is null or length(trim(p_city)) = 0 then
    raise exception 'Укажите город' using errcode = '22023';
  end if;

  -- Recompute subtotal from authoritative `products.price`, validate variant existence,
  -- lock the variant row to protect against race conditions, check available stock,
  -- and decrement `product_variants.stock_quantity`.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := v_item ->> 'product_id';
    v_color_name := v_item ->> 'color_name';
    v_color_hex := v_item ->> 'color_hex';
    v_size := v_item ->> 'size';
    v_qty := (v_item ->> 'quantity')::int;

    if v_product_id is null or length(v_product_id) = 0 then
      raise exception 'Некорректный товар в заказе' using errcode = '22023';
    end if;

    if v_color_name is null or length(trim(v_color_name)) = 0
       or v_color_hex is null or length(trim(v_color_hex)) = 0
       or v_size is null or length(trim(v_size)) = 0 then
      raise exception 'Некорректный вариант товара (цвет/размер) в заказе' using errcode = '22023';
    end if;

    if v_qty is null or v_qty <= 0 or v_qty > 100 then
      raise exception 'Некорректное количество товара' using errcode = '22023';
    end if;

    -- Prevent duplicate variant lines in the same request payload
    v_variant_key := v_product_id || '|' || v_color_name || '|' || v_color_hex || '|' || v_size;
    if v_variant_key = any(v_seen_variants) then
      raise exception 'Товар % (% / %) указан в заказе более одного раза', v_product_id, v_color_name, v_size
        using errcode = '22023';
    end if;
    v_seen_variants := array_append(v_seen_variants, v_variant_key);

    -- Lock the specific variant row with FOR UPDATE to prevent race conditions.
    -- Fetch price and product name from the authoritative `public.products` record.
    v_variant_id := null;
    v_stock_quantity := null;
    v_product_name := null;
    v_price := null;

    select pv.id, pv.stock_quantity, p.name, p.price
    into v_variant_id, v_stock_quantity, v_product_name, v_price
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.product_id = v_product_id
      and pv.color_name = v_color_name
      and pv.color_hex = v_color_hex
      and pv.size = v_size
    for update of pv;

    if v_variant_id is null then
      raise exception 'Товар % недоступен в варианте % / %', v_product_id, v_color_name, v_size
        using errcode = '22023';
    end if;

    if v_price is null then
      raise exception 'Товар % не найден', v_product_id using errcode = '22023';
    end if;

    -- Validate stock quantity
    if coalesce(v_stock_quantity, 0) < v_qty then
      if coalesce(v_stock_quantity, 0) <= 0 then
        raise exception 'Товар «%» (% / %) закончился на складе',
          coalesce(v_product_name, v_product_id), v_color_name, v_size
          using errcode = '22023';
      else
        raise exception 'Недостаточно товара «%» (% / %) на складе. В наличии: %, запрошено: %',
          coalesce(v_product_name, v_product_id), v_color_name, v_size, v_stock_quantity, v_qty
          using errcode = '22023';
      end if;
    end if;

    -- Decrement inventory stock
    update public.product_variants
    set stock_quantity = stock_quantity - v_qty
    where id = v_variant_id;

    if not (v_product_id = any(v_affected_product_ids)) then
      v_affected_product_ids := array_append(v_affected_product_ids, v_product_id);
    end if;

    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  -- Synchronize in_stock flag on products if all variants of a product are now out of stock
  foreach v_pid in array v_affected_product_ids
  loop
    if not exists (
      select 1 from public.product_variants
      where product_id = v_pid and stock_quantity > 0
    ) then
      update public.products set in_stock = false where id = v_pid;
    end if;
  end loop;

  -- Promo codes now live in public.promo_codes (see supabase-promo-codes.sql)
  -- instead of being hardcoded here. The row is locked with FOR UPDATE —
  -- same pattern as the variant stock lock above — so two concurrent orders
  -- can't both squeeze in under a usage_limit. Client-provided discount
  -- percentages are never trusted; only what this lookup returns is used.
  v_discount_rate := 0;
  if p_promo_code is not null and length(trim(p_promo_code)) > 0 then
    select pc.id, pc.discount_percentage, pc.is_active, pc.expires_at, pc.usage_limit, pc.usage_count
    into v_promo_id, v_promo_discount_percentage, v_promo_is_active, v_promo_expires_at,
         v_promo_usage_limit, v_promo_usage_count
    from public.promo_codes pc
    where upper(pc.code) = upper(trim(p_promo_code))
    for update;

    if v_promo_id is not null
       and v_promo_is_active
       and (v_promo_expires_at is null or v_promo_expires_at > now())
       and (v_promo_usage_limit is null or v_promo_usage_count < v_promo_usage_limit)
    then
      v_discount_rate := v_promo_discount_percentage / 100;
      update public.promo_codes set usage_count = usage_count + 1 where id = v_promo_id;
      p_promo_code := upper(trim(p_promo_code));
    else
      p_promo_code := null;
    end if;
  else
    p_promo_code := null;
  end if;
  v_discount_amount := round(v_subtotal * v_discount_rate);

  -- Delivery fee, matching CheckoutPage's existing rule: free for showroom
  -- pickup, free above 5000 somoni, otherwise 390.
  if p_delivery_method = 'showroom' then
    v_delivery_amount := 0;
  elsif (v_subtotal - v_discount_amount) >= 5000 then
    v_delivery_amount := 0;
  else
    v_delivery_amount := 390;
  end if;

  v_total := v_subtotal - v_discount_amount + v_delivery_amount;

  -- Find-or-create customer. Runs as SECURITY DEFINER, so this does not
  -- require anon/authenticated to have direct INSERT/UPDATE/SELECT grants
  -- on `customers` — see supabase-customers-policies.sql for the lockdown
  -- this makes possible.
  if p_phone is not null and length(trim(p_phone)) > 0 then
    select id into v_customer_id from public.customers where phone = trim(p_phone);

    if v_customer_id is null then
      insert into public.customers (full_name, phone, email, city, address)
      values (
        trim(p_full_name),
        trim(p_phone),
        nullif(trim(coalesce(p_email, '')), ''),
        nullif(trim(coalesce(p_city, '')), ''),
        nullif(trim(coalesce(p_address, '')), '')
      )
      returning id into v_customer_id;
    else
      update public.customers
      set full_name = trim(p_full_name),
          email = nullif(trim(coalesce(p_email, '')), ''),
          city = nullif(trim(coalesce(p_city, '')), ''),
          address = nullif(trim(coalesce(p_address, '')), '')
      where id = v_customer_id;
    end if;
  end if;

  insert into public.orders (
    id, customer_id, full_name, phone, email, city, address,
    delivery_method, payment_method, comment, promo_code,
    subtotal, discount_amount, delivery_amount, total_amount, status
  ) values (
    v_order_id, v_customer_id, trim(p_full_name), trim(coalesce(p_phone, '')),
    nullif(trim(coalesce(p_email, '')), ''), trim(p_city),
    nullif(trim(coalesce(p_address, '')), ''),
    p_delivery_method, p_payment_method,
    nullif(trim(coalesce(p_comment, '')), ''), p_promo_code,
    v_subtotal, v_discount_amount, v_delivery_amount, v_total, 'pending'
  );

  insert into public.order_items (
    order_id, product_id, product_name, color_name, color_hex, size, quantity, unit_price, total_price
  )
  select
    v_order_id,
    item_row ->> 'product_id',
    p.name,
    item_row ->> 'color_name',
    item_row ->> 'color_hex',
    item_row ->> 'size',
    (item_row ->> 'quantity')::int,
    p.price,
    p.price * (item_row ->> 'quantity')::int
  from jsonb_array_elements(p_items) as item_row
  join public.products p on p.id = item_row ->> 'product_id';

  return query select v_order_id, v_subtotal, v_discount_amount, v_delivery_amount, v_total;
end;
$$;

-- Hardening: strip the default PUBLIC execute grant Postgres adds to every
-- new function, then grant EXECUTE only to the two roles that actually need
-- it. This is the only privilege change this file makes — anon/authenticated
-- get the ability to call this one function, nothing else. They still have
-- no direct SELECT/INSERT/UPDATE grant on any of the tables it touches.
revoke all on function public.create_order_secure(
  text, text, text, text, text, text, text, text, text, jsonb
) from public;

grant execute on function public.create_order_secure(
  text, text, text, text, text, text, text, text, text, jsonb
) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- MANUAL STEP — required to actually close the hole, read before running:
-- ----------------------------------------------------------------------------
-- The RPC above is now the *safe* way to create an order. But if `orders`
-- and `order_items` still have their old anon/public INSERT policies (the
-- ones the previous direct-insert checkout relied on), anyone can still
-- bypass this function entirely and insert a fabricated cheap order directly
-- via the REST API. That old INSERT policy must be removed.
--
-- 1. First, see what's actually there — run this and send me the output,
--    or just read it yourself:
--
--   select policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where schemaname = 'public' and tablename in ('orders', 'order_items')
--   order by tablename, cmd;
--
-- 2. For each INSERT policy you see on `orders` / `order_items` that allows
--    anon/public to insert (there should be exactly one per table — this is
--    what let checkout write orders directly before), drop it by its real
--    name, e.g.:
--
--   drop policy "<paste the exact policyname from step 1>" on public.orders;
--   drop policy "<paste the exact policyname from step 1>" on public.order_items;
--
-- I'm not guessing table names here and auto-dropping, since a wrong guess
-- could remove a policy you still need. Once you drop the old INSERT
-- policies, checkout will only be able to create orders through
-- create_order_secure(), which is exactly the point.
--
-- Everything else — "Admins can view orders", "Admins can update orders",
-- "Admins can view order items" from supabase-admin-orders-policies.sql —
-- is untouched and keeps working as-is.
