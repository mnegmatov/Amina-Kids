import React, { useEffect, useState, useRef } from 'react';
import { Product, ProductColor, ProductReview } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES_INFO } from '../data/products';
import { Star, Heart, ShoppingBag, ShieldCheck, Truck, Ruler, Check, ChevronRight, MessageSquare, AlertCircle, ChevronLeft, Zap } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { fetchApprovedReviews, submitReview } from '../lib/reviews';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (product: Product, color: ProductColor, size: string, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onOpenSizeChart: () => void;
  onOpenQuickBuy: (product: Product, color: ProductColor, size: string, quantity: number) => void;
  onNavigateToCatalog: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  wishlistIds: string[];
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onOpenSizeChart,
  onOpenQuickBuy,
  onNavigateToCatalog,
  onSelectProduct,
  onOpenQuickView,
  wishlistIds,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0] || { name: 'Основной', hex: '#E2A69B' });
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '86');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'composition' | 'shipping' | 'reviews'>('desc');
  const [added, setAdded] = useState(false);

  // Sync state if product changes
  useEffect(() => {
    setActiveImageIndex(0);
    if (product.colors.length > 0) setSelectedColor(product.colors[0]);
    if (product.sizes.length > 0) setSelectedSize(product.sizes[0]);
    setQuantity(1);
  }, [product.id]);

  // Mobile Sticky Buy Bar trigger via IntersectionObserver
  const mainCtaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const target = mainCtaRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the main purchase block is NOT intersecting and is above the viewport, show sticky bar
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Touch Swipe for mobile gallery with vertical scroll protection
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchEndX.current === null ||
      touchStartY.current === null ||
      touchEndY.current === null
    ) {
      return;
    }
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 45;

    // If the movement was predominantly horizontal, change image
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0 && activeImageIndex < product.images.length - 1) {
        setActiveImageIndex((prev) => prev + 1);
      } else if (diffX < 0 && activeImageIndex > 0) {
        setActiveImageIndex((prev) => prev - 1);
      }
    }
  };

  // Reviews are loaded from Supabase (approved only — see lib/reviews.ts)
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setReviewsLoading(true);
    fetchApprovedReviews(product.id)
      .then((reviews) => {
        if (!cancelled) setReviewsList(reviews);
      })
      .catch((err) => {
        console.error('Failed to load reviews:', err);
        if (!cancelled) setReviewsList([]);
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const handleAddToCart = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewSubmitting) return;

    const author = newReviewAuthor.trim();
    const comment = newReviewComment.trim();
    if (!author || !comment) return;

    setReviewError('');
    setReviewSubmitting(true);
    try {
      await submitReview(product.id, author, newReviewRating, comment);
      setNewReviewAuthor('');
      setNewReviewComment('');
      setNewReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewError('Не удалось отправить отзыв. Попробуйте ещё раз.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const similarProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#7A695D] overflow-x-auto pb-1" aria-label="Хлебные крошки">
        <button onClick={onNavigateToCatalog} className="hover:text-[#4A3A0B] transition-colors cursor-pointer shrink-0">
          Каталог
        </button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#7A695D]/60" />
        <span className="shrink-0">{CATEGORIES_INFO.find((c) => c.id === product.category)?.title ?? product.category}</span>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#7A695D]/60" />
        <span className="text-[#4A3A0B] font-semibold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start pb-20 lg:pb-0">
        {/* Gallery Section */}
        <div className="space-y-3 sm:space-y-4">
          <div
            className="aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F8EBE8]/40 border border-[#E8E0D5] relative shadow-sm select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={product.images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="eager"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
              {product.discount && (
                <span className="bg-[#E2A69B] text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow-sm">
                  -{product.discount}% СКИДКА
                </span>
              )}
              {product.isHit && (
                <span className="bg-[#4A3A0B] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  ХИТ
                </span>
              )}
            </div>

            {/* Wishlist Button on Image */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer shadow-sm ${
                isWishlisted
                  ? 'bg-[#E2A69B] text-white'
                  : 'bg-white/90 backdrop-blur-sm text-[#7A695D] hover:text-[#4A3A0B]'
              }`}
              aria-label={isWishlisted ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Mobile Swipe Left / Right Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                {activeImageIndex > 0 && (
                  <button
                    onClick={() => setActiveImageIndex((prev) => prev - 1)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 text-[#4A3A0B] flex items-center justify-center shadow-md hover:bg-white transition-all cursor-pointer z-10"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {activeImageIndex < product.images.length - 1 && (
                  <button
                    onClick={() => setActiveImageIndex((prev) => prev + 1)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 text-[#4A3A0B] flex items-center justify-center shadow-md hover:bg-white transition-all cursor-pointer z-10"
                    aria-label="Следующее фото"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {/* Mobile Image Counter Badge */}
            {product.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full pointer-events-none z-10">
                {activeImageIndex + 1} / {product.images.length}
              </div>
            )}

            {/* Mobile Dots Indicator */}
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 sm:hidden">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeImageIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                    aria-label={`Перейти к фото ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-[#FAF6F0] ${
                    activeImageIndex === idx
                      ? 'border-[#4A3A0B] shadow-sm scale-102'
                      : 'border-[#E8E0D5] opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Показать фото ${idx + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-[#7A695D] mb-1.5">
              <span className="font-bold text-[#E2A69B] uppercase tracking-wider text-[11px]">
                {product.subcategory}
              </span>
              <div className="flex items-center gap-1 font-semibold text-[#4A3A0B]">
                <Star className="w-4 h-4 fill-[#E2A69B] text-[#E2A69B]" />
                <span>{product.rating}</span>
                <span className="text-[#7A695D] font-normal">({reviewsList.length} отзывов)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A3A0B] leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[#7A695D] mt-1">Артикул: <span className="font-mono">{product.id}</span></p>
          </div>

          {/* Price & Stock Card */}
          <div className="flex items-baseline justify-between gap-3 p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5]">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#4A3A0B]">
                {formatPrice(product.price)} сомони
              </span>
              {product.oldPrice && (
                <span className="text-xs sm:text-sm text-[#7A695D] line-through">
                  {formatPrice(product.oldPrice)} сомони
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              В наличии
            </span>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#4A3A0B]">
              <span>Цвет: <strong className="text-[#E2A69B] font-bold">{selectedColor.name}</strong></span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => {
                const isSelected = selectedColor.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`min-h-[44px] flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4A3A0B] bg-white text-[#4A3A0B] shadow-sm ring-1 ring-[#4A3A0B]'
                        : 'border-[#E8E0D5] bg-[#FAF6F0] text-[#7A695D] hover:border-[#E2A69B]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#4A3A0B] ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#4A3A0B]">
              <span>Размер (Рост ребенка, см): <strong className="font-bold">{selectedSize}</strong></span>
              <button
                onClick={onOpenSizeChart}
                className="text-[#E2A69B] hover:text-[#C88B80] font-bold flex items-center gap-1 cursor-pointer transition-colors p-1"
              >
                <Ruler className="w-3.5 h-3.5" />
                Таблица размеров
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const isSelected = selectedSize === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[48px] min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#4A3A0B] text-white shadow-sm'
                        : 'bg-[#FAF6F0] text-[#4A3A0B] border border-[#E8E0D5] hover:border-[#E2A69B]'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-[#4A3A0B]">Количество:</span>
            <div className="flex items-center border border-[#E8E0D5] rounded-xl bg-[#FAF6F0]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-sm font-bold text-[#7A695D] hover:text-[#4A3A0B] cursor-pointer"
                aria-label="Уменьшить количество"
              >
                -
              </button>
              <span className="px-3 text-sm font-extrabold text-[#4A3A0B] min-w-[28px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(100, quantity + 1))}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-sm font-bold text-[#7A695D] hover:text-[#4A3A0B] cursor-pointer"
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>
          </div>

          {/* Main CTA Buttons Block */}
          <div ref={mainCtaRef} className="space-y-3 pt-4 border-t border-[#E8E0D5]">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 min-h-[48px] py-3.5 px-6 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#E2A69B] text-white hover:bg-[#C88B80] active:scale-[0.99]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Добавлено в корзину ({quantity} шт.)
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
                className={`min-w-[48px] min-h-[48px] p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                  isWishlisted
                    ? 'bg-[#E2A69B] border-[#E2A69B] text-white'
                    : 'border-[#E8E0D5] bg-white text-[#7A695D] hover:text-[#E2A69B] hover:border-[#E2A69B]'
                }`}
                title="В избранное"
                aria-label="В избранное"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => onOpenQuickBuy(product, selectedColor, selectedSize, quantity)}
              className="w-full min-h-[46px] py-3 bg-[#4A3A0B] text-white text-xs font-bold rounded-2xl hover:bg-[#2C2008] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className="w-4 h-4 text-[#E2A69B]" />
              <span>Быстрая покупка в 1 клик</span>
            </button>
          </div>

          {/* Guarantee info */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5] text-xs text-[#4A3A0B]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E2A69B] shrink-0" />
              <span className="font-semibold text-[11px] sm:text-xs">100% Премиальный муслин</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#E2A69B] shrink-0" />
              <span className="font-semibold text-[11px] sm:text-xs">Доставка по Таджикистану</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Tabs */}
      <div className="bg-white rounded-3xl border border-[#E8E0D5] p-5 sm:p-8 shadow-sm">
        <div className="flex border-b border-[#E8E0D5] gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'desc', label: 'Описание' },
            { id: 'composition', label: 'Состав и уход' },
            { id: 'shipping', label: 'Доставка и возврат' },
            { id: 'reviews', label: `Отзывы (${reviewsList.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold transition-all relative shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#E2A69B]'
                  : 'text-[#7A695D] hover:text-[#4A3A0B]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E2A69B] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="pt-6 text-xs text-[#4A3A0B] leading-relaxed">
          {activeTab === 'desc' && (
            <div key="desc" className="space-y-4 max-w-2xl animate-fade-in">
              <p className="text-xs sm:text-sm text-[#4A3A0B] leading-relaxed">{product.description}</p>
              <p className="text-xs text-[#7A695D]">
                Каждое изделие AMINA KIDS проходит строгий контроль качества швов, фурнитуры и гипоаллергенности красителей.
              </p>
            </div>
          )}

          {activeTab === 'composition' && (
            <div key="composition" className="space-y-3 max-w-xl animate-fade-in">
              <div>
                <strong className="block text-[#4A3A0B] mb-1 font-bold">Материал:</strong>
                <p className="text-[#7A695D]">{product.composition}</p>
              </div>
              <div className="pt-2 border-t border-[#E8E0D5]">
                <strong className="block text-[#4A3A0B] mb-1 font-bold">Рекомендации по уходу:</strong>
                <p className="text-[#7A695D]">{product.care}</p>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div key="shipping" className="space-y-2.5 max-w-xl animate-fade-in text-[#4A3A0B]">
              <p>• Доставка до пункта выдачи или курьером от 1 дня</p>
              <p>• Бесплатная доставка при заказе от 5 000 сомони</p>
              <p>• Примерка перед покупкой в пунктах выдачи</p>
              <p>• Возврат не подошедших товаров в течение 14 дней</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div key="reviews" className="space-y-8 animate-fade-in">
              {/* Existing Reviews */}
              <div className="space-y-3">
                {reviewsLoading ? (
                  <p className="text-[#7A695D]">Загрузка отзывов...</p>
                ) : reviewsList.length === 0 ? (
                  <p className="text-[#7A695D]">Отзывов пока нет. Будьте первым!</p>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#4A3A0B]">{rev.author}</span>
                        <span className="text-[10px] text-[#7A695D]">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#E2A69B]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-[#4A3A0B]">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              <div className="p-5 sm:p-6 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5] max-w-xl space-y-4">
                <h4 className="text-sm font-bold text-[#4A3A0B] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#E2A69B]" />
                  Оставить отзыв
                </h4>

                {reviewSuccess ? (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200">
                    Спасибо! Ваш отзыв отправлен на модерацию и появится здесь после проверки.
                  </div>
                ) : (
                  <form onSubmit={handleAddReview} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A3A0B] mb-1">Ваше имя</label>
                      <input
                        type="text"
                        required
                        placeholder="Например: Мария"
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        disabled={reviewSubmitting}
                        className="w-full p-2.5 bg-white border border-[#E8E0D5] rounded-xl text-xs focus:outline-none focus:border-[#E2A69B] disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A3A0B] mb-1">Оценка</label>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        disabled={reviewSubmitting}
                        className="p-2 bg-white border border-[#E8E0D5] rounded-xl text-xs font-semibold disabled:opacity-60"
                      >
                        <option value={5}>5 звезд - Отлично</option>
                        <option value={4}>4 звезды - Хорошо</option>
                        <option value={3}>3 звезды - Нормально</option>
                        <option value={2}>2 звезды - Плохо</option>
                        <option value={1}>1 звезда - Очень плохо</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A3A0B] mb-1">Ваш отзыв</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Расскажите о качестве, ткани и посадке на ребенка..."
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        disabled={reviewSubmitting}
                        className="w-full p-2.5 bg-white border border-[#E8E0D5] rounded-xl text-xs focus:outline-none focus:border-[#E2A69B] disabled:opacity-60"
                      />
                    </div>

                    {reviewError && (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium leading-relaxed">{reviewError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-5 py-2.5 bg-[#4A3A0B] text-white text-xs font-bold rounded-xl hover:bg-[#2C2008] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {reviewSubmitting ? 'Отправляем...' : 'Отправить отзыв'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar products carousel */}
      {similarProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#4A3A0B]">С этим покупают</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {similarProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenQuickView={onOpenQuickView}
                onAddToCart={(prod, col, sz) => onAddToCart(prod, col, sz, 1)}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlistIds.includes(p.id)}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Buy Bar (Visible on mobile when main CTA scrolled past) */}
      {showStickyBar && (
        <div
          className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E8E0D5] p-3 pb-safe z-40 lg:hidden shadow-[0_-4px_20px_rgba(74,58,11,0.08)] animate-slide-up"
        >
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={product.images[0]}
                alt=""
                className="w-11 h-11 rounded-xl object-cover border border-[#E8E0D5] shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#4A3A0B] truncate leading-tight">{product.name}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-[#7A695D] mt-0.5">
                  <span className="font-extrabold text-[#4A3A0B]">{formatPrice(product.price)} с.</span>
                  <span>•</span>
                  <span>{selectedSize} см</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAddToCart}
                className={`py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#E2A69B] text-white hover:bg-[#C88B80]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>В корзине</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>В корзину</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
