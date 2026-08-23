import React, { useMemo, useState } from 'react';
import { Plus, Trash2, X, AlertCircle, Upload, Info } from 'lucide-react';
import { VALID_CATEGORIES, VALID_GENDERS, VALID_AGE_GROUPS } from '../../lib/products';
import { uploadProductImage } from './productImages';
import {
  AdminProductInput,
  AdminVariantInput,
  AdminProductRow,
  AdminVariantRow,
  createAdminProduct,
  updateAdminProduct,
} from './adminProducts';

const CATEGORY_LABELS: Record<string, string> = {
  girls: 'Девочкам',
  boys: 'Мальчикам',
  babies: 'Малышам',
  accessories: 'Аксессуары',
};

const GENDER_LABELS: Record<string, string> = {
  girl: 'Девочка',
  boy: 'Мальчик',
  unisex: 'Унисекс',
  baby: 'Малыш/малышка',
};

interface FormVariant extends AdminVariantInput {
  key: string;
}

/** One image row in the form. `key` is a stable client-side id used only
 * for React's list reconciliation — it never leaves this component. */
interface FormImage {
  key: string;
  url: string;
}

function emptyImage(url = ''): FormImage {
  return { key: Math.random().toString(36).slice(2), url };
}

interface AdminProductFormProps {
  /** Present when editing an existing product; absent when creating one. */
  initialProduct?: AdminProductRow;
  initialVariants?: AdminVariantRow[];
  onSaved: () => void;
  onCancel: () => void;
}

function stockStatusLabel(qty: number): { text: string; className: string } {
  if (qty <= 0) return { text: 'Нет в наличии', className: 'bg-red-100 text-red-700' };
  if (qty <= 3) return { text: 'Мало', className: 'bg-amber-100 text-amber-800' };
  return { text: 'В наличии', className: 'bg-emerald-100 text-emerald-800' };
}

