import React, { useState } from 'react';
import { CartItem, OrderDetails } from '../types';
import { CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Loader2, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { formatPrice, normalizePhoneNumber } from '../utils/format';
import { createOrder } from '../lib/orders';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onClearCart: () => void;
  onNavigateHome: () => void;
  promoCode: string;
  promoDiscount: number;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  onClearCart,
  onNavigateHome,
  promoCode,
  promoDiscount,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1Error, setStep1Error] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState<OrderDetails>({
    fullName: '',
    phone: '',
    email: '',
    city: 'Душанбе',
    deliveryMethod: 'courier',
    address: '',
    paymentMethod: 'card',
    comment: '',
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * promoDiscount);
  const deliveryFee = formData.deliveryMethod === 'showroom' ? 0 : (subtotal - discountAmount) >= 5000 ? 0 : 390;
  const grandTotal = subtotal - discountAmount + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitError('');
    setSubmitting(true);

    try {
      const normalizedPhone = normalizePhoneNumber(formData.phone) || formData.phone.trim();
      const result = await createOrder(cartItems, {
        ...formData,
        phone: normalizedPhone,
        promoCode: promoCode || undefined,
      });

      setOrderId(result.orderId);
      setConfirmedTotal(result.totals.totalAmount);
      setOrderComplete(true);
      onClearCart();
    } catch (error) {
      console.error('Failed to create order:', error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { message?: string; details?: string })?.message ||
            (error as { details?: string })?.details ||
            'Не удалось оформить заказ. Проверьте соединение с интернетом и попробуйте ещё раз, либо свяжитесь с нами по телефону.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center space-y-6 animate-fade-in pb-safe">
        <div className="w-20 h-20 rounded-full bg-[#F8EBE8] text-[#E2A69B] flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <span
            className="text-xs font-bold text-[#E2A69B] uppercase tracking-wider"
            title={orderId}
          >
            Заказ № {orderId.slice(0, 8)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A3A0B]">Спасибо за ваш заказ!</h1>
          <p className="text-xs sm:text-sm text-[#7A695D] max-w-md mx-auto leading-relaxed">
            Мы отправили подтверждение на {formData.email || 'указанный email'}. Наш менеджер свяжется с вами по номеру {formData.phone} для согласования деталей доставки и оплаты.
          </p>
        </div>

        {/* Order Receipt Box */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E8E0D5] text-left text-xs space-y-3 shadow-sm">
          <h3 className="font-bold text-[#33261D] border-b border-[#E8E0D5] pb-2.5">Детали заказа</h3>
          <div className="flex justify-between text-[#7A695D]">
            <span>Получатель:</span>
            <span className="font-semibold text-[#33261D]">{formData.fullName}</span>
          </div>
          <div className="flex justify-between text-[#7A695D]">
            <span>Город и адрес:</span>
            <span className="font-semibold text-[#33261D]">{formData.city}, {formData.address || 'Пункт выдачи'}</span>
          </div>
          <div className="flex justify-between text-[#7A695D]">
            <span>Способ оплаты:</span>
            <span className="font-semibold text-[#33261D]">
              {formData.paymentMethod === 'card' ? 'Банковская карта / перевод при получении' : 'Наличными при получении'}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#4A3A0B] pt-2.5 border-t border-[#E8E0D5]">
            <span>К оплате при получении:</span>
            <span>{formatPrice(confirmedTotal)} сомони</span>
          </div>
        </div>

        <button
          onClick={onNavigateHome}
          className="min-h-[48px] px-8 py-3.5 bg-[#E2A69B] hover:bg-[#C88B80] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 pb-safe">
        <h2 className="text-xl font-bold text-[#33261D]">Корзина пуста</h2>
        <p className="text-xs text-[#7A695D]">Добавьте товары в корзину, чтобы перейти к оформлению заказа</p>
        <button
          onClick={onNavigateHome}
          className="min-h-[44px] px-6 py-3 bg-[#E2A69B] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          В каталог
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-safe">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A3A0B]">Оформление заказа</h1>
        <p className="text-xs text-[#7A695D] mt-1">Заполните контактные данные для доставки заказа</p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between max-w-xl mx-auto bg-white p-2.5 sm:p-3.5 rounded-2xl border border-[#E8E0D5] shadow-xs">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors cursor-pointer ${
            step >= 1 ? 'text-[#E2A69B]' : 'text-gray-400'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-[#F8EBE8] text-[#E2A69B]' : 'bg-gray-100 text-gray-400'}`}>
            1
          </span>
          <span className="hidden sm:inline">Контакты</span>
        </button>
        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
        <button
          type="button"
          onClick={() => {
            const emailValid = /\S+@\S+\.\S+/.test(formData.email.trim());
            const phoneValid = normalizePhoneNumber(formData.phone).replace(/\D/g, '').length >= 7;
            if (formData.fullName.trim() && phoneValid && emailValid) {
              setStep(2);
            }
          }}
          className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors ${
            step >= 2 ? 'text-[#E2A69B]' : 'text-gray-400'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#F8EBE8] text-[#E2A69B]' : 'bg-gray-100 text-gray-400'}`}>
            2
          </span>
          <span className="hidden sm:inline">Доставка</span>
        </button>
        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
        <button
          type="button"
          onClick={() => {
            const emailValid = /\S+@\S+\.\S+/.test(formData.email.trim());
            const phoneValid = normalizePhoneNumber(formData.phone).replace(/\D/g, '').length >= 7;
            if (formData.fullName.trim() && phoneValid && emailValid) {
              setStep(3);
            }
          }}
          className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors ${
            step >= 3 ? 'text-[#E2A69B]' : 'text-gray-400'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#F8EBE8] text-[#E2A69B]' : 'bg-gray-100 text-gray-400'}`}>
            3
          </span>
          <span className="hidden sm:inline">Оплата</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-3xl border border-[#E8E0D5] shadow-sm">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* STEP 1: Contacts */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-base font-bold text-[#33261D] border-b border-[#E8E0D5] pb-3">
                  1. Данные получателя
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#33261D] mb-1.5">Имя и Фамилия *</label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Анна Рахимова"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full p-3 min-h-[44px] bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#33261D] mb-1.5">Телефон *</label>
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+992 (99) 000-00-00"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 min-h-[44px] bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#33261D] mb-1.5">Email для чека *</label>
                  <input
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    placeholder="anna@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 min-h-[44px] bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl text-xs text-[#33261D] focus:outline-none focus:border-[#E2A69B]"
                  />
                </div>

                <div className="pt-4 flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const emailValid = /\S+@\S+\.\S+/.test(formData.email.trim());
                      const phoneDigits = normalizePhoneNumber(formData.phone).replace(/\D/g, '');
                      if (!formData.fullName.trim()) {
                        setStep1Error('Укажите имя и фамилию получателя');
                      } else if (!formData.phone.trim() || phoneDigits.length < 7) {
                        setStep1Error('Укажите корректный номер телефона (не менее 7 цифр)');
                      } else if (!emailValid) {
                        setStep1Error('Укажите корректный email для отправки чека');
                      } else {
                        setStep1Error('');
                        setStep(2);
                      }
                    }}
                    className="w-full sm:w-auto min-h-[46px] px-7 py-3 bg-[#E2A69B] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#C88B80] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Далее к доставке</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {step1Error && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium text-right animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{step1Error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Delivery */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-base font-bold text-[#33261D] border-b border-[#E8E0D5] pb-3">
                  2. Способ доставки
                </h3>

                <div className="space-y-3">
                  {[
                    { id: 'pickup', title: 'Доставка по Таджикистану (пункт выдачи)', fee: 'от 390 сомони (Бесплатно от 5 000 сомони)' },
                    { id: 'courier', title: 'Курьерская доставка до двери', fee: 'от 390 сомони (Бесплатно от 5 000 сомони)' },
                    { id: 'showroom', title: 'Самовывоз из шоурума (Душанбе, ул. Рудаки, 22)', fee: 'Бесплатно' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                        formData.deliveryMethod === method.id
                          ? 'border-[#E2A69B] bg-[#F8EBE8] text-[#4A3A0B] ring-1 ring-[#E2A69B]'
                          : 'border-[#E8E0D5] bg-[#FAF6F0] text-[#33261D] hover:border-[#E2A69B]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={formData.deliveryMethod === method.id}
                          onChange={() => setFormData({ ...formData, deliveryMethod: method.id as any })}
                          className="w-4 h-4 accent-[#E2A69B] cursor-pointer"
                        />
                        <div>
                          <h4 className="text-xs font-bold leading-snug">{method.title}</h4>
                          <span className="text-[11px] text-[#7A695D]">{method.fee}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#33261D] mb-1.5">Город и точный адрес</label>
                  <input
                    type="text"
                    autoComplete="street-address"
                    placeholder="г. Душанбе, ул. Рудаки, д. 12, кв. 34"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 min-h-[44px] bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl text-xs focus:outline-none focus:border-[#E2A69B]"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="min-h-[44px] px-5 py-2.5 border border-[#E8E0D5] text-xs font-bold text-[#7A695D] rounded-xl hover:bg-[#FAF6F0] hover:text-[#33261D] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Назад</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="min-h-[44px] px-6 py-2.5 bg-[#E2A69B] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#C88B80] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Далее к оплате</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-base font-bold text-[#33261D] border-b border-[#E8E0D5] pb-3">
                  3. Способ оплаты
                </h3>

                <div className="space-y-3">
                  {[
                    { id: 'card', title: 'Банковская карта или перевод (Корти Милли, Visa, перевод при согласовании)' },
                    { id: 'cash', title: 'Наличными при получении (курьеру или в шоуруме)' },
                  ].map((pay) => (
                    <label
                      key={pay.id}
                      className={`flex items-center p-3.5 sm:p-4 rounded-2xl border cursor-pointer gap-3 transition-all ${
                        formData.paymentMethod === pay.id
                          ? 'border-[#E2A69B] bg-[#F8EBE8] text-[#4A3A0B] ring-1 ring-[#E2A69B]'
                          : 'border-[#E8E0D5] bg-[#FAF6F0] text-[#33261D] hover:border-[#E2A69B]/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={formData.paymentMethod === pay.id}
                        onChange={() => setFormData({ ...formData, paymentMethod: pay.id as any })}
                        className="w-4 h-4 accent-[#E2A69B] cursor-pointer"
                      />
                      <span className="text-xs font-bold">{pay.title}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={submitting}
                      className="min-h-[46px] px-5 py-2.5 border border-[#E8E0D5] text-xs font-bold text-[#7A695D] rounded-xl hover:bg-[#FAF6F0] hover:text-[#33261D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Назад</span>
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 min-h-[48px] py-3.5 px-6 bg-[#4A3A0B] hover:bg-[#2C2008] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Оформляем заказ...</span>
                        </>
                      ) : (
                        <span>Оформить заказ на {formatPrice(grandTotal)} сомони</span>
                      )}
                    </button>
                  </div>
                  {submitError && (
                    <div className="w-full flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-medium leading-relaxed">{submitError}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E0D5] shadow-sm space-y-4 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-[#33261D] border-b border-[#E8E0D5] pb-3 flex items-center justify-between">
            <span>Ваш заказ</span>
            <span className="text-xs font-semibold text-[#E2A69B]">{cartItems.length} товаров</span>
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 text-xs">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-lg border border-[#E8E0D5] shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#33261D] truncate">{item.product.name}</h4>
                  <div className="text-[10px] text-[#7A695D]">
                    {item.selectedColor.name} | {item.selectedSize} | {item.quantity} шт.
                  </div>
                  <div className="font-extrabold text-[#4A3A0B] mt-0.5">
                    {formatPrice((item.product.price * item.quantity))} сомони
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8E0D5] space-y-2 text-xs text-[#7A695D]">
            <div className="flex justify-between">
              <span>Товары:</span>
              <span className="font-bold text-[#33261D]">{formatPrice(subtotal)} сомони</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Скидка ({promoCode}):</span>
                <span>-{formatPrice(discountAmount)} сомони</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Доставка:</span>
              <span>{deliveryFee === 0 ? 'Бесплатно' : `${formatPrice(deliveryFee)} сомони`}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#4A3A0B] pt-2 border-t border-[#E8E0D5]">
              <span>Итого:</span>
              <span>{formatPrice(grandTotal)} сомони</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};