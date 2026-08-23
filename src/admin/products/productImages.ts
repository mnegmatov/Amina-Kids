import { supabase } from '../../lib/supabase';

export const PRODUCT_IMAGES_BUCKET = 'product-images';

function getExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  const fromType = file.type.split('/').pop()?.toLowerCase();
  if (fromType === 'jpeg') return 'jpg';
  if (fromType && /^[a-z0-9]+$/.test(fromType)) return fromType;

  return 'jpg';
}

/**
 * Uploads an admin product image to Supabase Storage and returns its public URL.
 * The bucket is public for storefront reads; uploads are protected by a
 * storage.objects INSERT policy limited to users present in admin_users.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const safeProductId = productId.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const extension = getExtension(file);
  const path = `${safeProductId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    if (error.message?.toLowerCase().includes('row-level security')) {
      throw new Error(
        'Не удалось загрузить фото: Supabase Storage не разрешил загрузку. Проверьте RLS-политику для bucket product-images.'
      );
    }
    throw new Error(`Не удалось загрузить фото: ${error.message}`);
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error('Фото загружено, но не удалось получить его публичный адрес.');
  }

  return data.publicUrl;
}
