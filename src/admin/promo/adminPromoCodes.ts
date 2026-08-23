import { supabase } from '../../lib/supabase';
import { normalizePromoExpiresAt } from '../../lib/promoCodes';

export interface AdminPromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
}

/** What the create/edit form submits. */
export interface AdminPromoCodeInput {
  code: string;
  discount_percentage: number;
  is_active: boolean;
  /** ISO date string (yyyy-mm-dd) or null for no expiration. */
  expires_at: string | null;
  usage_limit: number | null;
}

export class AdminPromoCodesError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'AdminPromoCodesError';
  }
}

function toFriendlyMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === '23505') return 'Такой промокод уже существует.';
  if (code === '23514') return 'Скидка должна быть от 1 до 100%, лимит использований — положительным числом.';
  if (code === '42501' || code === '401') {
    return 'Недостаточно прав. Убедитесь, что ваш аккаунт добавлен в admin_users и выполнена миграция supabase-promo-codes.sql.';
  }
  return fallback;
}

export async function fetchAdminPromoCodes(): Promise<AdminPromoCode[]> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AdminPromoCodesError(toFriendlyMessage(error, 'Не удалось загрузить промокоды.'), error);
  }

  return (data ?? []) as AdminPromoCode[];
}

export async function createAdminPromoCode(input: AdminPromoCodeInput): Promise<void> {
  const { error } = await supabase.from('promo_codes').insert({
    code: input.code.trim().toUpperCase(),
    discount_percentage: input.discount_percentage,
    is_active: input.is_active,
    expires_at: normalizePromoExpiresAt(input.expires_at),
    usage_limit: input.usage_limit,
  });

  if (error) {
    throw new AdminPromoCodesError(toFriendlyMessage(error, 'Не удалось создать промокод.'), error);
  }
}

export async function updateAdminPromoCode(id: string, input: AdminPromoCodeInput): Promise<void> {
  const { error } = await supabase
    .from('promo_codes')
    .update({
      code: input.code.trim().toUpperCase(),
      discount_percentage: input.discount_percentage,
      is_active: input.is_active,
      expires_at: normalizePromoExpiresAt(input.expires_at),
      usage_limit: input.usage_limit,
    })
    .eq('id', id);

  if (error) {
    throw new AdminPromoCodesError(toFriendlyMessage(error, 'Не удалось сохранить промокод.'), error);
  }
}

/** Convenience toggle used by the list's Active/Inactive switch. */
export async function setAdminPromoCodeActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('promo_codes').update({ is_active: isActive }).eq('id', id);

  if (error) {
    throw new AdminPromoCodesError(toFriendlyMessage(error, 'Не удалось изменить статус промокода.'), error);
  }
}

export async function deleteAdminPromoCode(id: string): Promise<void> {
  const { error } = await supabase.from('promo_codes').delete().eq('id', id);

  if (error) {
    throw new AdminPromoCodesError(toFriendlyMessage(error, 'Не удалось удалить промокод.'), error);
  }
}
