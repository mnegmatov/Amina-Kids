import { supabase } from '../lib/supabase';

export interface AdminOrderStats {
  totalOrders: number;
  pendingOrders: number;
  /** `status = 'delivered'`. */
  completedOrders: number;
  cancelledOrders: number;
  /** Sum of `total_amount` for all non-cancelled orders. */
  revenue: number;
  revenueToday: number;
  revenueThisMonth: number;
}

interface OrderStatsRow {
  status: string;
  total_amount: number;
  created_at: string;
}

/**
 * Computes dashboard order/revenue stats client-side from the same
 * `orders` rows the admin already has SELECT access to (see
 * supabase-admin-orders-policies.sql) — no new RLS or SQL needed.
 *
 * Client-side aggregation keeps this simple and fast for the shop's
 * current scale; if the order volume grows large enough for this to
 * matter, the same numbers could move into a SQL view or RPC without
 * changing this function's return shape.
 */
export async function fetchAdminOrderStats(): Promise<AdminOrderStats> {
  const { data, error } = await supabase.from('orders').select('status, total_amount, created_at');

  if (error) throw error;

  const rows = (data ?? []) as OrderStatsRow[];

  const now = new Date();
  const todayKey = now.toDateString();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  let pendingOrders = 0;
  let completedOrders = 0;
  let cancelledOrders = 0;
  let revenue = 0;
  let revenueToday = 0;
  let revenueThisMonth = 0;

  for (const row of rows) {
    const amount = Number(row.total_amount) || 0;
    const createdAt = new Date(row.created_at);

    if (row.status === 'pending') pendingOrders += 1;
    if (row.status === 'delivered') completedOrders += 1;
    if (row.status === 'cancelled') cancelledOrders += 1;

    if (row.status !== 'cancelled') {
      revenue += amount;
      if (createdAt.toDateString() === todayKey) revenueToday += amount;
      if (`${createdAt.getFullYear()}-${createdAt.getMonth()}` === monthKey) revenueThisMonth += amount;
    }
  }

  return {
    totalOrders: rows.length,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    revenue,
    revenueToday,
    revenueThisMonth,
  };
}
