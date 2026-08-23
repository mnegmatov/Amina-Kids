import React from 'react';
import { PageType, ProductCategory } from '../types';
import { ArrowUp, MapPin, Phone, Mail, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageType, category?: ProductCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#4A3A0B] text-[#F7F1E5] px-4 sm:px-8 lg:px-12 pt-10 sm:pt-12 pb-12 sm:pb-10 border-t border-[#E2A69B]/20 pb-safe">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-12">
          {/* Brand Info */}
          <div className="space-y-3.5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E2A69B] flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
                A
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-widest uppercase">
                Amina <span className="text-[#E2A69B]">Kids</span>
              </span>
            </div>
            <p className="text-xs text-[#F7F1E5]/80 leading-relaxed max-w-sm">
              Интернет-магазин премиальной детской одежды. 100% натуральный двухслойный муслин, сертифицированный эко-хлопок и гипоаллергенный крой.
            </p>
          </div>

          {/* Catalog Links */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#E2A69B] font-bold mb-3.5">Каталог</p>
            <ul className="space-y-2.5 text-xs font-medium text-[#F7F1E5]/80">
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'girls')}
                  className="hover:text-[#E2A69B] active:text-[#E2A69B] transition-colors py-1 cursor-pointer text-left"
                >
                  Девочкам
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'boys')}
                  className="hover:text-[#E2A69B] active:text-[#E2A69B] transition-colors py-1 cursor-pointer text-left"
                >
                  Мальчикам
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'babies')}
                  className="hover:text-[#E2A69B] active:text-[#E2A69B] transition-colors py-1 cursor-pointer text-left"
                >
                  Малышам (0-24 мес)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'accessories')}
                  className="hover:text-[#E2A69B] active:text-[#E2A69B] transition-colors py-1 cursor-pointer text-left"
                >
                  Аксессуары и головные уборы
                </button>
              </li>
            </ul>
          </div>

          {/* Customers Info */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#E2A69B] font-bold mb-3.5">Покупателям</p>
            <ul className="space-y-2.5 text-xs font-medium text-[#F7F1E5]/80">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#E2A69B] active:text-[#E2A69B] transition-colors py-1 cursor-pointer text-left"
                >
                  О бренде AMINA KIDS
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shipping')}
                  className="hover:text-[#E2A69B] active:text-[#E2A69B] transition-colors py-1 cursor-pointer text-left"
                >
                  Доставка и оплата
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contacts')}
                  className="hover:text-[#E2A69B] active:text-[#E2A69B] transition-colors py-1 cursor-pointer text-left"
                >
                  Шоурум и контакты
                </button>
              </li>
            </ul>
          </div>

          {/* Contacts & Social */}
          <div className="space-y-3.5">
            <p className="text-[11px] uppercase tracking-widest text-[#E2A69B] font-bold mb-3.5">Контакты</p>
            <div className="space-y-2 text-xs text-[#F7F1E5]/90">
              <p className="font-semibold text-sm text-white">+992 (99) 012-34-56</p>
              <p className="opacity-80">Душанбе, пр. Рудаки, 22</p>
              <p className="opacity-80">hello@aminakids.tj</p>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Наш Instagram"
                className="w-9 h-9 rounded-full border border-[#F7F1E5]/20 flex items-center justify-center cursor-pointer hover:bg-[#E2A69B] hover:border-[#E2A69B] active:scale-95 transition-all text-white"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                aria-label="Наш Telegram канал"
                className="w-9 h-9 rounded-full border border-[#F7F1E5]/20 flex items-center justify-center cursor-pointer hover:bg-[#E2A69B] hover:border-[#E2A69B] active:scale-95 transition-all text-white"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noreferrer"
                aria-label="Связаться в WhatsApp"
                className="w-9 h-9 rounded-full border border-[#F7F1E5]/20 flex items-center justify-center cursor-pointer hover:bg-[#E2A69B] hover:border-[#E2A69B] active:scale-95 transition-all text-white"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-[#E2A69B]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#F7F1E5]/70 text-center sm:text-left">
          <p>© 2026 Amina Kids. Все права защищены. Сделано с любовью для ваших детей.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#F7F1E5]/60">Оплата картой и наличными</span>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full border border-[#F7F1E5]/30 flex items-center justify-center hover:bg-[#E2A69B] hover:border-[#E2A69B] active:scale-95 transition-all text-white cursor-pointer"
              title="Наверх"
              aria-label="Прокрутить наверх"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

