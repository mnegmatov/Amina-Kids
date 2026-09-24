import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PageType, Product, ProductCategory } from '../types';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Sparkles,
  Phone,
  ChevronRight,
  MessageCircle,
  Layers,
  Sparkle,
} from 'lucide-react';
import { formatPrice } from '../utils/format';
import { useBodyScrollLock } from '../utils/useBodyScrollLock';
import { AnimatePresence, motion } from 'motion/react';

interface HeaderProps {
  activePage: PageType;
  onNavigate: (page: PageType, category?: ProductCategory) => void;
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

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Handle Escape key for both search and mobile drawer
  useEffect(() => {
    if (!searchOpen && !mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchOpen) {
          setSearchOpen(false);
          setSearchQuery('');
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, mobileMenuOpen]);

  // Close mobile drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

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

  const categories: { label: string; category: ProductCategory; tag: string }[] = [
    { label: 'Девочкам', category: 'girls', tag: 'Платья, костюмы, юбки' },
    { label: 'Мальчикам', category: 'boys', tag: 'Рубашки, шорты, комплекты' },
    { label: 'Малышам (0–24 мес)', category: 'babies', tag: 'Боди, песочники, ромперы' },
    { label: 'Аксессуары', category: 'accessories', tag: 'Панамки, слюнявчики, пледы' },
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
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-[#4A3A0B] hover:text-[#E2A69B] active:scale-90 transition-transform cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2A69B]"
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть главное меню'}
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90, scale: 0.85 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.85 }}
                    transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90, scale: 0.85 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.85 }}
                    transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
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
              className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer ${
                activePage === 'wishlist'
                  ? 'text-[#E2A69B] bg-[#F8EBE8]'
                  : 'text-[#4A3A0B] hover:text-[#E2A69B] hover:bg-[#F8EBE8]/60'
              }`}
              aria-label={`Избранное, товаров: ${wishlistCount}`}
            >
              <Heart className={`w-5 h-5 transition-transform ${wishlistCount > 0 ? 'text-[#E2A69B] fill-[#E2A69B] scale-105' : ''}`} />
              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span
                    key={wishlistCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute top-1 right-1 bg-[#E2A69B] text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-white"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 min-h-[44px] py-2 px-3 sm:px-4 rounded-full bg-[#F8EBE8] hover:bg-[#E2A69B] text-[#4A3A0B] hover:text-white transition-all duration-300 border border-[#E2A69B]/40 active:scale-95 shadow-sm group cursor-pointer"
              aria-label={`Корзина, товаров: ${cartCount}, сумма: ${formatPrice(cartTotal)} сомони`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-2.5 -right-2.5 bg-[#4A3A0B] text-[#F7F1E5] text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-extrabold shadow-sm ring-2 ring-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider">
                {cartTotal > 0 ? `${formatPrice(cartTotal)} с.` : 'Корзина'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Search Modal - Mounted directly to body via createPortal to prevent containing-block / backdrop-filter issues */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {searchOpen && (
              <div
                className="fixed inset-0 z-50 flex items-start justify-center pt-3 sm:pt-16 px-3 sm:px-4"
                role="dialog"
                aria-modal="true"
                aria-label="Поиск по каталогу"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-[#2C2008]/60 backdrop-blur-sm"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#E8E0D5] flex flex-col max-h-[85dvh] z-10"
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
                      className="w-full text-base text-[#4A3A0B] bg-transparent focus:outline-none placeholder-[#7A695D]/60 min-h-[44px]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#7A695D] hover:text-[#4A3A0B] text-xs font-semibold rounded-lg cursor-pointer"
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
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#7A695D] hover:text-[#4A3A0B] hover:bg-[#F8EBE8] rounded-xl transition-colors shrink-0 -mr-1 cursor-pointer"
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
                            className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#E8E0D5] text-[#4A3A0B] hover:border-[#E2A69B] hover:text-[#E2A69B] transition-colors cursor-pointer"
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
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Mobile Navigation Drawer - Mounted directly to body via createPortal to avoid header stacking context / backdrop-filter containing block */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <div
                className="fixed inset-0 z-50 lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Главное меню навигации"
              >
                {/* Full Viewport Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-[#2C2008]/60 backdrop-blur-xs cursor-pointer"
                  aria-hidden="true"
                />

                {/* Drawer Panel */}
                <motion.aside
                  initial={{ transform: 'translateX(-100%)' }}
                  animate={{ transform: 'translateX(0%)' }}
                  exit={{ transform: 'translateX(-100%)' }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                  className="fixed top-0 bottom-0 left-0 z-50 w-[85vw] max-w-[340px] bg-white shadow-2xl flex flex-col border-r border-[#E8E0D5] h-[100dvh] max-h-[100dvh] overflow-hidden select-none"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Главное меню навигации"
                >
                  {/* Drawer Header (non-collapsible) */}
                  <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#E8E0D5] bg-[#FDFBF7]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] border border-[#E2A69B]/40 font-serif font-bold text-base shadow-xs">
                        A
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-sm tracking-wider text-[#4A3A0B] uppercase leading-tight">
                          Amina <span className="text-[#E2A69B]">Kids</span>
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-[#7A695D] font-semibold">
                          Премиальный муслин
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-1 text-[#7A695D] hover:text-[#4A3A0B] hover:bg-[#F8EBE8]/60 active:scale-90 rounded-xl transition-all cursor-pointer"
                      aria-label="Закрыть меню"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Drawer Scrollable Body */}
                  <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
                    {/* Primary Navigation Links */}
                    <nav className="space-y-1" aria-label="Основные страницы">
                      <button
                        onClick={() => {
                          onNavigate('home');
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activePage === 'home'
                            ? 'bg-[#F8EBE8] text-[#4A3A0B] font-extrabold shadow-xs'
                            : 'text-[#4A3A0B] hover:bg-[#FAF6F0] active:bg-[#F8EBE8]'
                        }`}
                      >
                        <span>Главная</span>
                        <ChevronRight className={`w-4 h-4 ${activePage === 'home' ? 'text-[#E2A69B]' : 'text-[#7A695D]/40'}`} />
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('catalog', 'all');
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activePage === 'catalog'
                            ? 'bg-[#F8EBE8] text-[#4A3A0B] font-extrabold shadow-xs'
                            : 'text-[#4A3A0B] hover:bg-[#FAF6F0] active:bg-[#F8EBE8]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#E2A69B]" />
                          <span>Каталог (все товары)</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${activePage === 'catalog' ? 'text-[#E2A69B]' : 'text-[#7A695D]/40'}`} />
                      </button>
                    </nav>

                    {/* Muslin Categories Card */}
                    <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-[#E8E0D5]/70 space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A695D]">
                          Категории муслина
                        </span>
                        <Sparkle className="w-3 h-3 text-[#E2A69B]" />
                      </div>
                      <div className="space-y-1">
                        {categories.map((cat) => (
                          <button
                            key={cat.category}
                            onClick={() => {
                              onNavigate('catalog', cat.category);
                              setMobileMenuOpen(false);
                            }}
                            className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-[#F8EBE8]/60 border border-[#E8E0D5]/50 transition-all text-left group cursor-pointer active:scale-[0.98]"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-bold text-[#4A3A0B] group-hover:text-[#E2A69B] transition-colors block truncate">
                                {cat.label}
                              </span>
                              <span className="text-[10px] text-[#7A695D]/80 block truncate">
                                {cat.tag}
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[#7A695D]/50 group-hover:text-[#E2A69B] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wishlist & Info Pages */}
                    <div className="space-y-1 pt-1">
                      <button
                        onClick={() => {
                          onNavigate('wishlist');
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activePage === 'wishlist'
                            ? 'bg-[#F8EBE8] text-[#E2A69B] font-extrabold shadow-xs'
                            : 'text-[#4A3A0B] hover:bg-[#FAF6F0] active:bg-[#F8EBE8]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-[#E2A69B] fill-[#E2A69B]' : 'text-[#E2A69B]'}`} />
                          <span>Избранное</span>
                        </div>
                        {wishlistCount > 0 && (
                          <span className="bg-[#E2A69B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            {wishlistCount}
                          </span>
                        )}
                      </button>

                      {navLinks
                        .filter((l) => l.page !== 'home' && l.page !== 'catalog')
                        .map((link) => (
                          <button
                            key={link.page}
                            onClick={() => {
                              onNavigate(link.page);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              activePage === link.page
                                ? 'bg-[#F8EBE8] text-[#E2A69B] font-extrabold shadow-xs'
                                : 'text-[#4A3A0B] hover:bg-[#FAF6F0] active:bg-[#F8EBE8]'
                            }`}
                          >
                            <span>{link.label}</span>
                            <ChevronRight className={`w-4 h-4 ${activePage === link.page ? 'text-[#E2A69B]' : 'text-[#7A695D]/40'}`} />
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Drawer Footer (non-collapsible, with safe-area padding) */}
                  <div className="shrink-0 p-4 border-t border-[#E8E0D5] pb-safe bg-[#FAF6F0]/80 space-y-2.5">
                    <a
                      href="tel:+992990123456"
                      className="flex items-center gap-2.5 font-bold text-xs text-[#4A3A0B] hover:text-[#E2A69B] transition-colors min-h-[44px] px-2 py-1 rounded-xl hover:bg-white/80"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold">+992 (99) 012-34-56</span>
                        <span className="block text-[10px] font-normal text-[#7A695D]">Прямой звонок</span>
                      </div>
                    </a>

                    <a
                      href="https://wa.me/992990123456"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 font-semibold text-xs text-[#4A3A0B] hover:text-emerald-700 transition-colors min-h-[44px] px-2 py-1 rounded-xl hover:bg-white/80"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-emerald-800">Написать в WhatsApp</span>
                        <span className="block text-[10px] font-normal text-[#7A695D]">Быстрая консультация</span>
                      </div>
                    </a>

                    <p className="text-[10px] text-[#7A695D]/80 pt-1 text-center border-t border-[#E8E0D5]/50">
                      Ежедневно с 09:00 до 21:00 • Душанбе
                    </p>
                  </div>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
};