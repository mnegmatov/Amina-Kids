import React from 'react';
import { Truck, CreditCard } from 'lucide-react';

export const ShippingPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A3A0B]">Доставка и оплата</h1>
        <p className="text-xs text-[#7A695D]">Вся информация об условиях отправки и способах оплаты</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-[#E8E0D5] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F8EBE8] text-[#E2A69B] flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#33261D]">Способы доставки</h3>
          <ul className="text-xs text-[#7A695D] space-y-2 leading-relaxed">
            <li>• <strong>Доставка по Таджикистану (пункт выдачи):</strong> от 1 до 5 дней. Бесплатно при заказе от 5 000 сомони.</li>
            <li>• <strong>Курьерская доставка:</strong> доставка до двери в пределах города и области.</li>
            <li>• <strong>Самовывоз из шоурума:</strong> г. Душанбе, ул. Рудаки, д. 22.</li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-[#E8E0D5] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F8EBE8] text-[#E2A69B] flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#33261D]">Способы оплаты</h3>
          <ul className="text-xs text-[#7A695D] space-y-2 leading-relaxed">
            <li>• <strong>Оплата при получении:</strong> наличными или картой (Корти Милли, Visa, Mastercard) курьеру или в шоуруме.</li>
            <li>• <strong>Перевод / QR-оплата:</strong> Корти Милли, Алиф, Душанбе Сити по согласованию с менеджером при подтверждении заказа.</li>
            <li>• <strong>Без предоплаты:</strong> оплата только после проверки заказа при получении.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};