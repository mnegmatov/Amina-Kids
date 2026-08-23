import { supabase } from '../../lib/supabase';

export type OrderStatus = 'pending' | 'confirmed' | 'packing' | 'shipped' | 'delivered' | 'cancelled';

export interface AdminOrder {
  id: string;
  customer_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  city: string;
  address: string | null;
  delivery_method: string;
  payment_method: string;
  comment: string | null;
  promo_code: string | null;
  subtotal: number;
  discount_amount: number;
  delivery_amount: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}

export interface AdminOrderItem {
  id: number | string;
  order_id: string;
  product_id: string;
  product_name: string;
  color_name: string;
  color_hex: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Новый',
  confirmed: 'Подтверждён',
  packing: 'Собирается',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export const ORDER_STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export const DELIVERY_LABELS: Record<string, string> = {
  courier: 'Курьер',
  pickup: 'Самовывоз',
  showroom: 'Шоурум',
};

export const PAYMENT_LABELS: Record<string, string> = {
  card: 'Карта',
  cash: 'Наличные',
};

function normalizeOrder(row: Record<string, unknown>): AdminOrder {
  return {
    id: String(row.id),
    customer_id: row.customer_id ? String(row.customer_id) : null,
    full_name: String(row.full_name ?? ''),
    phone: String(row.phone ?? ''),
    email: row.email ? String(row.email) : null,
    city: String(row.city ?? ''),
    address: row.address ? String(row.address) : null,
    delivery_method: String(row.delivery_method ?? ''),
    payment_method: String(row.payment_method ?? ''),
    comment: row.comment ? String(row.comment) : null,
    promo_code: row.promo_code ? String(row.promo_code) : null,
    subtotal: Number(row.subtotal ?? 0),
    discount_amount: Number(row.discount_amount ?? 0),
    delivery_amount: Number(row.delivery_amount ?? 0),
    total_amount: Number(row.total_amount ?? 0),
    status: String(row.status ?? 'pending') as OrderStatus,
    created_at: String(row.created_at ?? ''),
  };
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_id, full_name, phone, email, city, address, delivery_method, payment_method, comment, promo_code, subtotal, discount_amount, delivery_amount, total_amount, status, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => normalizeOrder(row as Record<string, unknown>));
}

export async function fetchAdminOrderItems(orderId: string): Promise<AdminOrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, product_name, color_name, color_hex, size, quantity, unit_price, total_price')
    .eq('order_id', orderId)
    .order('id', { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminOrderItem[];
}

/**
 * Updates an order's status. `.select().maybeSingle()` after the update is
 * intentional: a plain `.update().eq()` reports no error at all when RLS
 * (or a since-deleted order) blocks the write — Postgres just matches zero
 * rows and Supabase treats that as success. Reading the row back is the
 * only way to confirm the update actually happened.
 */
export async function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select('id')
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(
      'Статус не обновлён: заказ не найден или недостаточно прав. Обновите список и попробуйте снова.'
    );
  }
}
