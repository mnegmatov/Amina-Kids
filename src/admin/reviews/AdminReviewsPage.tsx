import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle2, Star, Check, X, Trash2, MessageSquare } from 'lucide-react';
import { navigate } from '../navigation';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';
import {
  AdminReview,
  ReviewStatus,
  fetchAdminReviews,
  setReviewStatus,
  deleteAdminReview,
  AdminReviewsError,
} from './adminReviews';

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'На модерации',
  approved: 'Одобрен',
  rejected: 'Отклонён',
};

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | ReviewStatus>('pending');
  const [successMessage, setSuccessMessage] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReviews(await fetchAdminReviews());
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(err instanceof AdminReviewsError ? err.message : 'Не удалось загрузить отзывы.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleSetStatus = async (review: AdminReview, status: ReviewStatus) => {
    setActioningId(review.id);
    try {
      await setReviewStatus(review.id, status);
      setSuccessMessage(status === 'approved' ? 'Отзыв опубликован.' : 'Отзыв отклонён.');
      loadReviews();
    } catch (err) {
      console.error('Failed to update review status:', err);
      setError(err instanceof AdminReviewsError ? err.message : 'Не удалось изменить статус отзыва.');
    } finally {
      setActioningId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await deleteAdminReview(pendingDeleteId);
      setPendingDeleteId(null);
      setSuccessMessage('Отзыв удалён.');
      loadReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError(err instanceof AdminReviewsError ? err.message : 'Не удалось удалить отзыв.');
      setPendingDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  useBodyScrollLock(pendingDeleteId !== null);

  useEffect(() => {
    if (!pendingDeleteId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) {
        setPendingDeleteId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingDeleteId, deleting]);

  const visibleReviews = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  const FILTERS: { id: 'all' | ReviewStatus; label: string }[] = [
    { id: 'pending', label: `На модерации${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { id: 'approved', label: 'Одобренные' },
    { id: 'rejected', label: 'Отклонённые' },
    { id: 'all', label: 'Все' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F1E5]">
      <header className="bg-white border-b border-[#E8E0D5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#7A695D] hover:text-[#33261D] transition-colors min-h-[40px] px-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Дашборд
          </button>
          <div className="w-px h-5 bg-[#E8E0D5]" />
          <h1 className="font-serif text-lg font-bold text-[#33261D]">Отзывы</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {successMessage && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-xs font-medium">{successMessage}</p>
          </div>
        )}

        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-2 min-h-[40px] whitespace-nowrap rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                filter === f.id
                  ? 'bg-[#4A3A0B] text-white shadow-xs'
                  : 'bg-white text-[#7A695D] border border-[#E8E0D5] hover:text-[#33261D]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">{error}</p>
            </div>
            <button
              onClick={loadReviews}
              className="shrink-0 text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
            >
              Повторить
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#E2A69B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visibleReviews.length === 0 ? (
          error ? null : (
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-10 flex flex-col items-center text-center gap-2">
              <MessageSquare className="w-8 h-8 text-[#E2A69B]" />
              <p className="text-sm font-semibold text-[#33261D]">Отзывов нет</p>
            </div>
          )
        ) : (
          <div className="space-y-3.5">
            {visibleReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-[#E8E0D5] shadow-xs p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#33261D]">{review.author}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[review.status]}`}
                      >
                        {STATUS_LABELS[review.status]}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A695D] mt-0.5">
                      Товар: <span className="font-mono text-[#33261D] font-medium">{review.product_id}</span> · {formatDate(review.created_at)}
                    </p>
                    <div className="flex items-center gap-0.5 text-[#E2A69B] mt-1.5" aria-label={`Оценка ${review.rating} из 5`}>
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-[#33261D] mt-2.5 max-w-2xl leading-relaxed bg-[#FAF6F0]/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none">
                      {review.comment}
                    </p>
                  </div>

                  <div className="flex items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 border-t border-[#F0E9E1] sm:border-0 shrink-0">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleSetStatus(review, 'approved')}
                        disabled={actioningId === review.id}
                        className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer border border-green-200/60"
                      >
                        <Check className="w-4 h-4" /> <span>Одобрить</span>
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => handleSetStatus(review, 'rejected')}
                        disabled={actioningId === review.id}
                        className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer border border-red-200/60"
                      >
                        <X className="w-4 h-4" /> <span>Отклонить</span>
                      </button>
                    )}
                    <button
                      onClick={() => setPendingDeleteId(review.id)}
                      className="min-h-[44px] min-w-[44px] p-2 text-[#7A695D] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 border border-transparent hover:border-red-200/60"
                      title="Удалить"
                      aria-label="Удалить отзыв"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {pendingDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-safe"
          role="presentation"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => (deleting ? null : setPendingDeleteId(null))}
            role="presentation"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-dialog-title"
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 sm:p-6 border border-[#E8E0D5]"
          >
            <h3 id="delete-review-dialog-title" className="text-sm font-bold text-[#33261D] mb-2">Удалить отзыв?</h3>
            <p className="text-xs text-[#7A695D] leading-relaxed mb-4">Действие необратимо.</p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                disabled={deleting}
                className="min-h-[44px] px-4 py-2 border border-[#E8E0D5] text-xs font-bold text-[#7A695D] rounded-xl hover:bg-[#FAF6F0] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="min-h-[44px] px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
              >
                {deleting ? 'Удаляем...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
