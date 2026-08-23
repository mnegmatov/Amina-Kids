import { supabase } from '../../lib/supabase';

/**
 * Raw `products` row, admin-facing. Unlike the shop's `lib/products.ts`
 * mapping, this keeps category_id/gender/age_group as plain strings
 * instead of silently substituting a fallback for unrecognized values —
 * an admin editing a product should see exactly what's in the database.
 */
export interface AdminProductRow {
  id: string;
  name: string;
  category_id: string;
  subcategory: string;
  price: number;
  old_price: number | null;
  discount: number | null;
  rating: number;
  reviews_count: number;
  is_new: boolean;
  is_hit: boolean;
  in_stock: boolean;
  description: string | null;
  composition: string | null;
  care: string | null;
  gender: string;
  age_group: string;
  images: string[];
}

export interface AdminVariantRow {
  id: number;
  product_id: string;
  color_name: string;
  color_hex: string;
  size: string;
  stock_quantity: number;
}

export interface AdminProductListItem extends AdminProductRow {
  variantCount: number;
  totalStock: number;
  /** Variants with stock 1–3 (low, but not empty). */
  lowStockVariantCount: number;
}

export interface AdminStockSummary {
  totalProducts: number;
  productsOutOfStock: number;
  lowStockVariants: number;
  totalStockUnits: number;
}

/** What the create/edit form submits. `id` is omitted on update. */
export interface AdminProductInput {
  id: string;
  name: string;
  category_id: string;
  subcategory: string;
  price: number;
  old_price: number | null;
  discount: number | null;
  rating: number;
  reviews_count: number;
  is_new: boolean;
  is_hit: boolean;
  in_stock: boolean;
  description: string | null;
  composition: string | null;
  care: string | null;
  gender: string;
  age_group: string;
  images: string[];
}

export interface AdminVariantInput {
  color_name: string;
  color_hex: string;
  size: string;
  stock_quantity: number;
}

interface RawProductRow {
  id: string;
  name: string;
  category_id: string;
  subcategory: string;
  price: number | string;
  old_price: number | string | null;
  discount: number | null;
  rating: number | string;
  reviews_count: number;
  is_new: boolean;
  is_hit: boolean;
  in_stock: boolean;
  description: string | null;
  composition: string | null;
  care: string | null;
  gender: string;
  age_group: string;
  images: unknown;
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function toImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0);
}

function normalizeProductRow(row: RawProductRow): AdminProductRow {
  return {
    id: row.id,
    name: row.name,
    category_id: row.category_id,
    subcategory: row.subcategory,
    price: toNumber(row.price),
    old_price: row.old_price !== null ? toNumber(row.old_price) : null,
    discount: row.discount,
    rating: toNumber(row.rating),
    reviews_count: row.reviews_count ?? 0,
    is_new: row.is_new ?? false,
    is_hit: row.is_hit ?? false,
    in_stock: row.in_stock ?? true,
    description: row.description,
    composition: row.composition,
    care: row.care,
    gender: row.gender,
    age_group: row.age_group,
    images: toImages(row.images),
  };
}

/** Turns a raw/unknown Supabase error into a short, friendly Russian message. */
function toFriendlyMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === '23505') return 'Товар с таким ID уже существует. Выберите другой ID.';
  if (code === '23503') return 'Нельзя выполнить действие: товар связан с другими записями (например, заказами).';
  if (code === '42501' || code === '401') {
    return 'Недостаточно прав. Убедитесь, что ваш аккаунт добавлен в admin_users и в Supabase выполнены нужные RLS-политики.';
  }
  return fallback;
}

export class AdminProductsError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'AdminProductsError';
  }
}

/**
 * Lists all products with a variant/stock summary for the admin table.
 */
export async function fetchAdminProducts(): Promise<AdminProductListItem[]> {
  const [productsResult, variantsResult] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('product_variants').select('product_id, stock_quantity'),
  ]);

  if (productsResult.error) {
    throw new AdminProductsError(
      toFriendlyMessage(productsResult.error, 'Не удалось загрузить список товаров.'),
      productsResult.error
    );
  }
  if (variantsResult.error) {
    throw new AdminProductsError(
      toFriendlyMessage(variantsResult.error, 'Не удалось загрузить варианты товаров.'),
      variantsResult.error
    );
  }

  const rows = (productsResult.data ?? []) as RawProductRow[];
  const variants = (variantsResult.data ?? []) as { product_id: string; stock_quantity: number }[];

  const statsByProduct = new Map<string, { count: number; stock: number; low: number }>();
  for (const v of variants) {
    const qty = v.stock_quantity ?? 0;
    const current = statsByProduct.get(v.product_id) ?? { count: 0, stock: 0, low: 0 };
    current.count += 1;
    current.stock += qty;
    if (qty >= 1 && qty <= 3) current.low += 1;
    statsByProduct.set(v.product_id, current);
  }

  return rows.map((row) => {
    const stats = statsByProduct.get(row.id) ?? { count: 0, stock: 0, low: 0 };
    return {
      ...normalizeProductRow(row),
      variantCount: stats.count,
      totalStock: stats.stock,
      lowStockVariantCount: stats.low,
    };
  });
}

