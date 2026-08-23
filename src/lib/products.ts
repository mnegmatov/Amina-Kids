import { supabase } from './supabase';
import { AgeGroup, Gender, Product, ProductCategory, ProductColor } from '../types';

/**
 * Raw row shapes as they come back from Supabase (snake_case columns).
 * Kept local to this file so the rest of the app never has to think
 * about the database's naming — only about `Product`.
 */
interface SupabaseProductRow {
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

interface SupabaseVariantRow {
  id: number;
  product_id: string;
  color_name: string;
  color_hex: string;
  size: string;
  stock_quantity: number;
}

export const VALID_CATEGORIES: ProductCategory[] = ['girls', 'boys', 'babies', 'accessories'];
export const VALID_GENDERS: Gender[] = ['girl', 'boy', 'unisex', 'baby'];
export const VALID_AGE_GROUPS: AgeGroup[] = ['0-2', '2-5', '6-10'];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800';

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function toCategory(value: string): ProductCategory {
  return (VALID_CATEGORIES as string[]).includes(value) ? (value as ProductCategory) : 'accessories';
}

function toGender(value: string): Gender {
  return (VALID_GENDERS as string[]).includes(value) ? (value as Gender) : 'unisex';
}

function toAgeGroup(value: string): AgeGroup {
  return (VALID_AGE_GROUPS as string[]).includes(value) ? (value as AgeGroup) : '2-5';
}

function toImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((img): img is string => typeof img === 'string' && img.length > 0);
}

/**
 * Converts one Supabase `products` row plus its related `product_variants`
 * rows into the app's existing `Product` shape. This is the single place
 * that needs to change if the database schema evolves — every component
 * downstream (ProductCard, ProductModal, CatalogPage, etc.) keeps working
 * against the familiar `Product` type unmodified.
 */
export function mapSupabaseProductToProduct(
  row: SupabaseProductRow,
  allVariants: SupabaseVariantRow[]
): Product {
  const variants = allVariants.filter((v) => v.product_id === row.id);

  const colorsByName = new Map<string, ProductColor>();
  const sizes = new Set<string>();

  for (const v of variants) {
    if (!colorsByName.has(v.color_name)) {
      colorsByName.set(v.color_name, { name: v.color_name, hex: v.color_hex });
    }
    sizes.add(v.size);
  }

  // A product with no variants yet shouldn't break color/size pickers in
  // the UI, which always expect at least one of each — fall back gracefully.
  const colors: ProductColor[] =
    colorsByName.size > 0 ? Array.from(colorsByName.values()) : [{ name: 'Стандартный', hex: '#E2A69B' }];
  const sizeList: string[] = sizes.size > 0 ? Array.from(sizes) : ['Единый размер'];

  const images = toImages(row.images);

  return {
    id: row.id,
    name: row.name,
    category: toCategory(row.category_id),
    subcategory: row.subcategory,
    price: toNumber(row.price),
    oldPrice: row.old_price !== null ? toNumber(row.old_price) : undefined,
    discount: row.discount ?? undefined,
    rating: toNumber(row.rating),
    reviewsCount: row.reviews_count ?? 0,
    isNew: row.is_new ?? false,
    isHit: row.is_hit ?? false,
    colors,
    sizes: sizeList,
    images: images.length > 0 ? images : [FALLBACK_IMAGE],
    description: row.description ?? '',
    composition: row.composition ?? '',
    care: row.care ?? '',
    gender: toGender(row.gender),
    ageGroup: toAgeGroup(row.age_group),
    inStock: row.in_stock ?? true,
    // `product_reviews` isn't wired up in this pass (out of scope for the
    // catalog task) — components already handle `reviews` being undefined.
  };
}

/**
 * Fetches all products and their variants from Supabase and returns them
 * mapped to `Product[]`. Throws on any Supabase error so the caller can
 * decide how to fall back (see `App.tsx`).
 */
export async function fetchProductsFromSupabase(): Promise<Product[]> {
  const [productsResult, variantsResult] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('product_variants').select('*'),
  ]);

  if (productsResult.error) throw productsResult.error;
  if (variantsResult.error) throw variantsResult.error;

  const variants = (variantsResult.data ?? []) as SupabaseVariantRow[];
  const products = (productsResult.data ?? []) as SupabaseProductRow[];

  return products.map((row) => mapSupabaseProductToProduct(row, variants));
}
