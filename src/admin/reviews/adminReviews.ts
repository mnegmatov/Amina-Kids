import { supabase } from '../../lib/supabase';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface AdminReview {
  id: string;
  product_id: string;
  author: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  created_at: string;
}

export class AdminReviewsError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'AdminReviewsError';
  }
}

function toFriendlyMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === '42501' || code === '401') {
    return 'Недостаточно прав. Убедитесь, что ваш аккаунт добавлен в admin_users и выполнена миграция supabase-product-reviews-migration.sql.';
  }
  return fallback;
}

/**
 * Fetches reviews of every status for the moderation queue. Relies on the
 * "Admins can view all reviews" RLS policy — a non-admin authenticated
 * caller would only ever see approved rows through this same query, not an
 * error, so there's nothing extra to guard here client-side.
 */
export async function fetchAdminReviews(): Promise<AdminReview[]> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, product_id, author, rating, comment, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AdminReviewsError(toFriendlyMessage(error, 'Не удалось загрузить отзывы.'), error);
  }

  return (data ?? []) as AdminReview[];
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const { error } = await supabase.from('product_reviews').update({ status }).eq('id', id);

  if (error) {
    throw new AdminReviewsError(toFriendlyMessage(error, 'Не удалось изменить статус отзыва.'), error);
  }
}

export async function deleteAdminReview(id: string): Promise<void> {
  const { error } = await supabase.from('product_reviews').delete().eq('id', id);

  if (error) {
    throw new AdminReviewsError(toFriendlyMessage(error, 'Не удалось удалить отзыв.'), error);
  }
}
