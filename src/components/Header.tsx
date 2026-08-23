import React, { useState, useEffect, useRef } from 'react';
import { PageType, Product } from '../types';
import { ShoppingBag, Heart, Search, Menu, X, Sparkles, Phone, ChevronRight, MessageCircle } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { useBodyScrollLock } from '../utils/useBodyScrollLock';

interface HeaderProps {
  activePage: PageType;
  onNavigate: (page: PageType) => void;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onOpenCart: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  cartCount,
  cartTotal,
  wishlistCount,
  onOpenCart,
  products,
  onSelectProduct,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useBodyScrollLock(mobileMenuOpen || searchOpen);

  // Focus search input when opened & handle Escape key
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSearchOpen(false);
          setSearchQuery('');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [searchOpen]);

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const popularSearches = ['Муслиновое платье', 'Комбинезон', 'Комплект', 'Пеленка', 'Для малышей'];

  const handleProductSearchClick = (product: Product) => {
    onSelectProduct(product);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const navLinks: { label: string; page: PageType }[] = [
    { label: 'Главная', page: 'home' },
    { label: 'Каталог', page: 'catalog' },
    { label: 'О бренде', page: 'about' },
    { label: 'Доставка и оплата', page: 'shipping' },
    { label: 'Контакты', page: 'contacts' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-nav border-b border-[#E8E0D5]/80 shadow-[0_2px_12px_rgba(74,58,11,0.03)] transition-all">
      {/* Announcement Top Bar */}
      <div className="bg-[#4A3A0B] text-[#F7F1E5] text-[11px] font-medium py-1.5 px-3 sm:px-4 text-center flex items-center justify-center gap-1.5 border-b border-[#E2A69B]/20">
        <Sparkles className="w-3.5 h-3.5 text-[#E2A69B] shrink-0" aria-hidden="true" />
        <span className="truncate max-w-[92vw] sm:max-w-none">
          Бесплатная доставка от 5 000 сомони по Таджикистану • Промокод <strong className="text-[#E2A69B] font-bold">FIRST10</strong> (-10%)
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-[#4A3A0B] hover:text-[#E2A69B] active:scale-95 transition-all"
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть главное меню'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer flex items-center gap-2.5 sm:gap-3 group select-none py-1"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
            aria-label="AMINA KIDS на главную"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] border border-[#E2A69B]/40 group-hover:bg-[#E2A69B] group-hover:text-white transition-all duration-300 shadow-sm">
              <span className="font-serif font-bold text-lg sm:text-xl leading-none">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-serif tracking-widest text-[#4A3A0B] font-bold uppercase leading-none">
                Amina <span className="text-[#E2A69B]">Kids</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#7A695D] font-semibold mt-1">
                Премиальный муслин
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold uppercase tracking-wider text-[#4A3A0B]/80" aria-label="Основная навигация">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`relative py-2 transition-colors cursor-pointer ${
                  activePage === link.page
                    ? 'text-[#4A3A0B] font-extrabold'
                    : 'text-[#4A3A0B]/70 hover:text-[#E2A69B]'
                }`}
              >
                {link.label}
                {activePage === link.page && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E2A69B] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Action Buttons (Search, Wishlist, Cart) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Desktop Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-[#F7F1E5] hover:bg-[#EFE7D8] border border-[#E8E0D5] rounded-full py-1.5 px-3.5 text-xs text-[#7A695D] hover:text-[#4A3A0B] transition-all cursor-pointer min-h-[38px] w-36 md:w-48 group text-left"
              aria-label="Открыть поиск товаров"
            >
              <Search className="w-3.5 h-3.5 text-[#7A695D] group-hover:text-[#E2A69B] transition-colors shrink-0" />
              <span className="truncate">Поиск товаров...</span>
            </button>

            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[#4A3A0B] hover:text-[#E2A69B] active:scale-95 transition-all"
              aria-label="Поиск товаров"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all active:scale-95 ${
                activePage === 'wishlist'
                  ? 'text-[#E2A69B] bg-[#F8EBE8]'
                  : 'text-[#4A3A0B] hover:text-[#E2A69B] hover:bg-[#F8EBE8]/60'
              }`}
              aria-label={`Избранное, товаров: ${wishlistCount}`}
            >
              <Heart className={`w-5 h-5 transition-transform ${wishlistCount > 0 ? 'text-[#E2A69B] fill-[#E2A69B] scale-105' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#E2A69B] text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 min-h-[44px] py-2 px-3 sm:px-4 rounded-full bg-[#F8EBE8] hover:bg-[#E2A69B] text-[#4A3A0B] hover:text-white transition-all duration-300 border border-[#E2A69B]/40 active:scale-95 shadow-sm group"
              aria-label={`Корзина, товаров: ${cartCount}, сумма: ${formatPrice(cartTotal)} сомони`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-[#4A3A0B] text-[#F7F1E5] text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-extrabold shadow-sm ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider">
                {cartTotal > 0 ? `${formatPrice(cartTotal)} с.` : 'Корзина'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#2C2008]/60 backdrop-blur-sm flex items-start justify-center pt-3 sm:pt-16 px-3 sm:px-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Поиск по каталогу"
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery('');
          }}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#E8E0D5] animate-modal-in flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-3.5 sm:p-4 border-b border-[#E8E0D5] flex items-center gap-3 bg-[#FDFBF7]">
              <Search className="w-5 h-5 text-[#E2A69B] shrink-0" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Поиск по названию или категории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm sm:text-base text-[#4A3A0B] bg-transparent focus:outline-none placeholder-[#7A695D]/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#7A695D] hover:text-[#4A3A0B] text-xs font-semibold rounded-lg"
                  aria-label="Очистить поисковый запрос"
                >
                  Очистить
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#7A695D] hover:text-[#4A3A0B] hover:bg-[#F8EBE8] rounded-xl transition-colors shrink-0 -mr-1"
                aria-label="Закрыть поиск"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestions when empty */}
            {searchQuery.trim() === '' && (
              <div className="p-4 sm:p-6 bg-[#FAF6F0]/50">
                <p className="text-xs font-bold text-[#7A695D] uppercase tracking-wider mb-3">
                  Популярные запросы:
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#E8E0D5] text-[#4A3A0B] hover:border-[#E2A69B] hover:text-[#E2A69B] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="overflow-y-auto p-3 sm:p-4 divide-y divide-[#E8E0D5]/60 flex-1">
              {searchQuery.trim() !== '' && filteredProducts.length === 0 ? (
                <div className="text-center py-10 px-4 text-[#7A695D]">
                  <p className="text-sm font-semibold text-[#4A3A0B]">Ничего не найдено</p>
                  <p className="text-xs mt-1">Попробуйте изменить запрос или проверить категорию</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSearchClick(product)}
                    className="py-3 px-2.5 sm:px-3 flex items-center justify-between hover:bg-[#F8EBE8]/40 rounded-xl cursor-pointer transition-colors group"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-14 object-cover rounded-lg border border-[#E8E0D5] bg-[#F8EBE8] shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#4A3A0B] group-hover:text-[#E2A69B] transition-colors truncate">
                          {product.name}
                        </h4>
                        <span className="text-[11px] text-[#7A695D]">{product.subcategory}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-xs sm:text-sm font-extrabold text-[#4A3A0B] block">
                        {formatPrice(product.price)} с.
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Меню навигации">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#2C2008]/60 backdrop-blur-sm animate-fade-in"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col justify-between p-5 sm:p-6 overflow-y-auto border-r border-[#E8E0D5] animate-drawer-in-left pb-safe">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E0D5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] border border-[#E2A69B]/40 font-serif font-bold text-base">
                    A
                  </div>
                  <span className="font-serif font-bold text-base text-[#4A3A0B] tracking-wider">
                    AMINA KIDS
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-[#7A695D] hover:text-[#4A3A0B] rounded-xl"
                  aria-label="Закрыть меню"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5" aria-label="Мобильная навигация">
                {navLinks.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => {
                      onNavigate(link.page);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      activePage === link.page
                        ? 'bg-[#F8EBE8] text-[#E2A69B] font-extrabold shadow-sm'
                        : 'text-[#4A3A0B] hover:bg-[#FAF6F0] active:bg-[#F8EBE8]'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className={`w-4 h-4 ${activePage === link.page ? 'text-[#E2A69B]' : 'text-[#7A695D]/50'}`} />
                  </button>
                ))}
              </nav>

              {/* Quick Wishlist Link in Mobile Drawer */}
              <div className="mt-4 pt-4 border-t border-[#E8E0D5]/70">
                <button
                  onClick={() => {
                    onNavigate('wishlist');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F8EBE8] transition-colors text-[#4A3A0B] text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#E2A69B]" />
                    <span>Избранное</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-[#E2A69B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Drawer Bottom Contacts */}
            <div className="pt-6 border-t border-[#E8E0D5] space-y-3.5 text-xs text-[#7A695D]">
              <a
                href="tel:+992990123456"
                className="flex items-center gap-2.5 font-bold text-[#4A3A0B] hover:text-[#E2A69B] transition-colors min-h-[44px]"
              >
                <div className="w-8 h-8 rounded-full bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B]">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+992 (99) 012-34-56</span>
              </a>

              <a
                href="https://wa.me/992990123456"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 font-semibold text-[#4A3A0B] hover:text-[#E2A69B] transition-colors min-h-[44px]"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span>Написать в WhatsApp</span>
              </a>

              <p className="text-[11px] text-[#7A695D]/80 pt-1">
                Ежедневно с 09:00 до 21:00 (Душанбе)
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};