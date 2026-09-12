import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, AlertCircle, CheckCircle2, Tag } from 'lucide-react';
import { navigate } from '../navigation';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';
import {
  AdminPromoCode,
  AdminPromoCodeInput,
  fetchAdminPromoCodes,
  createAdminPromoCode,
  updateAdminPromoCode,
  setAdminPromoCodeActive,
  deleteAdminPromoCode,
  AdminPromoCodesError,
} from './adminPromoCodes';
import { formatPromoDateInput } from '../../lib/promoCodes';

function emptyForm(): AdminPromoCodeInput {
  return {
    code: '',
    discount_percentage: 10,
    is_active: true,
    expires_at: null,
    usage_limit: null,
  };
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(value)
  );
}

type View = { mode: 'list' } | { mode: 'create' } | { mode: 'edit'; promo: AdminPromoCode };

export const AdminPromoCodesPage: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>({ mode: 'list' });
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState<AdminPromoCodeInput>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadPromoCodes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPromoCodes(await fetchAdminPromoCodes());
    } catch (err) {
      console.error('Failed to load promo codes:', err);
      setError(err instanceof AdminPromoCodesError ? err.message : 'Не удалось загрузить промокоды.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromoCodes();
  }, [loadPromoCodes]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const openCreate = () => {
    setForm(emptyForm());
    setFormError('');
    setView({ mode: 'create' });
  };

  const openEdit = (promo: AdminPromoCode) => {
    setForm({
      code: promo.code,
      discount_percentage: promo.discount_percentage,
      is_active: promo.is_active,
      expires_at: formatPromoDateInput(promo.expires_at) || null,
      usage_limit: promo.usage_limit,
    });
    setFormError('');
    setView({ mode: 'edit', promo });
  };

  const backToList = () => {
    setFormError('');
    setView({ mode: 'list' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedCode = form.code.trim();
    if (!trimmedCode) {
      setFormError('Укажите код промокода.');
      return;
    }
    if (!Number.isFinite(form.discount_percentage) || form.discount_percentage <= 0 || form.discount_percentage > 100) {
      setFormError('Скидка должна быть от 1 до 100%.');
      return;
    }
    if (form.usage_limit != null && (!Number.isFinite(form.usage_limit) || form.usage_limit <= 0)) {
      setFormError('Лимит использований должен быть положительным числом или пустым.');
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      if (view.mode === 'edit') {
        await updateAdminPromoCode(view.promo.id, form);
      } else {
        await createAdminPromoCode(form);
      }
      setView({ mode: 'list' });
      setSuccessMessage(view.mode === 'edit' ? 'Промокод обновлён.' : 'Промокод создан.');
      loadPromoCodes();
    } catch (err) {
      console.error('Failed to save promo code:', err);
      setFormError(err instanceof AdminPromoCodesError ? err.message : 'Не удалось сохранить промокод.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (promo: AdminPromoCode) => {
    setTogglingId(promo.id);
    try {
      await setAdminPromoCodeActive(promo.id, !promo.is_active);
      loadPromoCodes();
    } catch (err) {
      console.error('Failed to toggle promo code:', err);
      setError(err instanceof AdminPromoCodesError ? err.message : 'Не удалось изменить статус промокода.');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await deleteAdminPromoCode(pendingDeleteId);
      setPendingDeleteId(null);
      setSuccessMessage('Промокод удалён.');
      loadPromoCodes();
    } catch (err) {
      console.error('Failed to delete promo code:', err);
      setError(err instanceof AdminPromoCodesError ? err.message : 'Не удалось удалить промокод.');
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

  const inputClass =
    'w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#E8E0D5] text-sm text-[#33261D] focus:outline-none focus:border-[#E2A69B] transition-colors';
  const labelClass = 'block text-[11px] font-bold text-[#7A695D] uppercase tracking-wide mb-1.5';

  return (
    <div className="min-h-screen bg-[#F7F1E5]">
      <header className="bg-white border-b border-[#E8E0D5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => (view.mode === 'list' ? navigate('/admin') : backToList())}
            className="flex items-center gap-1.5 text-xs font-bold text-[#7A695D] hover:text-[#33261D] transition-colors min-h-[40px] px-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {view.mode === 'list' ? 'Дашборд' : 'К списку промокодов'}
          </button>
          <div className="w-px h-5 bg-[#E8E0D5]" />
          <h1 className="font-serif text-lg font-bold text-[#33261D]">Промокоды</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {successMessage && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-xs font-medium">{successMessage}</p>
          </div>
        )}

        {(view.mode === 'create' || view.mode === 'edit') && (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E0D5] shadow-sm p-5 sm:p-6 space-y-5 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className={labelClass}>Код</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER15"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Скидка, %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.discount_percentage}
                  onChange={(e) => setForm({ ...form, discount_percentage: parseFloat(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Действует до (необязательно)</label>
                <input
                  type="date"
                  value={form.expires_at ?? ''}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value || null })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Лимит использований (необязательно)</label>
                <input
                  type="number"
                  min="1"
                  value={form.usage_limit ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, usage_limit: e.target.value ? parseInt(e.target.value, 10) : null })
                  }
                  placeholder="Без ограничений"
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-[#33261D] cursor-pointer w-fit min-h-[44px] py-1">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 accent-[#E2A69B] cursor-pointer"
              />
              <span className="font-medium">Активен</span>
            </label>

            {formError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed">{formError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E0D5]">
              <button
                type="button"
                onClick={backToList}
                disabled={submitting}
                className="min-h-[44px] px-5 py-2.5 border border-[#E8E0D5] text-xs font-bold text-[#7A695D] rounded-xl hover:bg-[#FAF6F0] hover:text-[#33261D] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[44px] px-6 py-2.5 bg-[#4A3A0B] text-white text-xs font-bold rounded-xl hover:bg-[#2C2008] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {submitting ? 'Сохраняем...' : view.mode === 'edit' ? 'Сохранить изменения' : 'Создать промокод'}
              </button>
            </div>
          </form>
        )}

        {view.mode === 'list' && (
          <>
            <div className="flex items-center justify-between gap-3 mb-5">
              <p className="text-xs text-[#7A695D]">
                {loading ? 'Загрузка...' : `Всего промокодов: ${promoCodes.length}`}
              </p>
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 bg-[#4A3A0B] text-white text-xs font-bold rounded-xl hover:bg-[#2C2008] active:scale-[0.99] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить промокод</span>
              </button>
            </div>

            {error && (
              <div className="mb-5 flex items-start justify-between gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={loadPromoCodes}
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
            ) : promoCodes.length === 0 ? (
              error ? null : (
                <div className="bg-white rounded-2xl border border-[#E8E0D5] p-10 flex flex-col items-center text-center gap-2">
                  <Tag className="w-8 h-8 text-[#E2A69B]" />
                  <p className="text-sm font-semibold text-[#33261D]">Промокодов пока нет</p>
                  <p className="text-xs text-[#7A695D]">Нажмите «Добавить промокод», чтобы создать первый.</p>
                </div>
              )
            ) : (
              <>
                {/* Mobile Cards List (< md) */}
                <div className="md:hidden space-y-3">
                  {promoCodes.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-[#E8E0D5] shadow-xs p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#E2A69B]" />
                          <span className="text-sm font-bold font-mono text-[#33261D]">{p.code}</span>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F8EBE8] text-[#A14D46]">
                          -{p.discount_percentage}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F0E9E1]">
                        <div>
                          <span className="text-[11px] text-[#8A786A] block">Действует до:</span>
                          <span className="text-[#33261D] font-medium">{formatDate(p.expires_at)}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#8A786A] block">Использовано:</span>
                          <span className="text-[#33261D] font-medium">
                            {p.usage_count}
                            {p.usage_limit != null ? ` / ${p.usage_limit}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F0E9E1] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleActive(p)}
                          disabled={togglingId === p.id}
                          className={`min-h-[40px] px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 ${
                            p.is_active
                              ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200/60'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60'
                          }`}
                          title="Нажмите, чтобы изменить статус"
                        >
                          {togglingId === p.id ? 'Обновляем...' : p.is_active ? 'Активен' : 'Отключён'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="min-h-[40px] min-w-[40px] p-2 text-[#7A695D] hover:text-[#E2A69B] hover:bg-[#FAF6F0] rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                            title="Редактировать"
                            aria-label="Редактировать промокод"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(p.id)}
                            className="min-h-[40px] min-w-[40px] p-2 text-[#7A695D] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                            title="Удалить"
                            aria-label="Удалить промокод"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block bg-white rounded-2xl border border-[#E8E0D5] shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[760px]">
                    <thead>
                      <tr className="border-b border-[#E8E0D5] bg-[#FAF6F0]">
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Код</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Скидка</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Действует до</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Использовано</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Статус</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoCodes.map((p) => (
                        <tr key={p.id} className="border-b border-[#E8E0D5] last:border-0 hover:bg-[#FAF6F0]/50">
                          <td className="px-4 py-3 text-sm font-bold text-[#33261D]">{p.code}</td>
                          <td className="px-4 py-3 text-xs text-[#33261D]">-{p.discount_percentage}%</td>
                          <td className="px-4 py-3 text-xs text-[#7A695D]">{formatDate(p.expires_at)}</td>
                          <td className="px-4 py-3 text-xs text-[#7A695D]">
                            {p.usage_count}
                            {p.usage_limit != null ? ` / ${p.usage_limit}` : ''}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleActive(p)}
                              disabled={togglingId === p.id}
                              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 cursor-pointer ${
                                p.is_active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                              title="Нажмите, чтобы изменить статус"
                            >
                              {p.is_active ? 'Активен' : 'Отключён'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(p)}
                                className="p-2 text-[#7A695D] hover:text-[#E2A69B] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Редактировать"
                                aria-label="Редактировать"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setPendingDeleteId(p.id)}
                                className="p-2 text-[#7A695D] hover:text-red-500 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Удалить"
                                aria-label="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
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
            aria-labelledby="delete-promo-dialog-title"
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 sm:p-6 border border-[#E8E0D5]"
          >
            <h3 id="delete-promo-dialog-title" className="text-sm font-bold text-[#33261D] mb-2">Удалить промокод?</h3>
            <p className="text-xs text-[#7A695D] leading-relaxed mb-4">
              Действие необратимо. Уже оформленные заказы с этим промокодом не изменятся.
            </p>
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
