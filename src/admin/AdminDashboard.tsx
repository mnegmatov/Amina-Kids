import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Package, ShoppingBag, Users, Star, LogOut, AlertTriangle, Boxes, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from './navigation';
import { formatPrice } from '../utils/format';
import { AdminStockSummary, fetchAdminStockSummary } from './products/adminProducts';
import { AdminOrderStats, fetchAdminOrderStats } from './adminAnalytics';

interface AdminDashboardProps {
  user: User | null;
}

const SECTIONS = [
  {
    title: 'Товары',
    description: 'Каталог, цены, варианты и остатки',
    icon: Package,
    path: '/admin/products',
  },
  {
    title: 'Заказы',
    description: 'Просмотр и статусы заказов',
    icon: ShoppingBag,
    path: '/admin/orders',
  },
  {
    title: 'Промокоды',
    description: 'Скидки, сроки действия, лимиты',
    icon: Tag,
    path: '/admin/promo-codes',
  },
  {
    title: 'Клиенты',
    description: 'База клиентов магазина',
    icon: Users,
    path: null,
  },
  {
    title: 'Отзывы',
    description: 'Модерация отзывов о товарах',
    icon: Star,
    path: '/admin/reviews',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [stock, setStock] = useState<AdminStockSummary | null>(null);
  const [orderStats, setOrderStats] = useState<AdminOrderStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminStockSummary()
      .then((summary) => {
        if (!cancelled) setStock(summary);
      })
      .catch(() => {
        if (!cancelled) setStock(null);
      });
    fetchAdminOrderStats()
      .then((stats) => {
        if (!cancelled) setOrderStats(stats);
      })
      .catch(() => {
        if (!cancelled) setOrderStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F1E5]">
      <header className="bg-white border-b border-[#E8E0D5]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold text-[#33261D]">Amina Kids Admin</h1>
            {user?.email && <p className="text-[11px] text-[#7A695D]">{user.email}</p>}
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E0D5] text-[#7A695D] text-xs font-bold rounded-xl hover:bg-[#FAF6F0] hover:text-[#33261D] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {orderStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A695D] mb-1">Заказов всего</p>
              <p className="text-2xl font-bold text-[#33261D]">{orderStats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-1">Новые</p>
              <p className="text-2xl font-bold text-amber-800">{orderStats.pendingOrders}</p>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 mb-1">Доставлено</p>
              <p className="text-2xl font-bold text-emerald-800">{orderStats.completedOrders}</p>
            </div>
            <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-red-600 mb-1">Отменено</p>
              <p className="text-2xl font-bold text-red-700">{orderStats.cancelledOrders}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A695D] mb-1">Выручка всего</p>
              <p className="text-xl font-bold text-[#4A3A0B]">{formatPrice(orderStats.revenue)} сомони</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A695D] mb-1">Выручка сегодня</p>
              <p className="text-xl font-bold text-[#4A3A0B]">{formatPrice(orderStats.revenueToday)} сомони</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A695D] mb-1">Выручка за месяц</p>
              <p className="text-xl font-bold text-[#4A3A0B]">{formatPrice(orderStats.revenueThisMonth)} сомони</p>
            </div>
          </div>
        )}

        {stock && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A695D] mb-1">Товары</p>
              <p className="text-2xl font-bold text-[#33261D]">{stock.totalProducts}</p>
            </div>
            <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-red-600 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Нет в наличии
              </p>
              <p className="text-2xl font-bold text-red-700">{stock.productsOutOfStock}</p>
            </div>
            <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-1">Мало (1–3 шт.)</p>
              <p className="text-2xl font-bold text-amber-800">{stock.lowStockVariants}</p>
              <p className="text-[10px] text-[#7A695D] mt-0.5">вариантов</p>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 mb-1 flex items-center gap-1">
                <Boxes className="w-3 h-3" /> Всего единиц
              </p>
              <p className="text-2xl font-bold text-emerald-800">{stock.totalStockUnits}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SECTIONS.map(({ title, description, icon: Icon, path }) => {
            const isActive = !!path;
            return (
              <div
                key={title}
                onClick={() => path && navigate(path)}
                className={`bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-sm transition-all ${
                  isActive
                    ? 'cursor-pointer hover:shadow-md hover:border-[#E2A69B]/40'
                    : 'opacity-90 cursor-default'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#F8EBE8] text-[#E2A69B] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-[#33261D] mb-1">{title}</h2>
                <p className="text-xs text-[#7A695D] leading-relaxed mb-3">{description}</p>
                {isActive ? (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-[#4A3A0B] bg-[#FDF3E0] rounded-full px-2.5 py-1">
                    Открыть
                  </span>
                ) : (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-[#E2A69B] bg-[#F8EBE8] rounded-full px-2.5 py-1">
                    Скоро
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
