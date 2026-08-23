import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  PackageX,
  ImageOff,
} from 'lucide-react';
import { navigate } from '../navigation';
import { formatPrice } from '../../utils/format';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';
import {
  AdminProductListItem,
  AdminProductRow,
  AdminVariantRow,
  fetchAdminProducts,
  fetchAdminProductVariants,
  deleteAdminProduct,
  AdminProductsError,
} from './adminProducts';
import { AdminProductForm } from './AdminProductForm';

const CATEGORY_LABELS: Record<string, string> = {
  girls: 'Девочкам',
  boys: 'Мальчикам',
  babies: 'Малышам',
  accessories: 'Аксессуары',
};

type View =
  | { mode: 'list' }
  | { mode: 'create' }
  | { mode: 'edit'; product: AdminProductRow; variants: AdminVariantRow[] };

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>({ mode: 'list' });
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load admin products:', err);
      setError(err instanceof AdminProductsError ? err.message : 'Не удалось загрузить товары.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const openCreate = () => setView({ mode: 'create' });

  const openEdit = async (product: AdminProductListItem) => {
    setEditLoadingId(product.id);
    setError('');
    try {
      const variants = await fetchAdminProductVariants(product.id);
      setView({ mode: 'edit', product, variants });
    } catch (err) {
      console.error('Failed to load product variants:', err);
      setError(err instanceof AdminProductsError ? err.message : 'Не удалось загрузить товар для редактирования.');
    } finally {
      setEditLoadingId(null);
    }
  };

  const backToList = () => {
    setError('');
    setView({ mode: 'list' });
  };

  const handleSaved = (message: string) => {
    setView({ mode: 'list' });
    setSuccessMessage(message);
    loadProducts();
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAdminProduct(pendingDeleteId);
      setPendingDeleteId(null);
      setSuccessMessage('Товар удалён.');
      loadProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      setDeleteError(err instanceof AdminProductsError ? err.message : 'Не удалось удалить товар.');
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

  return (
    <div className="min-h-screen bg-[#F7F1E5]">
      <header className="bg-white border-b border-[#E8E0D5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => (view.mode === 'list' ? navigate('/admin') : backToList())}
            className="flex items-center gap-1.5 text-xs font-bold text-[#7A695D] hover:text-[#33261D] transition-colors min-h-[40px] px-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {view.mode === 'list' ? 'Дашборд' : 'К списку товаров'}
          </button>
          <div className="w-px h-5 bg-[#E8E0D5]" />
          <h1 className="font-serif text-lg font-bold text-[#33261D]">Товары</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {successMessage && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-xs font-medium">{successMessage}</p>
          </div>
        )}

        {view.mode === 'create' && (
          <AdminProductForm
            onCancel={backToList}
            onSaved={() => handleSaved('Товар успешно создан.')}
          />
        )}

        {view.mode === 'edit' && (
          <AdminProductForm
            initialProduct={view.product}
            initialVariants={view.variants}
            onCancel={backToList}
            onSaved={() => handleSaved('Изменения сохранены.')}
          />
        )}

        {view.mode === 'list' && (
          <>
            <div className="flex items-center justify-between gap-3 mb-5">
              <p className="text-xs text-[#7A695D]">
                {loading ? 'Загрузка...' : `Всего товаров: ${products.length}`}
              </p>
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 bg-[#4A3A0B] text-white text-xs font-bold rounded-xl hover:bg-[#2C2008] active:scale-[0.99] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить товар</span>
              </button>
            </div>

            {error && (
              <div className="mb-5 flex items-start justify-between gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={loadProducts}
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
            ) : products.length === 0 ? (
              error ? null : (
                <div className="bg-white rounded-2xl border border-[#E8E0D5] p-10 flex flex-col items-center text-center gap-2">
                  <PackageX className="w-8 h-8 text-[#E2A69B]" />
                  <p className="text-sm font-semibold text-[#33261D]">Товаров пока нет</p>
                  <p className="text-xs text-[#7A695D]">Нажмите «Добавить товар», чтобы создать первый.</p>
                </div>
              )
            ) : (
              <>
                {/* Mobile Cards List (< md) */}
                <div className="md:hidden space-y-3.5">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-[#E8E0D5] shadow-xs p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {p.images[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-14 h-14 rounded-xl object-cover bg-[#F8EBE8] border border-[#E8E0D5]/60 shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-[#F8EBE8] text-[#E2A69B] flex items-center justify-center shrink-0 border border-[#E8E0D5]/60">
                            <ImageOff className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-[#33261D] leading-snug line-clamp-2">{p.name}</h4>
                          <p className="text-[11px] text-[#7A695D] mt-0.5">
                            {CATEGORY_LABELS[p.category_id] ?? p.category_id}
                            {p.subcategory ? ` · ${p.subcategory}` : ''}
                          </p>
                          <p className="text-[10px] text-[#8A786A] font-mono mt-0.5">{p.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F0E9E1] text-xs">
                        <div>
                          <span className="text-[11px] text-[#8A786A] block">Цена:</span>
                          <span className="text-sm font-bold text-[#33261D]">{formatPrice(p.price)} сомони</span>
                          {p.old_price != null && (
                            <span className="text-[11px] text-[#7A695D] line-through ml-1.5">
                              {formatPrice(p.old_price)} сомони
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-[#8A786A] block">Остаток:</span>
                          <span className="font-semibold text-[#33261D]">{p.variantCount} вар. · {p.totalStock} шт.</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {p.is_new && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F8EBE8] text-[#E2A69B]">
                            Новинка
                          </span>
                        )}
                        {p.is_hit && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FDF3E0] text-[#B8860B]">
                            Хит
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            p.in_stock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {p.in_stock ? 'В наличии' : 'Нет в наличии'}
                        </span>
                        {p.lowStockVariantCount > 0 && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            Мало: {p.lowStockVariantCount} вар.
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#F0E9E1] flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          disabled={editLoadingId === p.id}
                          className="flex-1 min-h-[44px] px-4 py-2 bg-[#FAF6F0] hover:bg-[#F3ECE0] active:scale-[0.99] text-[#33261D] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border border-[#E8E0D5]/80"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#7A695D]" />
                          <span>{editLoadingId === p.id ? 'Загрузка...' : 'Редактировать'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeleteError('');
                            setPendingDeleteId(p.id);
                          }}
                          className="min-h-[44px] min-w-[44px] px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors flex items-center justify-center cursor-pointer border border-red-200/60"
                          title="Удалить"
                          aria-label="Удалить товар"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block bg-white rounded-2xl border border-[#E8E0D5] shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[860px]">
                    <thead>
                      <tr className="border-b border-[#E8E0D5] bg-[#FAF6F0]">
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Товар</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Категория</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Цена</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Остаток</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide">Статус</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-[#7A695D] uppercase tracking-wide text-right">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-[#E8E0D5] last:border-0 hover:bg-[#FAF6F0]/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.images[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-11 h-11 rounded-lg object-cover bg-[#F8EBE8] shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-[#F8EBE8] text-[#E2A69B] flex items-center justify-center shrink-0">
                                  <ImageOff className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#33261D] truncate max-w-[220px]">{p.name}</p>
                                <p className="text-[11px] text-[#7A695D]">{p.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#33261D]">
                            {CATEGORY_LABELS[p.category_id] ?? p.category_id}
                            <div className="text-[11px] text-[#7A695D]">{p.subcategory}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="font-semibold text-[#33261D]">{formatPrice(p.price)} сомони</span>
                            {p.old_price != null && (
                              <div className="text-[11px] text-[#7A695D] line-through">{formatPrice(p.old_price)} сомони</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#33261D]">
                            <div>{p.variantCount} вар. · {p.totalStock} шт.</div>
                            <div
                              className={`text-[11px] font-semibold ${
                                p.totalStock <= 0
                                  ? 'text-red-600'
                                  : p.lowStockVariantCount > 0
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                              }`}
                            >
                              {p.totalStock <= 0
                                ? 'Нет в наличии'
                                : p.lowStockVariantCount > 0
                                  ? `Мало: ${p.lowStockVariantCount} вар.`
                                  : 'В наличии'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {p.is_new && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F8EBE8] text-[#E2A69B]">
                                  Новинка
                                </span>
                              )}
                              {p.is_hit && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FDF3E0] text-[#B8860B]">
                                  Хит
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  p.in_stock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {p.in_stock ? 'В наличии' : 'Нет в наличии'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(p)}
                                disabled={editLoadingId === p.id}
                                className="p-2 text-[#7A695D] hover:text-[#E2A69B] transition-colors disabled:opacity-50 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Редактировать"
                                aria-label="Редактировать"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteError('');
                                  setPendingDeleteId(p.id);
                                }}
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
            aria-labelledby="delete-product-dialog-title"
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 sm:p-6 border border-[#E8E0D5]"
          >
            <h3 id="delete-product-dialog-title" className="text-sm font-bold text-[#33261D] mb-2">Удалить товар?</h3>
            <p className="text-xs text-[#7A695D] leading-relaxed mb-4">
              Товар «{pendingDeleteId}» и все его варианты (цвета/размеры) будут удалены безвозвратно.
            </p>
            {deleteError && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed">{deleteError}</p>
              </div>
            )}
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
