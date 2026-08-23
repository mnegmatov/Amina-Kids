import { supabase } from './supabase';

export interface PromoValidationResult {
  success: boolean;
  message: string;
  /** Fraction, e.g. 0.1 for 10%. Only meaningful when `success` is true. */
  discountRate: number;
}

/**
 * Calls the `validate_promo_code` RPC (see supabase-promo-codes.sql) to
 * check whether a code is currently active, not expired, and under its
 * usage limit.
 *
 * This is a **preview only** — it never writes anything and never
 * increments usage. The authoritative check (and the only place a
 * discount is actually applied to an order) is inside
 * `create_order_secure()`, exactly like the existing stock-check flow
 * in `lib/stockCheck.ts`.
 */
export async function validatePromoCode(code: string): Promise<PromoValidationResult> {
  const normalized = code.trim();

  if (!normalized) {
    return { success: false, message: 'Введите промокод', discountRate: 0 };
  }

  const { data, error } = await supabase.rpc('validate_promo_code', { p_code: normalized });

  if (error) {
    console.error('Failed to validate promo code:', error);
    return {
      success: false,
      message: 'Не удалось проверить промокод. Попробуйте ещё раз.',
      discountRate: 0,
    };
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | { is_valid: boolean; discount_percentage: number | null }
    | undefined;

  if (!row || !row.is_valid || row.discount_percentage == null) {
    return { success: false, message: 'Неверный или истёкший промокод', discountRate: 0 };
  }

  return {
    success: true,
    message: `Промокод ${normalized.toUpperCase()} применён (-${row.discount_percentage}%)`,
    discountRate: row.discount_percentage / 100,
  };
}

/**
 * Checks if a promo code's expires_at timestamp is expired.
 * For YYYY-MM-DD strings, considers it active until 23:59:59.999 of that local day.
 */
export function isPromoExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const trimmed = expiresAt.trim();
  if (!trimmed) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
    return Date.now() > endOfDay;
  }
  const timestamp = new Date(trimmed).getTime();
  return !isNaN(timestamp) && Date.now() > timestamp;
}

/**
 * Normalizes an expiration date string (e.g. "2026-12-31" from an input[type="date"])
 * into an ISO timestamp representing the end of that day (23:59:59.999).
 */
export function normalizePromoExpiresAt(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const trimmed = expiresAt.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
    return endOfDay.toISOString();
  }
  return trimmed;
}

