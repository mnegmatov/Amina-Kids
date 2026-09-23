import React, { useState, useEffect } from 'react';
import { Product, ProductColor, CartItem } from '../types';
import { X, CheckCircle2, Phone, User, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { formatPrice, normalizePhoneNumber } from '../utils/format';
import { useBodyScrollLock } from '../utils/useBodyScrollLock';
import { createOrder } from '../lib/orders';
import { MAX_CART_QUANTITY } from '../lib/stockCheck';
import { AnimatePresence, motion } from 'motion/react';

interface QuickBuyModalProps {
  item: {
    product: Product;
    color: ProductColor;
    size: string;
    quantity: number;
  } | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function toCartItem(item: NonNullable<QuickBuyModalProps['item']>): CartItem {
  const quantity = Math.min(MAX_CART_QUANTITY, Math.max(1, item.quantity));
  return {
    id: `${item.product.id}-${item.color.name}-${item.size}`,
    product: item.product,
    selectedColor: item.color,
    selectedSize: item.size,
    quantity,
  };
}

export const QuickBuyModal: React.FC<QuickBuyModalProps> = ({
  item,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useBodyScrollLock(!!item);

  // Keyboard escape listener
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, submitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !item) return;

    const fullName = name.trim();
    const normalizedPhone = normalizePhoneNumber(phone) || phone.trim();
    const phoneDigits = normalizedPhone.replace(/\D/g, '');
    const trimmedCity = city.trim() || 'Душанбе';

    if (!fullName || !normalizedPhone || phoneDigits.length < 7) {
      setError('Укажите имя и корректный номер телефона (не менее 7 цифр).');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const result = await createOrder([toCartItem(item)], {
        fullName,
        phone: normalizedPhone,
        email: '',
        city: trimmedCity,
        deliveryMethod: 'courier',
        address: '',
        paymentMethod: 'cash',
        comment: 'Быстрый заказ (1 клик)',
      });

      setSubmitted(true);
      onSuccess(
        `Заказ № ${result.orderId.slice(0, 8)} на «${item.product.name}» оформлен. Итого: ${formatPrice(result.totals.totalAmount)} сомони. Мы перезвоним по номеру ${normalizedPhone}.`
      );
    } catch (err) {
      console.error('Failed to create quick-buy order:', err);
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ||
            'Не удалось оформить заказ. Проверьте наличие товара и попробуйте ещё раз.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const quantity = item ? Math.min(MAX_CART_QUANTITY, Math.max(1, item.quantity)) : 1;
  const totalPrice = item ? item.product.price * quantity : 0;

  return (
    <AnimatePresence>
      {item && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Быстрый заказ"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!submitting) onClose();
            }}
            className="absolute inset-0 bg-[#2C2008]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 border border-[#E8E0D5] max-h-[90vh] overflow-y-auto pb-safe z-10"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-[#E8E0D5] rounded-full mx-auto mb-4 sm:hidden" />

        <button
          onClick={onClose}
          disabled={submitting}
          aria-label="Закрыть окно"
          className="absolute top-3 right-3 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#7A695D] hover:text-[#33261D] rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-bold text-[#33261D] mb-1 pr-8">Покупка в 1 клик</h3>
        <p className="text-xs text-[#7A695D] mb-4">Оставьте свои контакты, и менеджер оформит доставку</p>

        <div className="flex gap-3 p-3 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5] mb-5">
          <img
            src={item.product.images[0]}
            alt={item.product.name}
            className="w-16 h-16 object-cover rounded-xl shrink-0 bg-white border border-[#E8E0D5]"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#33261D] truncate">{item.product.name}</h4>
            <div className="text-[11px] text-[#7A695D] mt-0.5">
              Цвет: {item.color.name} | Размер: {item.size} | {quantity} шт.
            </div>
            <div className="text-sm font-extrabold text-[#4A3A0B] mt-1">
              {formatPrice(totalPrice)} сомони
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-lg font-bold text-[#33261D]">Спасибо за заказ!</h4>
            <p className="text-xs text-[#7A695D] leading-relaxed">
              Заказ создан. Менеджер AMINA KIDS свяжется с вами для подтверждения доставки.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] mt-2 px-6 py-2.5 bg-[#E2A69B] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#33261D] mb-1">Ваше имя *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7A695D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Анна"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B] disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#33261D] mb-1">Номер телефона *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#7A695D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+992 (99) 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B] disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#33261D] mb-1">Город доставки</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#7A695D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Душанбе, Худжанд..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B] disabled:opacity-60"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] py-3.5 bg-[#E2A69B] hover:bg-[#C88B80] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Оформляем заказ...</span>
                </>
              ) : (
                <span>Подтвердить быстрый заказ</span>
              )}
            </button>

            <p className="text-[10px] text-center text-[#7A695D]">
              Нажимая кнопку, вы соглашаетесь с условиями конфиденциальности
            </p>
          </form>
        )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