function parseStockQuantity(raw: string): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function emptyVariant(): FormVariant {
  return {
    key: Math.random().toString(36).slice(2),
    color_name: '',
    color_hex: '#E2A69B',
    size: '',
    stock_quantity: 0,
  };
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  initialProduct,
  initialVariants,
  onSaved,
  onCancel,
}) => {
  const isEditing = !!initialProduct;

  const [id, setId] = useState(initialProduct?.id ?? '');
  const [name, setName] = useState(initialProduct?.name ?? '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id ?? VALID_CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState(initialProduct?.subcategory ?? '');
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '');
  const [oldPrice, setOldPrice] = useState(
    initialProduct?.old_price != null ? String(initialProduct.old_price) : ''
  );
  const [discount, setDiscount] = useState(
    initialProduct?.discount != null ? String(initialProduct.discount) : ''
  );
  const [rating, setRating] = useState(initialProduct ? String(initialProduct.rating) : '0');
  const [reviewsCount, setReviewsCount] = useState(
    initialProduct ? String(initialProduct.reviews_count) : '0'
  );
  const [isNew, setIsNew] = useState(initialProduct?.is_new ?? false);
  const [isHit, setIsHit] = useState(initialProduct?.is_hit ?? false);
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [composition, setComposition] = useState(initialProduct?.composition ?? '');
  const [care, setCare] = useState(initialProduct?.care ?? '');
  const [gender, setGender] = useState(initialProduct?.gender ?? VALID_GENDERS[0]);
  const [ageGroup, setAgeGroup] = useState(initialProduct?.age_group ?? VALID_AGE_GROUPS[1]);
  const [images, setImages] = useState<FormImage[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images.map((url) => emptyImage(url))
      : [emptyImage()]
  );
  const [variants, setVariants] = useState<FormVariant[]>(
    initialVariants && initialVariants.length > 0
      ? initialVariants.map((v) => ({
          key: String(v.id),
          color_name: v.color_name,
          color_hex: v.color_hex,
          size: v.size,
          stock_quantity: v.stock_quantity,
        }))
      : [emptyVariant()]
  );

  const derivedInStock = useMemo(
    () => variants.some((v) => Number(v.stock_quantity) > 0),
    [variants]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  const updateImage = (index: number, value: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, url: value } : img)));
  };
  const addImage = () => setImages((prev) => [...prev, emptyImage()]);
  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const updateVariant = (index: number, patch: Partial<FormVariant>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };
  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);
  const removeVariant = (index: number) => setVariants((prev) => prev.filter((_, i) => i !== index));

  const handleImageUpload = async (index: number, file: File | undefined) => {
    if (!file) return;

    const trimmedProductId = id.trim();
    if (!trimmedProductId) {
      setError('Сначала укажите ID товара, затем загрузите фото.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Можно загружать только изображения.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер изображения не должен превышать 5 МБ.');
      return;
    }

    setError('');
    setUploadingImageIndex(index);

    try {
      const publicUrl = await uploadProductImage(file, trimmedProductId);
      updateImage(index, publicUrl);
    } catch (err) {
      console.error('Failed to upload product image:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить изображение.');
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');

    const trimmedId = id.trim();
    const trimmedName = name.trim();
    const trimmedSubcategory = subcategory.trim();
    const parsedPrice = parseFloat(price);

    if (!isEditing && !trimmedId) {
      setError('Укажите ID товара.');
      return;
    }
    if (!trimmedName) {
      setError('Укажите название товара.');
      return;
    }
    if (!trimmedSubcategory) {
      setError('Укажите подкатегорию.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Укажите корректную цену.');
      return;
    }

    const cleanImages = images.map((img) => img.url.trim()).filter(Boolean);
    if (variants.some((v) => Number(v.stock_quantity) < 0)) {
      setError('Остаток не может быть отрицательным.');
      return;
    }

    const seenVariantKeys = new Set<string>();
    for (const v of variants) {
      const c = v.color_name.trim().toLowerCase();
      const s = v.size.trim().toLowerCase();
      if (c && s) {
        const comboKey = `${c}:::${s}`;
        if (seenVariantKeys.has(comboKey)) {
          setError(`Обнаружен дубликат варианта: «${v.color_name.trim()} / ${v.size.trim()}». Комбинация цвета и размера должна быть уникальной.`);
          return;
        }
        seenVariantKeys.add(comboKey);
      }
    }

    const cleanVariants: AdminVariantInput[] = variants
      .filter((v) => v.color_name.trim() && v.size.trim())
      .map((v) => ({
        color_name: v.color_name.trim(),
        color_hex: v.color_hex.trim() || '#E2A69B',
        size: v.size.trim(),
        stock_quantity: Math.max(0, Number.isFinite(Number(v.stock_quantity)) ? Number(v.stock_quantity) : 0),
      }));

    if (cleanVariants.length === 0) {
      setError('Укажите как минимум один вариант (цвет и размер).');
      return;
    }

    const productFields: Omit<AdminProductInput, 'id'> = {
      name: trimmedName,
      category_id: categoryId,
      subcategory: trimmedSubcategory,
      price: parsedPrice,
      old_price: oldPrice.trim() ? parseFloat(oldPrice) : null,
      discount: discount.trim() ? parseInt(discount, 10) : null,
      rating: rating.trim() ? parseFloat(rating) : 0,
      reviews_count: reviewsCount.trim() ? parseInt(reviewsCount, 10) : 0,
      is_new: isNew,
      is_hit: isHit,
      in_stock: cleanVariants.some((v) => v.stock_quantity > 0),
      description: description.trim() || null,
      composition: composition.trim() || null,
      care: care.trim() || null,
      gender,
      age_group: ageGroup,
      images: cleanImages,
    };

    setSubmitting(true);
    try {
      if (isEditing && initialProduct) {
        await updateAdminProduct(initialProduct.id, productFields, cleanVariants);
      } else {
        await createAdminProduct({ id: trimmedId, ...productFields }, cleanVariants);
      }
      onSaved();
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err instanceof Error ? err.message : 'Не удалось сохранить товар.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D5] text-sm text-[#33261D] focus:outline-none focus:border-[#E2A69B] transition-colors';
  const labelClass = 'block text-[11px] font-bold text-[#7A695D] uppercase tracking-wide mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E0D5] shadow-sm p-6 space-y-8">
      {/* Basic fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>ID товара</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={isEditing}
            placeholder="ak-010"
            className={`${inputClass} ${isEditing ? 'bg-[#FAF6F0] text-[#7A695D] cursor-not-allowed' : ''}`}
          />
        </div>
        <div>
          <label className={labelClass}>Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Категория</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            {VALID_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Подкатегория</label>
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="Платья"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Пол</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
            {VALID_GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g] ?? g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Возрастная группа</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={inputClass}>
            {VALID_AGE_GROUPS.map((a) => (
              <option key={a} value={a}>
                {a} лет
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-xs font-bold text-[#33261D] uppercase tracking-wide mb-3">Цена и рейтинг</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div>
            <label className={labelClass}>Цена, сомони</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Старая цена</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Скидка, %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Рейтинг</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Кол-во отзывов</label>
            <input
              type="number"
              min="0"
              value={reviewsCount}
              onChange={(e) => setReviewsCount(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-[#33261D] cursor-pointer">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="w-4 h-4 accent-[#E2A69B]" />
          Новинка
        </label>
        <label className="flex items-center gap-2 text-sm text-[#33261D] cursor-pointer">
          <input type="checkbox" checked={isHit} onChange={(e) => setIsHit(e.target.checked)} className="w-4 h-4 accent-[#E2A69B]" />
          Хит
        </label>
        <span
          className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
            derivedInStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
          title="Статус считается автоматически: товар в наличии, если хотя бы у одного варианта остаток больше 0"
        >
          {derivedInStock ? 'В наличии' : 'Нет в наличии'}
        </span>
      </div>

      {/* Text fields */}
      <div className="space-y-5">
        <div>
          <label className={labelClass}>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Состав</label>
          <textarea
            value={composition}
            onChange={(e) => setComposition(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Уход</label>
          <textarea value={care} onChange={(e) => setCare(e.target.value)} rows={2} className={inputClass} />
        </div>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-[#33261D] uppercase tracking-wide">Изображения</h3>
            <p className="text-[11px] text-[#7A695D] mt-1">
              Можно вставить URL или загрузить фото. До 5 МБ.
            </p>
          </div>
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1 text-[11px] font-bold text-[#E2A69B] hover:text-[#C88B80] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Добавить URL
          </button>
        </div>

        {!id.trim() && (
          <div className="mb-3.5 flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-[#7A695D]">
            <Info className="w-4 h-4 shrink-0 text-[#E2A69B] mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong className="text-[#33261D] font-semibold">Загрузка файлов:</strong> укажите <span className="font-mono text-[#33261D]">ID товара</span> в начале формы, чтобы загружать фотографии прямо в хранилище.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {images.map((img, i) => {
            const hasProductId = Boolean(id.trim());
            const isUploadingThis = uploadingImageIndex === i;

            return (
              <div key={img.key} className="flex flex-col gap-2.5 p-3.5 sm:p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={img.url}
                    onChange={(e) => updateImage(i, e.target.value)}
                    placeholder="https://... (прямая ссылка на картинку)"
                    className={`${inputClass} bg-white`}
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="min-h-[44px] min-w-[44px] p-2 text-[#7A695D] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                      title="Удалить изображение"
                      aria-label="Удалить изображение"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all select-none ${
                      !hasProductId
                        ? 'bg-[#F0E9E1] text-[#A69588] border border-[#E0D5C7] cursor-not-allowed opacity-75'
                        : isUploadingThis
                          ? 'bg-white border border-[#E2A69B] text-[#E2A69B] cursor-wait'
                          : 'bg-white border border-[#E8E0D5] text-[#7A695D] hover:text-[#33261D] hover:border-[#E2A69B] active:scale-[0.99] cursor-pointer shadow-2xs'
                    }`}
                    title={!hasProductId ? 'Сначала укажите ID товара выше' : 'Загрузить фото с устройства'}
                  >
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span>{isUploadingThis ? 'Загрузка...' : 'Загрузить файл'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      disabled={!hasProductId || uploadingImageIndex !== null}
                      onChange={(e) => {
                        void handleImageUpload(i, e.target.files?.[0]);
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>

                  {img.url && (
                    <div className="flex items-center gap-2.5 min-w-0 bg-white px-3 py-1.5 rounded-xl border border-[#E8E0D5]">
                      <img
                        src={img.url}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover bg-white border border-[#E8E0D5] shrink-0"
                      />
                      <span className="text-xs text-[#7A695D] truncate max-w-[200px] sm:max-w-[320px]">
                        Изображение привязано
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-bold text-[#33261D] uppercase tracking-wide">
              Варианты (цвет / размер / остаток)
            </h3>
            <p className="text-[11px] text-[#7A695D] mt-0.5">
              Настройте доступные цвета, размеры и складской остаток для каждого варианта.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 min-h-[40px] px-3 text-xs font-bold text-[#E2A69B] hover:text-[#C88B80] bg-white border border-[#E8E0D5] hover:border-[#E2A69B] rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> <span>Добавить вариант</span>
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => {
            const stockUi = stockStatusLabel(v.stock_quantity);
            return (
              <div
                key={v.key}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  v.stock_quantity <= 0
                    ? 'bg-red-50/60 border-red-200'
                    : v.stock_quantity <= 3
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-[#FAF6F0] border-[#E8E0D5]'
                }`}
              >
                {/* Desktop & Tablet Layout (>= sm) */}
                <div className="hidden sm:flex sm:items-center sm:gap-2.5">
                  <div className="flex-1 min-w-[120px]">
                    <input
                      type="text"
                      value={v.color_name}
                      onChange={(e) => updateVariant(i, { color_name: e.target.value })}
                      placeholder="Цвет (напр. Розовый)"
                      aria-label="Название цвета"
                      className={`${inputClass} bg-white`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="color"
                      value={v.color_hex}
                      onChange={(e) => updateVariant(i, { color_hex: e.target.value })}
                      aria-label="Палитра цвета"
                      className="w-11 h-11 rounded-xl border border-[#E8E0D5] cursor-pointer p-0.5 bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={v.color_hex}
                      onChange={(e) => updateVariant(i, { color_hex: e.target.value })}
                      placeholder="#E2A69B"
                      aria-label="HEX код цвета"
                      className={`${inputClass} bg-white w-28 font-mono text-xs`}
                    />
                  </div>

                  <div className="w-24 shrink-0">
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => updateVariant(i, { size: e.target.value })}
                      placeholder="Размер"
                      aria-label="Размер"
                      className={`${inputClass} bg-white text-center`}
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min="0"
                      value={v.stock_quantity}
                      onChange={(e) => updateVariant(i, { stock_quantity: parseStockQuantity(e.target.value) })}
                      placeholder="Остаток"
                      aria-label="Складской остаток (шт.)"
                      className={`${inputClass} bg-white w-24 text-center font-medium`}
                    />
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-full shrink-0 ${stockUi.className}`}>
                      {stockUi.text}
                    </span>
                  </div>

                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="min-h-[44px] min-w-[44px] p-2 text-[#7A695D] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                      title="Удалить вариант"
                      aria-label="Удалить вариант"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Mobile Responsive Layout (< sm / < 400px) */}
                <div className="sm:hidden space-y-3">
                  {/* Row 1: Color Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A695D] uppercase tracking-wide mb-1">
                      Цвет
                    </label>
                    <input
                      type="text"
                      value={v.color_name}
                      onChange={(e) => updateVariant(i, { color_name: e.target.value })}
                      placeholder="Название цвета (напр. Бежевый)"
                      aria-label="Название цвета"
                      className={`${inputClass} bg-white min-h-[44px]`}
                    />
                  </div>

                  {/* Row 2: Color Picker + HEX code */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A695D] uppercase tracking-wide mb-1">
                      Оттенок (HEX)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={v.color_hex}
                        onChange={(e) => updateVariant(i, { color_hex: e.target.value })}
                        aria-label="Палитра цвета"
                        className="w-11 h-11 rounded-xl border border-[#E8E0D5] cursor-pointer p-0.5 bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={v.color_hex}
                        onChange={(e) => updateVariant(i, { color_hex: e.target.value })}
                        placeholder="#E2A69B"
                        aria-label="HEX код цвета"
                        className={`${inputClass} bg-white min-h-[44px] font-mono text-xs flex-1`}
                      />
                    </div>
                  </div>

                  {/* Row 3: Size & Stock Quantity Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-[#7A695D] uppercase tracking-wide mb-1">
                        Размер
                      </label>
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => updateVariant(i, { size: e.target.value })}
                        placeholder="92, 98, S..."
                        aria-label="Размер"
                        className={`${inputClass} bg-white min-h-[44px]`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#7A695D] uppercase tracking-wide mb-1">
                        Остаток (шт.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock_quantity}
                        onChange={(e) => updateVariant(i, { stock_quantity: parseStockQuantity(e.target.value) })}
                        placeholder="0"
                        aria-label="Складской остаток (шт.)"
                        className={`${inputClass} bg-white min-h-[44px] font-medium`}
                      />
                    </div>
                  </div>

                  {/* Row 4: Stock badge & Delete button */}
                  <div className="pt-2 border-t border-[#E8E0D5]/70 flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${stockUi.className}`}>
                      {stockUi.text}
                    </span>

                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        aria-label="Удалить этот вариант"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Удалить</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E0D5]">
        <button
          type="button"
          onClick={onCancel}
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
          {submitting ? 'Сохраняем...' : isEditing ? 'Сохранить изменения' : 'Создать товар'}
        </button>
      </div>
    </form>
  );
};
