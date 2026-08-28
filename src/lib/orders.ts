import { supabase, isSupabaseConfigured } from './supabase';
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

interface PostgrestErrorLike {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

/**
 * Maps Supabase PostgREST / PostgreSQL error objects to clear, user-friendly messages.
 */
function formatRpcError(error: PostgrestErrorLike): string {
  const code = error.code;
  const msg = error.message || '';

  if (code === '42702') {
    return 'Внутренняя ошибка базы данных: неоднозначное имя колонки (42702). Пожалуйста, примените обновлённый файл supabase-secure-checkout-rpc.sql.';
  }

  if (code === '42883') {
    return 'Функция оформления заказа (create_order_secure) не найдена в базе данных. Выполните скрипт supabase-secure-checkout-rpc.sql в Supabase SQL Editor.';
  }

  if (code === '42501') {
    return 'Ошибка прав доступа при оформлении заказа. Убедитесь, что функции create_order_secure выдан доступ для anon и authenticated.';
  }

  if (code === 'PGRST301' || code === 'PGRST303') {
    return 'Срок действия сессии истёк или возникла ошибка авторизации. Пожалуйста, обновите страницу.';
  }

  if (msg) {
    return msg;
  }

  return 'Не удалось оформить заказ. Пожалуйста, попробуйте ещё раз или свяжитесь с нами.';
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

  if (!isSupabaseConfigured) {
    console.error('[createOrder] Supabase is not configured (missing or placeholder environment variables).');
    throw new Error(
      'Сервер заказов временно недоступен (не настроено подключение к базе данных). Пожалуйста, свяжитесь с нами по телефону или в WhatsApp.'
    );
  }

  const items = cartItems.map((item) => ({
    product_id: item.product.id,
    color_name: item.selectedColor.name,
    color_hex: item.selectedColor.hex,
    size: item.selectedSize,
    quantity: item.quantity,
  }));

  try {
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
      console.error('[createOrder] Supabase RPC returned error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      const userMessage = formatRpcError(error);
      const customErr = new Error(userMessage);
      (customErr as unknown as { code?: string; details?: string | null }).code = error.code;
      (customErr as unknown as { code?: string; details?: string | null }).details = error.details;
      throw customErr;
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Check for network/fetch failures (e.g. Safari "Load failed" or Chrome "Failed to fetch")
      const lower = err.message.toLowerCase();
      if (
        lower === 'load failed' ||
        lower.includes('failed to fetch') ||
        lower.includes('networkerror') ||
        lower.includes('fetch failed') ||
        err.name === 'TypeError'
      ) {
        console.error('[createOrder] Network request failed:', err);
        throw new Error(
          'Не удалось связаться с сервером базы данных (ошибка сети). Проверьте интернет-соединение или настройки Supabase URL/ключа.'
        );
      }
      throw err;
    }
    console.error('[createOrder] Unexpected non-Error exception:', err);
    throw new Error('Произошла непредвиденная ошибка при отправке заказа. Попробуйте ещё раз.');
  }
}
