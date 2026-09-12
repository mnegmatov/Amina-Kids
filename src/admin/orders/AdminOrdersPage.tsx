import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Loader2, Package, RefreshCw, ShoppingBag, User, X } from 'lucide-react';
import { navigate } from '../navigation';
import { formatPrice } from '../../utils/format';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';
import { AnimatePresence, motion } from 'motion/react';
import {
  AdminOrder,
  AdminOrderItem,
  DELIVERY_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  OrderStatus,
  PAYMENT_LABELS,
  fetchAdminOrderItems,
  fetchAdminOrders,
  updateAdminOrderStatus,
} from './adminOrders';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-[#FFF3D8] text-[#8B6508]',
  confirmed: 'bg-[#EAF3FF] text-[#31689E]',
  packing: 'bg-[#F3ECFF] text-[#7651A8]',
  shipped: 'bg-[#E8F5F0] text-[#317A61]',
  delivered: 'bg-[#E5F6E9] text-[#2F7A43]',
  cancelled: 'bg-[#FCE9E7] text-[#A14D46]',
};

function formatDate(value: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function shortId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [items, setItems] = useState<AdminOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState('');
  const [itemsError, setItemsError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await fetchAdminOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useBodyScrollLock(Boolean(selectedOrder));

  useEffect(() => {
    if (!selectedOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOrder]);

  const openOrder = async (order: AdminOrder) => {
    setSelectedOrder(order);
    setItems([]);
    setItemsError('');
    setItemsLoading(true);
    try {
      setItems(await fetchAdminOrderItems(order.id));
    } catch (err) {
      setItemsError(err instanceof Error ? err.message : 'Не удалось загрузить товары заказа');
    } finally {
      setItemsLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = filter === 'all' || order.status === filter;
      const matchesSearch = !query || [order.id, order.full_name, order.phone, order.email ?? '']
        .some((value) => value.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [filter, orders, search]);

  const changeStatus = async (status: OrderStatus) => {
    if (!selectedOrder || status === selectedOrder.status) return;
    setStatusSaving(true);
    try {
      await updateAdminOrderStatus(selectedOrder.id, status);
      const updated = { ...selectedOrder, status };
      setSelectedOrder(updated);
      setOrders((current) => current.map((order) => order.id === updated.id ? updated : order));
    } catch (err) {
      setItemsError(err instanceof Error ? err.message : 'Не удалось изменить статус заказа');
    } finally {
      setStatusSaving(false);
    }
  };

  useBodyScrollLock(selectedOrder !== null);

  useEffect(() => {
    if (!selectedOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOrder]);

  return (
    <div className="min-h-screen bg-[#F7F1E5]">
      <header className="bg-white border-b border-[#E8E0D5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-xs font-bold text-[#7A695D] hover:text-[#33261D]"
          >
            <ArrowLeft className="w-4 h-4" />
            Админка
          </button>
          <h1 className="font-serif text-lg font-bold text-[#33261D]">Заказы</h1>
          <button
            onClick={() => void loadOrders()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E8E0D5] rounded-xl text-xs font-bold text-[#7A695D] hover:bg-[#FAF6F0] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по имени, телефону или ID..."
            className="flex-1 px-4 py-3 min-h-[44px] rounded-xl border border-[#E8E0D5] bg-white text-sm text-[#33261D] outline-none focus:border-[#E2A69B]"
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as 'all' | OrderStatus)}
            className="px-4 py-3 min-h-[44px] rounded-xl border border-[#E8E0D5] bg-white text-sm text-[#33261D] outline-none cursor-pointer"
          >
            <option value="all">Все статусы</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-5 bg-white border border-[#E8D1CD] rounded-2xl p-5 text-sm text-[#8D4D47]">
            <p className="font-bold mb-2">Не удалось загрузить заказы</p>
            <p className="text-xs mb-3 break-words">{error}</p>
            <button onClick={() => void loadOrders()} className="min-h-[40px] px-4 py-2 rounded-lg bg-[#F8EBE8] text-[#8D4D47] text-xs font-bold cursor-pointer">
              Повторить
            </button>
          </div>
        )}

        <div className="bg-white border border-[#E8E0D5] rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center text-[#E2A69B]"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center px-4">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-[#D9CCC0]" />
              <p className="font-bold text-[#33261D]">Заказов не найдено</p>
              <p className="text-xs text-[#7A695D] mt-1">Попробуй изменить фильтр или поисковый запрос.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View (< md) */}
              <div className="md:hidden divide-y divide-[#F0E9E1]">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => void openOrder(order)}
                    className="p-4 space-y-3 active:bg-[#FAF6F0]/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#33261D]">{shortId(order.id)}</span>
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#33261D]">{order.full_name || 'Без имени'}</p>
                      <p className="text-xs text-[#8A786A] mt-0.5">{order.phone || 'Телефон не указан'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#F0E9E1]/80 text-xs">
                      <div>
                        <span className="text-[11px] text-[#8A786A] block">Сумма:</span>
                        <span className="text-sm font-bold text-[#4A3A0B]">{formatPrice(order.total_amount)} сомони</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-[#8A786A] block">{formatDate(order.created_at)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void openOrder(order);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#E2A69B] hover:text-[#C88B80] mt-0.5"
                        >
                          Открыть <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF6F0] border-b border-[#E8E0D5]">
                    <tr className="text-[10px] uppercase tracking-wide text-[#8A786A]">
                      <th className="px-5 py-3">Заказ</th>
                      <th className="px-5 py-3">Клиент</th>
                      <th className="px-5 py-3">Сумма</th>
                      <th className="px-5 py-3">Статус</th>
                      <th className="px-5 py-3">Дата</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E9E1]">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FFFCF8]">
                        <td className="px-5 py-4 text-sm font-bold text-[#33261D]">{shortId(order.id)}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#33261D]">{order.full_name || 'Без имени'}</p>
                          <p className="text-xs text-[#8A786A]">{order.phone || 'Телефон не указан'}</p>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-[#33261D]">{formatPrice(order.total_amount)} сомони</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-[#7A695D] whitespace-nowrap">{formatDate(order.created_at)}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => void openOrder(order)} className="min-h-[40px] px-3 inline-flex items-center gap-1 text-xs font-bold text-[#7A695D] hover:text-[#33261D] cursor-pointer">
                            Открыть <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 p-0 sm:p-6 flex justify-end"
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-drawer-title"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="w-full sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl overflow-y-auto max-h-screen flex flex-col z-10"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white border-b border-[#E8E0D5] px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#8A786A]">Заказ</p>
                  <h2 id="order-drawer-title" className="font-serif text-lg font-bold text-[#33261D]">{shortId(selectedOrder.id)}</h2>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2.5 rounded-xl hover:bg-[#FAF6F0] text-[#7A695D] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  aria-label="Закрыть детали заказа"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 pb-safe pb-8 sm:pb-6 space-y-5 flex-1">
                <section>
                  <div className="flex items-center gap-2 mb-2.5 text-[#33261D]"><User className="w-4 h-4" /><h3 className="text-sm font-bold">Клиент</h3></div>
                  <div className="bg-[#FAF6F0] rounded-xl p-3.5 sm:p-4 text-sm space-y-1">
                    <p className="font-bold text-[#33261D]">{selectedOrder.full_name}</p>
                    <p className="text-[#7A695D]">{selectedOrder.phone}</p>
                    {selectedOrder.email && <p className="text-[#7A695D] break-all">{selectedOrder.email}</p>}
                    <p className="text-[#7A695D]">{selectedOrder.city}{selectedOrder.address ? `, ${selectedOrder.address}` : ''}</p>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-2.5 text-[#33261D]"><Package className="w-4 h-4" /><h3 className="text-sm font-bold">Товары</h3></div>
                  {itemsLoading ? (
                    <div className="py-8 flex justify-center text-[#E2A69B]"><Loader2 className="w-5 h-5 animate-spin" /></div>
                  ) : itemsError ? (
                    <p className="text-xs text-[#A14D46] bg-[#FCE9E7] rounded-xl p-3 break-words">{itemsError}</p>
                  ) : (
                    <div className="space-y-2">
                      {items.length === 0 ? <p className="text-xs text-[#7A695D]">Товары заказа не найдены.</p> : items.map((item) => (
                        <div key={String(item.id)} className="border border-[#E8E0D5] rounded-xl p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#CDBEB1]"><Package className="w-4 h-4" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#33261D] truncate">{item.product_name}</p>
                            <p className="text-[11px] text-[#8A786A]">{item.color_name} · {item.size} · {item.quantity} шт.</p>
                          </div>
                          <p className="text-sm font-bold text-[#33261D] whitespace-nowrap">{formatPrice(item.total_price)} сомони</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-sm font-bold text-[#33261D] mb-2.5">Доставка и оплата</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-[#FAF6F0] rounded-xl p-3"><span className="text-[#8A786A] block mb-1">Доставка</span><b className="text-[#33261D]">{DELIVERY_LABELS[selectedOrder.delivery_method] ?? selectedOrder.delivery_method}</b></div>
                    <div className="bg-[#FAF6F0] rounded-xl p-3"><span className="text-[#8A786A] block mb-1">Оплата</span><b className="text-[#33261D]">{PAYMENT_LABELS[selectedOrder.payment_method] ?? selectedOrder.payment_method}</b></div>
                  </div>
                  {selectedOrder.comment && <div className="mt-2.5 bg-[#FAF6F0] rounded-xl p-3 text-xs text-[#7A695D]"><b className="text-[#33261D]">Комментарий:</b> {selectedOrder.comment}</div>}
                  {selectedOrder.promo_code && <div className="mt-2 text-xs text-[#7A695D]">Промокод: <b>{selectedOrder.promo_code}</b></div>}
                </section>

                <section className="border-t border-[#E8E0D5] pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[#7A695D]"><span>Товары</span><span>{formatPrice(selectedOrder.subtotal)} сомони</span></div>
                    <div className="flex justify-between text-[#7A695D]"><span>Скидка</span><span>−{formatPrice(selectedOrder.discount_amount)} сомони</span></div>
                    <div className="flex justify-between text-[#7A695D]"><span>Доставка</span><span>{formatPrice(selectedOrder.delivery_amount)} сомони</span></div>
                    <div className="flex justify-between text-base font-bold text-[#33261D] pt-2 border-t border-[#E8E0D5]/60"><span>Итого</span><span>{formatPrice(selectedOrder.total_amount)} сомони</span></div>
                  </div>
                </section>

                <section className="pt-2">
                  <h3 className="text-sm font-bold text-[#33261D] mb-2">Статус заказа</h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(event) => void changeStatus(event.target.value as OrderStatus)}
                    disabled={statusSaving}
                    className="w-full px-4 py-3 min-h-[46px] rounded-xl border border-[#E8E0D5] bg-white text-sm font-semibold text-[#33261D] outline-none focus:border-[#E2A69B] disabled:opacity-50 cursor-pointer"
                  >
                    {ORDER_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}
                  </select>
                  {statusSaving && <p className="mt-2 text-xs text-[#8A786A]">Сохраняем статус…</p>}
                </section>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
