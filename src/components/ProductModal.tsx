import React, { useState, useEffect } from 'react';
import { Product, ProductColor } from '../types';
import { X, Star, Heart, ShoppingBag, ShieldCheck, Truck, Ruler, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { useBodyScrollLock } from '../utils/useBodyScrollLock';
import { AnimatePresence, motion } from 'motion/react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color: ProductColor, size: string, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onOpenSizeChart: () => void;
  onOpenQuickBuy: (product: Product, color: ProductColor, size: string, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onOpenSizeChart,
  onOpenQuickBuy,
}) => {
  useBodyScrollLock(!!product);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes[0]);
      setQuantity(1);
      setAdded(false);
    }
  }, [product]);

  // Keyboard escape listener
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  const handleAddToCart = () => {
    if (!product || !selectedColor) return;
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const nextImage = () => {
    if (!product) return;
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <AnimatePresence>
      {product && selectedColor && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2C2008]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto md:overflow-hidden max-h-[90dvh] flex flex-col md:flex-row border border-[#E8E0D5] pb-safe sm:pb-0 z-10 overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-[#E8E0D5] rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 p-2 sm:p-2.5 bg-white/90 hover:bg-white text-[#7A695D] hover:text-[#33261D] rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
          aria-label="Закрыть модальное окно"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Section */}
        <div className="w-full md:w-1/2 bg-[#F7F1E5] relative flex flex-col justify-between p-3.5 sm:p-4 shrink-0">
          <div className="relative w-full h-[240px] sm:h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-white shadow-inner">
            <img
              src={product.images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  aria-label="Предыдущее фото"
                  className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/85 hover:bg-white text-[#33261D] shadow-md active:scale-90 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  aria-label="Следующее фото"
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/85 hover:bg-white text-[#33261D] shadow-md active:scale-90 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.isHit && (
                <span className="bg-[#4A3A0B] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Хит
                </span>
              )}
              {product.discount && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  -{product.discount}%
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Фото ${idx + 1}`}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-[#E2A69B] scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-5">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs text-[#7A695D] mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#E2A69B] bg-[#F8EBE8] px-2.5 py-0.5 rounded-full border border-[#E2A69B]/30">
                {product.subcategory}
              </span>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A3A0B] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#E8E0D5]/60">
                <Star className="w-3.5 h-3.5 fill-[#E2A69B] text-[#E2A69B]" />
                <span>{product.rating}</span>
                <span className="text-[#7A695D] font-normal">({product.reviewsCount})</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-[#33261D] mb-2.5 leading-snug">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#4A3A0B]">
                {formatPrice(product.price)} сомони
              </span>
              {product.oldPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.oldPrice)} сомони
                </span>
              )}
            </div>

            {/* Colors */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#33261D]">Цвет: <strong className="text-[#4A3A0B] font-bold">{selectedColor.name}</strong></span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`flex items-center gap-2 px-3 py-1.5 min-h-[38px] rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      selectedColor.name === c.name
                        ? 'border-[#4A3A0B] bg-white text-[#4A3A0B] shadow-xs ring-1 ring-[#4A3A0B]'
                        : 'border-[#E8E0D5] bg-[#FAF6F0] text-[#7A695D] hover:border-[#E2A69B]'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#33261D]">Размер (Рост в см): <strong className="text-[#4A3A0B] font-bold">{selectedSize}</strong></span>
                <button
                  type="button"
                  onClick={onOpenSizeChart}
                  className="text-[#E2A69B] hover:text-[#C88B80] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Таблица размеров
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[44px] min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSize === s
                        ? 'bg-[#4A3A0B] text-white shadow-xs'
                        : 'bg-[#FAF6F0] text-[#33261D] border border-[#E8E0D5] hover:border-[#E2A69B]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-semibold text-[#33261D]">Количество:</span>
              <div className="flex items-center border border-[#E8E0D5] rounded-xl bg-[#FAF6F0]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Уменьшить количество"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-bold text-[#7A695D] hover:text-[#33261D] active:scale-90 transition-transform cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-[#33261D] min-w-[28px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(100, quantity + 1))}
                  aria-label="Увеличить количество"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-bold text-[#7A695D] hover:text-[#33261D] active:scale-90 transition-transform cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Description & Composition */}
            <div className="p-3.5 sm:p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5] text-xs space-y-2 mb-4">
              <p className="text-[#33261D] leading-relaxed">{product.description}</p>
              <div className="pt-2 border-t border-[#E8E0D5] flex flex-col gap-1 text-[#7A695D]">
                <div><strong className="text-[#33261D]">Состав:</strong> {product.composition}</div>
                <div><strong className="text-[#33261D]">Уход:</strong> {product.care}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2 pb-2 sm:pb-0 border-t border-[#E8E0D5]">
            <div className="flex gap-2.5">
              <button
                onClick={handleAddToCart}
                className={`flex-1 min-h-[46px] py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#E2A69B] text-white hover:bg-[#C88B80] active:scale-[0.97]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Добавлено ({quantity} шт.)
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Добавить в корзину
                  </>
                )}
              </button>

              <button
                onClick={() => onToggleWishlist(product)}
                aria-label={isWishlisted ? 'Удалить из избранного' : 'Добавить в избранное'}
                className={`min-w-[46px] min-h-[46px] flex items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  isWishlisted
                    ? 'bg-[#E2A69B] border-[#E2A69B] text-white'
                    : 'border-[#E8E0D5] text-[#7A695D] hover:text-[#E2A69B] hover:border-[#E2A69B] active:bg-[#FAF6F0]'
                }`}
                title="В избранное"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => onOpenQuickBuy(product, selectedColor, selectedSize, quantity)}
              className="w-full min-h-[46px] py-2.5 px-4 bg-[#4A3A0B] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#2C2008] active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              Купить в 1 клик
            </button>

            {/* Badges footer */}
            <div className="flex items-center justify-around pt-1 text-[11px] text-[#7A695D]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#E2A69B]" />
                <span>100% Гипоаллергенно</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#E2A69B]" />
                <span>Быстрая доставка</span>
              </div>
            </div>
          </div>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};