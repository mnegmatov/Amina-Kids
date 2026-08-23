import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';
import { X, ShoppingBag, Trash2, ArrowRight, Tag, Truck, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { useBodyScrollLock } from '../utils/useBodyScrollLock';
import { AnimatePresence, motion } from 'motion/react';
import { checkCartStock, maxPurchasableQty, MAX_CART_QUANTITY, StockStatus } from '../lib/stockCheck';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  onNavigateToCatalog: () => void;
  promoDiscount: number;
  onApplyPromo: (code: string) => Promise<{ success: boolean; message: string }>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onNavigateToCatalog,
  promoDiscount,
  onApplyPromo,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoChecking, setPromoChecking] = useState(false);

  // --- Stock validation state ---
  const [stockStatuses, setStockStatuses] = useState<StockStatus[]>([]);
  const [stockLoading, setStockLoading] = useState(false);

  // Check live stock when the drawer opens or cart contents change
  useEffect(() => {
    if (!isOpen || cartItems.length === 0) {
      setStockStatuses([]);
      return;
    }

    let cancelled = false;
    setStockLoading(true);

    checkCartStock(cartItems)
      .then((statuses) => {
        if (!cancelled) setStockStatuses(statuses);
      })
      .catch(() => {
        // Silently ignore — advisory check only, not blocking
        if (!cancelled) setStockStatuses([]);
      })
      .finally(() => {
        if (!cancelled) setStockLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, cartItems]);

  // Keyboard escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  /** Lookup helper: returns StockStatus for a given cart item, or undefined. */
  const getStockFor = (cartItemId: string): StockStatus | undefined =>
    stockStatuses.find((s) => s.cartItemId === cartItemId);

  /** True when any item in the cart exceeds available stock. */
  const problemItems = stockStatuses.filter((s) => !s.isAvailable);
  const hasStockIssues = problemItems.length > 0;

  const handleProceedToCheckout = () => {
    if (stockLoading || hasStockIssues) return;
    onClose();
    onProceedToCheckout();
  };

  useBodyScrollLock(isOpen);

  const FREE_SHIPPING_THRESHOLD = 5000;
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * promoDiscount);
  const total = subtotal - discountAmount;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (promoChecking) return;

    setPromoChecking(true);
    setPromoError('');
    setPromoSuccess('');
    try {
      const result = await onApplyPromo(promoInput);
      if (result.success) {
        setPromoSuccess(result.message);
      } else {
        setPromoError(result.message);
      }
    } finally {
      setPromoChecking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E8E0D5] h-full"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#F7F1E5] border-b border-[#E8E0D5] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E2A69B]" />
              <h3 className="text-base font-bold text-[#33261D]">Корзина ({cartItems.length})</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть корзину"
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#7A695D] hover:text-[#33261D] rounded-full hover:bg-white/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {cartItems.length > 0 && (
            <div className="p-3.5 sm:p-4 bg-[#FAF6F0] border-b border-[#E8E0D5] shrink-0">
              <div className="flex items-center justify-between text-xs font-semibold text-[#33261D] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#E2A69B] shrink-0" />
                  <span className="truncate">
                    {remainingForFreeShipping > 0
                      ? `Еще ${formatPrice(remainingForFreeShipping)} сомони до бесплатной доставки`
                      : '🎉 Бесплатная доставка получена!'}
                  </span>
                </span>
                <span className="text-[#E2A69B] font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#E8E0D5] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#E2A69B] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4 overscroll-contain">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F7F1E5] flex items-center justify-center text-[#E2A69B]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#33261D]">Ваша корзина пуста</h4>
                <p className="text-xs text-[#7A695D] max-w-xs leading-relaxed">
                  Выберите красивую и удобную одежду для вашего малыша из нашего каталога
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToCatalog();
                  }}
                  className="min-h-[44px] px-6 py-3 bg-[#E2A69B] hover:bg-[#C88B80] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {cartItems.map((item) => {
                  const stock = getStockFor(item.id);
                  const maxQty = stock ? maxPurchasableQty(stock.availableQty) : MAX_CART_QUANTITY;
                  const atMax = item.quantity >= maxQty;

                  return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`flex gap-3 sm:gap-3.5 p-3 sm:p-3.5 bg-[#FAF6F0] rounded-2xl border relative group overflow-hidden ${
                      stock?.isOutOfStock
                        ? 'border-red-300 bg-red-50/60'
                        : stock && !stock.isAvailable
                          ? 'border-amber-300 bg-amber-50/40'
                          : 'border-[#E8E0D5]'
                    }`}
                  >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className={`w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl bg-white shrink-0 border border-[#E8E0D5] ${
                      stock?.isOutOfStock ? 'opacity-50 grayscale' : ''
                    }`}
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-[#33261D] truncate pr-1">{item.product.name}</h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="min-w-[32px] min-h-[32px] flex items-center justify-center text-[#7A695D] hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2A69B] cursor-pointer shrink-0"
                          title="Удалить"
                          aria-label={`Удалить ${item.product.name} из корзины`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#7A695D] mt-0.5 flex flex-wrap items-center gap-x-1.5">
                        <span>Цвет: {item.selectedColor.name}</span>
                        <span>•</span>
                        <span>Размер: {item.selectedSize}</span>
                      </div>

                      {/* Stock warning badges */}
                      {stock?.isOutOfStock && (
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-red-600 bg-red-100 rounded-md px-2 py-0.5 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Нет в наличии
                        </div>
                      )}
                      {stock && !stock.isOutOfStock && !stock.isAvailable && (
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-md px-2 py-0.5 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          В наличии: {stock.availableQty} шт.
                        </div>
                      )}
                      {stock && stock.isAvailable && stock.availableQty > 0 && stock.availableQty <= 3 && (
                        <div className="mt-1.5 text-[10px] font-semibold text-amber-700">
                          Осталось: {stock.availableQty} шт.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E8E0D5]/50">
                      {/* Quantity buttons with touch targets */}
                      <div className="flex items-center border border-[#E8E0D5] rounded-xl bg-white shadow-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          aria-label="Уменьшить количество"
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-sm font-bold text-[#7A695D] hover:text-[#33261D] active:bg-[#FAF6F0] rounded-l-xl transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-[#33261D] min-w-[24px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.min(item.quantity + 1, maxQty))}
                          disabled={atMax || stock?.isOutOfStock}
                          aria-label="Увеличить количество"
                          className={`min-w-[36px] min-h-[36px] flex items-center justify-center text-sm font-bold rounded-r-xl transition-colors ${
                            atMax || stock?.isOutOfStock
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-[#7A695D] hover:text-[#33261D] active:bg-[#FAF6F0] cursor-pointer'
                          }`}
                          title={atMax ? `Максимум: ${maxQty} шт.` : undefined}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-xs font-extrabold text-[#4A3A0B]">
                        {formatPrice((item.product.price * item.quantity))} сомони
                      </div>
                    </div>
                  </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Footer Summary & Checkout with pb-safe */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E8E0D5] bg-[#FAF6F0] space-y-3.5 shrink-0 pb-safe">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#7A695D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Промокод (например FIRST10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      aria-label="Промокод для скидки"
                      className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#E8E0D5] rounded-xl text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={promoChecking || !promoInput.trim()}
                    className="min-h-[40px] px-4 py-2 bg-[#4A3A0B] text-white text-xs font-semibold rounded-xl hover:bg-[#2C2008] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {promoChecking ? 'Проверка...' : 'Применить'}
                  </button>
                </div>
                {promoError && (
                  <p className="text-[11px] text-red-600 font-medium pl-1 animate-fade-in">{promoError}</p>
                )}
                {promoSuccess && (
                  <p className="text-[11px] text-emerald-600 font-medium pl-1 animate-fade-in">{promoSuccess}</p>
                )}
              </form>

              {/* Calculations */}
              <div className="space-y-1.5 text-xs text-[#7A695D]">
                <div className="flex justify-between">
                  <span>Сумма заказа:</span>
                  <span className="font-semibold text-[#33261D]">{formatPrice(subtotal)} сомони</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Скидка по промокоду:</span>
                    <span>-{formatPrice(discountAmount)} сомони</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Доставка:</span>
                  <span>
                    {remainingForFreeShipping === 0 ? (
                      <span className="text-emerald-600 font-bold">Бесплатно</span>
                    ) : (
                      'Рассчитается при оформлении'
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#4A3A0B] pt-2 border-t border-[#E8E0D5]">
                  <span>Итого к оплате:</span>
                  <span>{formatPrice(total)} сомони</span>
                </div>
              </div>

              {hasStockIssues && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-[11px] font-bold">
                      Нельзя оформить заказ: проверьте наличие товаров
                    </p>
                    <ul className="text-[10px] font-medium space-y-0.5">
                      {problemItems.map((s) => (
                        <li key={s.cartItemId}>
                          {s.productName} ({s.colorName}, {s.size})
                          {s.isOutOfStock
                            ? ' — нет в наличии'
                            : ` — в наличии ${s.availableQty} шт., в корзине ${s.requestedQty}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <button
                onClick={handleProceedToCheckout}
                disabled={stockLoading || hasStockIssues}
                className="w-full min-h-[48px] py-3.5 bg-[#E2A69B] hover:bg-[#C88B80] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E2A69B] cursor-pointer"
              >
                <span>
                  {stockLoading
                    ? 'Проверяем наличие...'
                    : hasStockIssues
                      ? 'Исправьте наличие, чтобы оформить'
                      : 'Оформить заказ'}
                </span>
                {!stockLoading && !hasStockIssues && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
      )}
    </AnimatePresence>
  );
};