/** Dashboard stock snapshot derived from the same product/variant tables. */
export async function fetchAdminStockSummary(): Promise<AdminStockSummary> {
  const products = await fetchAdminProducts();
  const productsOutOfStock = products.filter((p) => p.totalStock <= 0).length;
  const lowStockVariants = products.reduce((sum, p) => sum + p.lowStockVariantCount, 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.totalStock, 0);

  return {
    totalProducts: products.length,
    productsOutOfStock,
    lowStockVariants,
    totalStockUnits,
  };
}

/** Loads the variant rows for one product, for the edit form. */
export async function fetchAdminProductVariants(productId: string): Promise<AdminVariantRow[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('id', { ascending: true });

  if (error) {
    throw new AdminProductsError(toFriendlyMessage(error, 'Не удалось загрузить варианты товара.'), error);
  }

  return (data ?? []) as AdminVariantRow[];
}

/**
 * Creates a product plus its variants. If the variants insert fails, the
 * just-created product row is rolled back (best-effort) so we don't leave
 * a product with no colors/sizes behind.
 */
export async function createAdminProduct(
  product: AdminProductInput,
  variants: AdminVariantInput[]
): Promise<void> {
  const { error: productError } = await supabase.from('products').insert({
    ...product,
    in_stock: variants.some((v) => v.stock_quantity > 0),
  });

  if (productError) {
    throw new AdminProductsError(toFriendlyMessage(productError, 'Не удалось создать товар.'), productError);
  }

  if (variants.length > 0) {
    const { error: variantsError } = await supabase
      .from('product_variants')
      .insert(variants.map((v) => ({ ...v, product_id: product.id })));

    if (variantsError) {
      try {
        await supabase.from('products').delete().eq('id', product.id);
      } catch {
        // Best-effort cleanup only — surfacing variantsError below either way.
      }
      throw new AdminProductsError(
        toFriendlyMessage(variantsError, 'Товар создан, но не удалось сохранить варианты. Попробуйте снова.'),
        variantsError
      );
    }
  }
}

/**
 * Updates a product's fields and replaces its full variant set.
 * Replacing (delete-then-insert) instead of diffing is simpler and safe
 * here — variant rows have no meaning outside "current colors/sizes for
 * this product", so there's nothing worth preserving across an edit.
 */
export async function updateAdminProduct(
  id: string,
  product: Omit<AdminProductInput, 'id'>,
  variants: AdminVariantInput[]
): Promise<void> {
  const { error: productError } = await supabase
    .from('products')
    .update({
      ...product,
      in_stock: variants.some((v) => v.stock_quantity > 0),
    })
    .eq('id', id);

  if (productError) {
    throw new AdminProductsError(toFriendlyMessage(productError, 'Не удалось сохранить товар.'), productError);
  }

  const { error: deleteError } = await supabase.from('product_variants').delete().eq('product_id', id);

  if (deleteError) {
    throw new AdminProductsError(
      toFriendlyMessage(deleteError, 'Товар сохранён, но не удалось обновить варианты.'),
      deleteError
    );
  }

  if (variants.length > 0) {
    const { error: insertError } = await supabase
      .from('product_variants')
      .insert(variants.map((v) => ({ ...v, product_id: id })));

    if (insertError) {
      throw new AdminProductsError(
        toFriendlyMessage(insertError, 'Товар сохранён, но не удалось сохранить новые варианты.'),
        insertError
      );
    }
  }
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const { error: variantsError } = await supabase.from('product_variants').delete().eq('product_id', id);

  if (variantsError) {
    throw new AdminProductsError(toFriendlyMessage(variantsError, 'Не удалось удалить варианты товара.'), variantsError);
  }

  const { error: productError } = await supabase.from('products').delete().eq('id', id);

  if (productError) {
    throw new AdminProductsError(toFriendlyMessage(productError, 'Не удалось удалить товар.'), productError);
  }
}
