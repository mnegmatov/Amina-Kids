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
  const { error } = await supabase.from('product_reviews').insert({
    id: crypto.randomUUID(),
    product_id: productId,
    author: author.trim(),
    rating,
    review_date: new Date().toISOString().slice(0, 10),
    comment: comment.trim(),
    verified: false,
    status: 'pending',
  });

  if (error) throw error;
}
