import React, { useState, useMemo } from 'react';
import { Product, ProductCategory, FilterState, ProductColor } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, X, RotateCcw, Search, LayoutGrid, Square, Check } from 'lucide-react';
import { useBodyScrollLock } from '../utils/useBodyScrollLock';

interface CatalogPageProps {
  products: Product[];
  initialCategory?: ProductCategory | 'all';
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onSelectProduct: (product: Product) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  initialCategory = 'all',
  onOpenQuickView,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  onSelectProduct,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileGridCols, setMobileGridCols] = useState<1 | 2>(2);

  useBodyScrollLock(mobileFilterOpen);

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    subcategory: 'all',
    gender: 'all',
    ageGroup: 'all',
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 10000,
    onlyDiscount: false,
    searchQuery: '',
    sortBy: 'popular',
  });

  const categoryLabels: Record<string, string> = {
    girls: 'Девочкам',
    boys: 'Мальчикам',
    babies: 'Малышам',
    accessories: 'Аксессуары',
  };

  const availableSizes = ['56', '62', '68', '74', '80', '86', '92', '98', '104', '110', '116', '122', '128'];
  const availableColors = [
    { name: 'Пудрово-розовый', hex: '#E2A69B' },
    { name: 'Какао', hex: '#4A3A0B' },
    { name: 'Молочный', hex: '#F7F1E5' },
    { name: 'Песочный', hex: '#D2B48C' },
    { name: 'Корица', hex: '#A0522D' },
    { name: 'Шалфей', hex: '#9CAF88' },
  ];

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      subcategory: 'all',
      gender: 'all',
      ageGroup: 'all',
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 10000,
      onlyDiscount: false,
      searchQuery: '',
      sortBy: 'popular',
    });
  };

  const toggleSizeFilter = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColorFilter = (colorHex: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(colorHex)
        ? prev.colors.filter((c) => c !== colorHex)
        : [...prev.colors, colorHex],
    }));
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filters.category !== 'all' && p.category !== filters.category) return false;
        if (filters.gender !== 'all' && p.gender !== filters.gender && p.gender !== 'unisex') return false;
        if (filters.ageGroup !== 'all' && p.ageGroup !== filters.ageGroup) return false;
        if (filters.onlyDiscount && !p.discount) return false;
        if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
        if (filters.sizes.length > 0 && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
        if (filters.colors.length > 0 && !p.colors.some((c) => filters.colors.includes(c.hex))) return false;
        if (
          filters.searchQuery &&
          !p.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !p.subcategory.toLowerCase().includes(filters.searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'discount') return (b.discount || 0) - (a.discount || 0);
        if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return (b.isHit ? 1 : 0) - (a.isHit ? 1 : 0);
      });
  }, [products, filters]);

  const activeFiltersCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.gender !== 'all' ? 1 : 0) +
    (filters.ageGroup !== 'all' ? 1 : 0) +
    (filters.onlyDiscount ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    (filters.minPrice > 0 || filters.maxPrice < 10000 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Title & Search bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E0D5] pb-5 sm:pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif text-[#4A3A0B] font-bold tracking-tight">
            Коллекция одежды AMINA KIDS
          </h1>
          <p className="text-xs sm:text-sm text-[#7A695D] mt-1">
            Найдено <strong className="text-[#4A3A0B] font-bold">{filteredProducts.length}</strong> моделей из премиального муслина
          </p>
        </div>

        {/* Search input in catalog */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7A695D] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            placeholder="Искать в каталоге..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-[#E8E0D5] rounded-full text-xs text-[#4A3A0B] focus:outline-none focus:border-[#E2A69B] shadow-sm placeholder-[#7A695D]/60 min-h-[42px]"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A695D] hover:text-[#4A3A0B] p-1"
              aria-label="Очистить поиск"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:flex w-64 border border-[#E8E0D5] p-5 rounded-2xl flex-col gap-5 bg-white shrink-0 sticky top-24 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A3A0B] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#E2A69B]" />
              Фильтры
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#E2A69B] hover:text-[#C88B80] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Сбросить
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A695D]">Категория</span>
            <ul className="flex flex-col gap-1.5 text-xs font-medium">
              {[
                { id: 'all', label: 'Все модели' },
                { id: 'girls', label: 'Девочкам' },
                { id: 'boys', label: 'Мальчикам' },
                { id: 'babies', label: 'Малышам (0-24 мес)' },
                { id: 'accessories', label: 'Аксессуары' },
              ].map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, category: cat.id as ProductCategory | 'all' })}
                    className={`w-full flex justify-between items-center py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer ${
                      filters.category === cat.id
                        ? 'bg-[#F8EBE8] text-[#4A3A0B] font-bold'
                        : 'text-[#4A3A0B]/80 hover:bg-[#FAF6F0] hover:text-[#4A3A0B]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] text-[#7A695D]">
                      {cat.id === 'all' ? products.length : products.filter((p) => p.category === cat.id).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Age Group */}
          <div className="space-y-2 border-t border-[#E8E0D5] pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A695D]">Возраст</span>
            <div className="flex flex-col gap-1 text-xs">
              {[
                { id: 'all', label: 'Все возрасты' },
                { id: '0-2', label: '0–2 года' },
                { id: '2-5', label: '2–5 лет' },
                { id: '6-10', label: '6–10 лет' },
              ].map((age) => (
                <button
                  key={age.id}
                  onClick={() => setFilters({ ...filters, ageGroup: age.id as FilterState['ageGroup'] })}
                  className={`text-left py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                    filters.ageGroup === age.id
                      ? 'bg-[#F8EBE8] text-[#4A3A0B] font-bold'
                      : 'text-[#4A3A0B]/80 hover:bg-[#FAF6F0]'
                  }`}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes Grid */}
          <div className="space-y-2.5 border-t border-[#E8E0D5] pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A695D]">Размер (Рост)</span>
            <div className="grid grid-cols-3 gap-1.5">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSizeFilter(s)}
                  className={`py-1.5 text-center text-xs rounded-lg transition-all cursor-pointer border ${
                    filters.sizes.includes(s)
                      ? 'border-[#4A3A0B] bg-[#4A3A0B] text-white font-bold shadow-sm'
                      : 'border-[#E8E0D5] text-[#4A3A0B] bg-[#FAF6F0] hover:border-[#E2A69B]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2.5 border-t border-[#E8E0D5] pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A695D]">Цветовая палитра</span>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => toggleColorFilter(c.hex)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                    filters.colors.includes(c.hex)
                      ? 'ring-2 ring-offset-2 ring-[#4A3A0B] scale-110'
                      : 'border-black/15 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                >
                  {filters.colors.includes(c.hex) && (
                    <Check className="w-3 h-3 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Only Toggle */}
          <div className="border-t border-[#E8E0D5] pt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4A3A0B]">
              Только со скидкой
            </span>
            <input
              type="checkbox"
              checked={filters.onlyDiscount}
              onChange={(e) => setFilters({ ...filters, onlyDiscount: e.target.checked })}
              className="accent-[#E2A69B] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {/* Quote Block */}
          <div className="mt-1 p-3.5 bg-[#FAF6F0] rounded-xl border border-[#E8E0D5]">
            <p className="text-[11px] leading-relaxed italic text-center text-[#7A695D]">
              «100% хлопковый муслин — мягкость и забота о коже с первых дней жизни.»
            </p>
          </div>
        </aside>

        {/* Catalog Content Area */}
        <div className="flex-1 space-y-4 sm:space-y-6 w-full">
          {/* Top Control Bar (Mobile Filters toggle & Sorting & Grid Density) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E8E0D5] shadow-sm">
            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden min-h-[42px] flex items-center gap-2 px-3.5 py-2 bg-[#F8EBE8] hover:bg-[#E2A69B] hover:text-white rounded-xl text-xs font-bold text-[#4A3A0B] border border-[#E2A69B]/40 active:scale-95 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#E2A69B]" />
              <span>Фильтры</span>
              {activeFiltersCount > 0 && (
                <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-[#4A3A0B] text-white text-[10px] flex items-center justify-center font-extrabold ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Mobile View Toggle (1 col vs 2 col) */}
            <div className="sm:hidden flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#E8E0D5]">
              <button
                onClick={() => setMobileGridCols(1)}
                className={`p-1.5 rounded-lg transition-colors ${
                  mobileGridCols === 1
                    ? 'bg-white text-[#4A3A0B] shadow-sm'
                    : 'text-[#7A695D] hover:text-[#4A3A0B]'
                }`}
                aria-label="1 колонка"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileGridCols(2)}
                className={`p-1.5 rounded-lg transition-colors ${
                  mobileGridCols === 2
                    ? 'bg-white text-[#4A3A0B] shadow-sm'
                    : 'text-[#7A695D] hover:text-[#4A3A0B]'
                }`}
                aria-label="2 колонки"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs text-[#7A695D] ml-auto">
              <span className="hidden sm:inline font-medium">Сортировка:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
                className="bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2 px-3 text-xs font-semibold text-[#4A3A0B] focus:outline-none focus:border-[#E2A69B] min-h-[42px] cursor-pointer"
              >
                <option value="popular">По популярности</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
                <option value="discount">По размеру скидки</option>
                <option value="newest">Новинки</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-1">
              <span className="text-xs text-[#7A695D] font-medium">Применено:</span>
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8EBE8] text-[#4A3A0B] text-xs font-semibold rounded-full border border-[#E2A69B]/40">
                  <span>{categoryLabels[filters.category] ?? filters.category}</span>
                  <button
                    onClick={() => setFilters({ ...filters, category: 'all' })}
                    className="p-0.5 hover:text-[#E2A69B]"
                    aria-label="Удалить фильтр категории"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {filters.ageGroup !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6F0] text-[#4A3A0B] text-xs font-semibold rounded-full border border-[#E8E0D5]">
                  <span>Возраст: {filters.ageGroup}</span>
                  <button
                    onClick={() => setFilters({ ...filters, ageGroup: 'all' })}
                    className="p-0.5 hover:text-[#E2A69B]"
                    aria-label="Удалить фильтр возраста"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {filters.sizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6F0] text-[#4A3A0B] text-xs font-semibold rounded-full border border-[#E8E0D5]"
                >
                  <span>Размер: {s}</span>
                  <button
                    onClick={() => toggleSizeFilter(s)}
                    className="p-0.5 hover:text-[#E2A69B]"
                    aria-label={`Удалить размер ${s}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {filters.colors.map((hex) => (
                <span
                  key={hex}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6F0] text-[#4A3A0B] text-xs font-semibold rounded-full border border-[#E8E0D5]"
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                  <span>{availableColors.find((ac) => ac.hex === hex)?.name ?? hex}</span>
                  <button
                    onClick={() => toggleColorFilter(hex)}
                    className="p-0.5 hover:text-[#E2A69B]"
                    aria-label="Удалить фильтр цвета"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {filters.onlyDiscount && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8EBE8] text-[#4A3A0B] text-xs font-semibold rounded-full border border-[#E2A69B]/40">
                  <span>Только скидки</span>
                  <button
                    onClick={() => setFilters({ ...filters, onlyDiscount: false })}
                    className="p-0.5 hover:text-[#E2A69B]"
                    aria-label="Удалить фильтр скидок"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#E2A69B] hover:text-[#C88B80] font-bold ml-1 py-1 cursor-pointer transition-colors"
              >
                Сбросить всё
              </button>
            </div>
          )}

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E8E0D5] space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#FAF6F0] text-[#E2A69B] flex items-center justify-center mx-auto border border-[#E8E0D5]">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#4A3A0B]">Ничего не найдено</h3>
              <p className="text-xs sm:text-sm text-[#7A695D] max-w-sm mx-auto">
                Попробуйте изменить параметры или сбросить фильтры, чтобы увидеть модели
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-[#4A3A0B] text-white text-xs font-bold rounded-xl hover:bg-[#2C2008] transition-colors cursor-pointer shadow-sm"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-3 sm:gap-6 ${
                mobileGridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'
              } sm:grid-cols-2 lg:grid-cols-3`}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenQuickView={onOpenQuickView}
                  onAddToCart={(prod, col, sz) => onAddToCart(prod, col, sz)}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Фильтры каталога"
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-[#2C2008]/60 backdrop-blur-sm animate-fade-in"
          />

          {/* Sheet Container */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col border-t border-[#E8E0D5] animate-modal-in z-10">
            {/* Sheet Handle & Header */}
            <div className="p-4 pb-3 border-b border-[#E8E0D5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E2A69B]" />
                <h3 className="text-sm font-bold text-[#4A3A0B] uppercase tracking-wider">
                  Фильтры каталога
                </h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#7A695D] hover:text-[#4A3A0B] rounded-full hover:bg-[#FAF6F0]"
                aria-label="Закрыть фильтры"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4A3A0B] uppercase tracking-wider">
                  Категория
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'all', label: 'Все модели' },
                    { id: 'girls', label: 'Девочкам' },
                    { id: 'boys', label: 'Мальчикам' },
                    { id: 'babies', label: 'Малышам' },
                    { id: 'accessories', label: 'Аксессуары' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilters({ ...filters, category: cat.id as ProductCategory | 'all' })}
                      className={`p-2.5 rounded-xl text-left font-semibold border transition-all ${
                        filters.category === cat.id
                          ? 'bg-[#F8EBE8] border-[#E2A69B] text-[#4A3A0B] font-bold shadow-sm'
                          : 'bg-[#FAF6F0] border-[#E8E0D5] text-[#7A695D]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className="space-y-2 pt-4 border-t border-[#E8E0D5]">
                <label className="text-xs font-bold text-[#4A3A0B] uppercase tracking-wider">
                  Возраст ребенка
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'all', label: 'Все возрасты' },
                    { id: '0-2', label: '0–2 года' },
                    { id: '2-5', label: '2–5 лет' },
                    { id: '6-10', label: '6–10 лет' },
                  ].map((age) => (
                    <button
                      key={age.id}
                      onClick={() => setFilters({ ...filters, ageGroup: age.id as FilterState['ageGroup'] })}
                      className={`p-2.5 rounded-xl text-left font-semibold border transition-all ${
                        filters.ageGroup === age.id
                          ? 'bg-[#F8EBE8] border-[#E2A69B] text-[#4A3A0B] font-bold shadow-sm'
                          : 'bg-[#FAF6F0] border-[#E8E0D5] text-[#7A695D]'
                      }`}
                    >
                      {age.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2 pt-4 border-t border-[#E8E0D5]">
                <label className="text-xs font-bold text-[#4A3A0B] uppercase tracking-wider">
                  Размер (Рост, см)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSizeFilter(s)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                        filters.sizes.includes(s)
                          ? 'bg-[#4A3A0B] text-white border-[#4A3A0B] shadow-sm'
                          : 'bg-[#FAF6F0] text-[#7A695D] border-[#E8E0D5]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2 pt-4 border-t border-[#E8E0D5]">
                <label className="text-xs font-bold text-[#4A3A0B] uppercase tracking-wider">
                  Цвет
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => toggleColorFilter(c.hex)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        filters.colors.includes(c.hex)
                          ? 'border-[#4A3A0B] bg-[#FAF6F0] font-bold ring-1 ring-[#4A3A0B]'
                          : 'border-[#E8E0D5] bg-white text-[#7A695D]'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount checkbox */}
              <div className="pt-4 border-t border-[#E8E0D5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A3A0B]">
                  Только со скидкой
                </span>
                <input
                  type="checkbox"
                  checked={filters.onlyDiscount}
                  onChange={(e) => setFilters({ ...filters, onlyDiscount: e.target.checked })}
                  className="accent-[#E2A69B] w-5 h-5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 border-t border-[#E8E0D5] bg-[#FAF6F0] flex items-center gap-3 pb-safe">
              <button
                onClick={handleResetFilters}
                className="py-3 px-4 border border-[#E8E0D5] bg-white text-[#7A695D] text-xs font-bold rounded-2xl hover:bg-[#F8EBE8] hover:text-[#4A3A0B] transition-colors min-h-[46px]"
              >
                Сбросить
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 px-4 bg-[#4A3A0B] text-white text-xs font-extrabold rounded-2xl hover:bg-[#2C2008] transition-colors shadow-md min-h-[46px] flex items-center justify-center gap-1.5"
              >
                <span>Показать товары</span>
                <span className="bg-[#E2A69B] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {filteredProducts.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

