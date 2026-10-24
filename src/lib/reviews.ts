import { supabase } from './supabase';
import { ProductReview } from '../types';

interface SupabaseReviewRow {
  id: string;
  author: string;
  rating: number;
  review_date: string;
  comment: string;
  verified: boolean;
}

function formatReviewDate(isoDate: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(isoDate)
  );
}

/**
 * Fetches only `approved` reviews for a product — enforced by RLS
 * (`status = 'approved'` in the SELECT policy), not by this filter, so
 * there's no way for a client bug here to leak pending/rejected reviews.
 * See supabase-product-reviews-migration.sql.
 */
export async function fetchApprovedReviews(productId: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, author, rating, review_date, comment, verified')
    .eq('product_id', productId)
    .order('review_date', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as SupabaseReviewRow[]).map((row) => ({
    id: row.id,
    author: row.author,
    rating: row.rating,
    date: formatReviewDate(row.review_date),
    comment: row.comment,
    verified: row.verified,
  }));
}

/**
 * Submits a new review. Always lands as `status = 'pending'` — the RLS
 * insert policy enforces this regardless of what's sent, so this is
 * explicit here for clarity, not because the client is trusted to set it.
 * The review will not appear publicly until an admin approves it.
 *
 * `verified` reflects a verified purchase, which this form has no way to
 * check, so new reviews are always submitted as unverified; an admin can
 * still mark one verified later directly in Supabase if needed.
 */
export async function submitReview(
  productId: string,
  author: string,
  rating: number,
  comment: string
): Promise<void> {
  const cleanProductId = productId.trim();
  const cleanAuthor = author.trim();
  const cleanComment = comment.trim();
  const roundedRating = Math.round(Number(rating));

  if (!cleanProductId) {
    throw new Error('Не указан товар для отзыва.');
  }

  if (!cleanAuthor || cleanAuthor.length > 100) {
    throw new Error('Имя автора должно содержать от 1 до 100 символов.');
  }

  if (isNaN(roundedRating) || roundedRating < 1 || roundedRating > 5) {
    throw new Error('Рейтинг должен быть от 1 до 5 звёзд.');
  }

  if (!cleanComment || cleanComment.length > 2000) {
    throw new Error('Комментарий должен содержать от 1 до 2000 символов.');
  }

  const { error } = await supabase.from('product_reviews').insert({
    id: crypto.randomUUID(),
    product_id: cleanProductId,
    author: cleanAuthor,
    rating: roundedRating,
    review_date: new Date().toISOString().slice(0, 10),
    comment: cleanComment,
    verified: false,
    status: 'pending',
  });

  if (error) throw error;
}
