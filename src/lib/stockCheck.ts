import { supabase } from './supabase';
import { CartItem } from '../types';

/** Matches the server-side quantity cap in `create_order_secure()`. */
export const MAX_CART_QUANTITY = 100;

/** Highest quantity a customer may request for a variant, given live stock. */
export function maxPurchasableQty(availableQty: number): number {
  return Math.max(0, Math.min(availableQty, MAX_CART_QUANTITY));
}

/**
 * Result of checking one cart item's stock availability against the live
 * database. This is an **advisory** check only — the authoritative guard
 * remains inside `create_order_secure()` on the server.
 */
export interface StockStatus {
  /** Cart-item ID (`product.id-colorName-size`). */
  cartItemId: string;
  /** Human-readable product name for UI messages. */
  productName: string;
  colorName: string;
  size: string;
  /** Quantity currently in the cart. */
  requestedQty: number;
  /** Live stock quantity from `product_variants`. */
  availableQty: number;
  /** `true` when `availableQty >= requestedQty`. */
  isAvailable: boolean;
  /** `true` when `availableQty` is 0 (or the variant row is missing). */
  isOutOfStock: boolean;
}

/**
 * Queries the current `stock_quantity` for every variant present in the
 * cart and returns a per-item availability status.
 *
 * Uses a single Supabase query filtered by the product IDs in the cart,
 * then matches each cart item to its variant row client-side.
 *
 * Does NOT modify any data and does NOT require new RLS grants —
 * `product_variants` is already readable by `anon`.
 */
export async function checkCartStock(cartItems: CartItem[]): Promise<StockStatus[]> {
  if (cartItems.length === 0) return [];

  const productIds = [...new Set(cartItems.map((item) => item.product.id))];

  const { data: variants, error } = await supabase
    .from('product_variants')
    .select('product_id, color_name, color_hex, size, stock_quantity')
    .in('product_id', productIds);

  if (error) throw error;

  return cartItems.map((item) => {
    const variant = (variants ?? []).find(
      (v) =>
        v.product_id === item.product.id &&
        v.color_name === item.selectedColor.name &&
        v.color_hex === item.selectedColor.hex &&
        v.size === item.selectedSize
    );

    const availableQty = variant?.stock_quantity ?? 0;
    const allowedQty = maxPurchasableQty(availableQty);

    return {
      cartItemId: item.id,
      productName: item.product.name,
      colorName: item.selectedColor.name,
      size: item.selectedSize,
      requestedQty: item.quantity,
      availableQty,
      isAvailable: item.quantity > 0 && item.quantity <= allowedQty,
      isOutOfStock: availableQty <= 0,
    };
  });
}
