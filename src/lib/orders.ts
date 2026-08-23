import { supabase } from './supabase';
import { CartItem, OrderDetails } from '../types';

/**
 * Totals as returned by the server (`create_order_secure`), not as computed
 * by CheckoutPage's own math. The RPC recalculates every number from
 * `products.price` — the client's figures are only ever a preview shown
 * before submitting, never what gets written to `orders`.
 */
export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  deliveryAmount: number;
  totalAmount: number;
}

export interface CreateOrderResult {
  orderId: string;
  totals: OrderTotals;
}

interface CreateOrderSecureRow {
  order_id: string;
  subtotal: number;
  discount_amount: number;
  delivery_amount: number;
  total_amount: number;
}

/**
 * Creates an order (and its order_items) via the `create_order_secure`
 * Postgres function — see supabase-secure-checkout-rpc.sql.
 *
 * The server recomputes subtotal/discount/delivery/total from the
 * authoritative product prices and the promo-code rules; nothing price-
 * related from the browser is trusted or written as-is. Customer
 * find-or-create also happens inside that function (as SECURITY DEFINER),
 * so this client no longer touches `customers` directly — see
 * supabase-customers-policies.sql for why that matters.
 *
 * Requires supabase-secure-checkout-rpc.sql to have been run in Supabase.
 * Throws on any failure. Callers must not show a success state unless this
 * resolves without throwing.
 */
export async function createOrder(
  cartItems: CartItem[],
  details: OrderDetails
): Promise<CreateOrderResult> {
  if (cartItems.length === 0) {
    throw new Error('Корзина пуста');
  }

  const items = cartItems.map((item) => ({
    product_id: item.product.id,
    color_name: item.selectedColor.name,
    color_hex: item.selectedColor.hex,
    size: item.selectedSize,
    quantity: item.quantity,
  }));

  const { data, error } = await supabase.rpc('create_order_secure', {
    p_full_name: details.fullName.trim(),
    p_phone: details.phone.trim(),
    p_email: details.email.trim() || null,
    p_city: details.city.trim(),
    p_address: details.address.trim() || null,
    p_delivery_method: details.deliveryMethod,
    p_payment_method: details.paymentMethod,
    p_comment: details.comment?.trim() || null,
    p_promo_code: details.promoCode || null,
    p_items: items,
  });

  if (error) {
    throw error;
  }

  const row = (Array.isArray(data) ? data[0] : data) as CreateOrderSecureRow | undefined;

  if (!row) {
    throw new Error('Не удалось оформить заказ: сервер не вернул подтверждение.');
  }

  return {
    orderId: row.order_id,
    totals: {
      subtotal: row.subtotal,
      discountAmount: row.discount_amount,
      deliveryAmount: row.delivery_amount,
      totalAmount: row.total_amount,
    },
  };
}
