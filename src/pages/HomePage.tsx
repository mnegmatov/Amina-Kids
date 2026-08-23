import React, { useState } from 'react';
import { Product, ProductCategory, ProductColor } from '../types';
import { CATEGORIES_INFO } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Truck, RefreshCw, Star, CheckCircle } from 'lucide-react';

interface HomePageProps {
  products: Product[];
  onNavigateToCatalog: (category?: ProductCategory) => void;
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onNavigateToCatalog,
  onOpenQuickView,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  onSelectProduct,
}) => {
  const [selectedAge, setSelectedAge] = useState<'all' | '0-2' | '2-5' | '6-10'>('all');

  const featuredProducts = products.filter((p) => p.isHit || p.isNew).slice(0, 8);
  const filteredWizardProducts = selectedAge === 'all'
    ? featuredProducts
    : products.filter((p) => p.ageGroup === selectedAge).slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative bg-[#F7F1E5] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8E0D5] mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 bg-[#E2A69B]/15 backdrop-blur-md rounded-full border border-[#E2A69B]/30 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#E2A69B]">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E2A69B]" />
              <span>Весна–Лето 2026 Коллекция</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-[#4A3A0B] leading-tight font-bold">
              Забота и нежность в каждой детали одежды вашего малыша
            </h1>

            <p className="text-xs sm:text-base text-[#7A695D] max-w-lg leading-relaxed">
              Гипоаллергенный хлопковый муслин, мягкая мериносовая шерсть и продуманный крой для свободных активных игр и сладкого сна.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => onNavigateToCatalog()}
                className="min-h-[46px] px-6 sm:px-7 py-3 sm:py-3.5 bg-[#E2A69B] hover:bg-[#C88B80] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Смотреть каталог</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToCatalog('girls')}
                className="min-h-[46px] px-5 sm:px-6 py-3 sm:py-3.5 bg-white text-[#4A3A0B] hover:bg-[#FAF6F0] active:scale-[0.98] text-xs font-bold uppercase tracking-wider rounded-full border border-[#E8E0D5] shadow-sm transition-all cursor-pointer"
              >
                Новинки для девочек
              </button>
            </div>

            {/* Quick Benefits Badges */}
            <div className="pt-5 sm:pt-6 border-t border-[#E8E0D5]/70 grid grid-cols-3 gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-[#4A3A0B] font-semibold">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E2A69B] shrink-0" />
                <span>100% Эко-хлопок</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Truck className="w-4 h-4 text-[#E2A69B] shrink-0" />
                <span>Быстрая доставка</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <RefreshCw className="w-4 h-4 text-[#E2A69B] shrink-0" />
                <span>Легкий возврат</span>
              </div>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 sm:border-4 border-white bg-[#F8EBE8]/40">
              <img
                src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=1000"
                alt="AMINA KIDS детская одежда"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            {/* Floating Card Overlay */}
            <div className="absolute -bottom-4 sm:-bottom-6 -left-2 sm:-left-6 hidden sm:flex items-center gap-3 p-3.5 sm:p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#E8E0D5] max-w-xs animate-fade-in">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] shrink-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#4A3A0B]">Более 5 000 довольных мам</h4>
                <p className="text-[10px] text-[#7A695D]">4.9 из 5 звезд по отзывам</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2 sm:gap-4">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E2A69B]">Категории</span>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#4A3A0B] mt-0.5">
              Популярные разделы
            </h2>
          </div>
          <button
            onClick={() => onNavigateToCatalog()}
            className="text-xs font-bold text-[#E2A69B] hover:text-[#C88B80] flex items-center gap-1 group self-start sm:self-auto cursor-pointer p-1"
          >
            <span>Весь каталог</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {CATEGORIES_INFO.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigateToCatalog(cat.id as ProductCategory)}
              className="group relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-sm border border-[#E8E0D5] hover:shadow-lg transition-all duration-300 select-none"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3.5 sm:p-6 text-white">
                <h3 className="text-base sm:text-xl font-bold font-serif mb-0.5 group-hover:text-[#E2A69B] transition-colors leading-tight">
                  {cat.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/80 line-clamp-2 leading-tight hidden xs:block">{cat.subtitle}</p>
                <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#E2A69B] group-hover:underline">
                  Смотреть <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Age Wizard Selector */}
      <section className="bg-[#FAF6F0] py-8 sm:py-12 border-y border-[#E8E0D5]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 space-y-1.5">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E2A69B]">Быстрый подбор</span>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#4A3A0B]">
              Выберите возраст ребенка
            </h2>
            <p className="text-xs text-[#7A695D]">
              Мы отфильтруем лучшие модельки с удобными застежками и безопасными швами
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center mb-6 sm:mb-8 scrollbar-none">
            {[
              { id: 'all', label: 'Все возрасты' },
              { id: '0-2', label: 'Малыши (0–2 года)' },
              { id: '2-5', label: 'Дети (2–5 лет)' },
              { id: '6-10', label: 'Дети (6–10 лет)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedAge(tab.id as any)}
                className={`min-h-[44px] px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
                  selectedAge === tab.id
                    ? 'bg-[#4A3A0B] text-white shadow-md'
                    : 'bg-white text-[#4A3A0B] hover:bg-[#F7F1E5] border border-[#E8E0D5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredWizardProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenQuickView={onOpenQuickView}
                onAddToCart={(prod, col, sz) => onAddToCart(prod, col, sz)}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlistIds.includes(p.id)}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2 sm:gap-4">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E2A69B]">Хиты и новинки</span>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#4A3A0B] mt-0.5">
              Популярные модели
            </h2>
          </div>
          <button
            onClick={() => onNavigateToCatalog()}
            className="text-xs font-bold text-[#E2A69B] hover:text-[#C88B80] flex items-center gap-1 group self-start sm:self-auto cursor-pointer p-1"
          >
            <span>Смотреть все</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
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
      </section>

      {/* Why Choose AMINA KIDS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-[#F7F1E5] rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-[#E8E0D5]">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-1.5">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E2A69B]">Наши стандарты</span>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#4A3A0B]">Почему выбирают AMINA KIDS</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#E8E0D5] space-y-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B]">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#4A3A0B]">Органический хлопок</h3>
              <p className="text-xs text-[#7A695D] leading-relaxed">
                Только гипоаллергенные ткани с международными сертификатами качества.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#E8E0D5] space-y-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B]">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </div>
              <h3 className="font-bold text-sm text-[#4A3A0B]">Безопасные швы</h3>
              <p className="text-xs text-[#7A695D] leading-relaxed">
                Плоские швы и отсутствующие внутренние ярлыки не раздражают нежную кожу.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#E8E0D5] space-y-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B]">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#4A3A0B]">Быстрая доставка</h3>
              <p className="text-xs text-[#7A695D] leading-relaxed">
                Отправляем заказы курьером и по всему Таджикистану в день оформления.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#E8E0D5] space-y-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B]">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#4A3A0B]">Примерка перед покупкой</h3>
              <p className="text-xs text-[#7A695D] leading-relaxed">
                Заказывайте несколько размеров и оплачивайте только то, что подошло.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-1.5">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E2A69B]">Отзывы родителей</span>
          <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#4A3A0B]">Что говорят о нас мамы</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#E8E0D5] shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-[#E2A69B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#4A3A0B] leading-relaxed italic">
              «Заказывала муслиновый комплект на лето. Качество выше всех похвал! После 10 стирок ткань осталась такой же мягкой и яркой.»
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-[#E8E0D5] text-xs">
              <span className="font-bold text-[#4A3A0B]">Ольга С.</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> Проверенный покупатель
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#E8E0D5] shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-[#E2A69B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#4A3A0B] leading-relaxed italic">
              «Вязаный комбинезон с ушками — это просто любовь! Брали на выписку, теперь носим каждый день на прогулки.»
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-[#E8E0D5] text-xs">
              <span className="font-bold text-[#4A3A0B]">Виктория В.</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> Проверенный покупатель
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#E8E0D5] shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-[#E2A69B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#4A3A0B] leading-relaxed italic">
              «Очень быстрая доставка! Все пришло в красивой подарочной упаковке. Очень приятно дарить подругам.»
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-[#E8E0D5] text-xs">
              <span className="font-bold text-[#4A3A0B]">Наталья М.</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> Проверенный покупатель
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
