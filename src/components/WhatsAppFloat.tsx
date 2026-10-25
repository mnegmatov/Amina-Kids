import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppFloatProps {
  phone?: string;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({
  phone = '992990123456',
}) => {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  const message = encodeURIComponent(
    'Здравствуйте! Хочу проконсультироваться по поводу одежды в интернет-магазине Amina Kids.'
  );
  const waUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 select-none">
      {/* Speech Bubble / Tooltip */}
      {!tooltipDismissed && (
        <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-[0_4px_20px_rgba(74,58,11,0.12)] border border-[#E8E0D5] text-xs text-[#4A3A0B] animate-fade-in">
          <span className="font-semibold">Помочь с размером?</span>
          <button
            onClick={() => setTooltipDismissed(true)}
            className="text-[#7A695D] hover:text-[#4A3A0B] p-0.5 rounded-full hover:bg-gray-100 cursor-pointer"
            aria-label="Закрыть подсказку"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Связаться в WhatsApp"
        className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center shadow-[0_6px_24px_rgba(37,211,102,0.4)] active:scale-95 transition-all duration-200 group cursor-pointer"
      >
        <MessageCircle className="w-6 h-6 fill-current group-hover:scale-110 transition-transform duration-200" />
      </a>
    </div>
  );
};
