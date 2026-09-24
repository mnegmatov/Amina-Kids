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
      <section className="relative bg-[#FBF9F5] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8E0D5]/80 mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-6 shadow-[0_4px_24px_rgba(74,58,11,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-18 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 z-10">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-full border border-[#E8E0D5] text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#4A3A0B] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E2A69B]" />
              <span>Коллекция Весна–Лето 2026</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-[#4A3A0B] leading-[1.2] font-bold tracking-tight">
              Забота и нежность в каждой детали одежды вашего малыша
            </h1>

            <p className="text-xs sm:text-base text-[#7A695D] max-w-lg leading-relaxed">
              100% натуральный двухслойный хлопковый муслин. Не раздражает нежную кожу, дышит в жару и согревает в прохладу с первых дней жизни.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={() => onNavigateToCatalog()}
                className="min-h-[48px] px-6 sm:px-8 py-3.5 bg-[#4A3A0B] hover:bg-[#33261D] active:scale-[0.98] text-[#F7F1E5] text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <span>Смотреть каталог</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToCatalog('girls')}
                className="min-h-[48px] px-5 sm:px-6 py-3.5 bg-white text-[#4A3A0B] hover:bg-[#FAF6F0] active:scale-[0.98] text-xs font-bold uppercase tracking-wider rounded-full border border-[#E8E0D5] shadow-xs transition-all cursor-pointer"
              >
                Новинки для девочек
              </button>
            </div>

            {/* Quick Category Shortcuts on Mobile */}
            <div className="pt-2">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#7A695D] mb-2">
                Быстрый переход к разделам:
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { cat: 'girls', label: 'Девочкам' },
                  { cat: 'boys', label: 'Мальчикам' },
                  { cat: 'babies', label: 'Малышам 0-24 мес' },
                  { cat: 'accessories', label: 'Аксессуары' },
                ].map((item) => (
                  <button
                    key={item.cat}
                    onClick={() => onNavigateToCatalog(item.cat as ProductCategory)}
                    className="px-3 py-1.5 bg-white/90 hover:bg-[#F8EBE8] text-[#4A3A0B] text-xs font-semibold rounded-full border border-[#E8E0D5] shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Benefits Badges */}
            <div className="pt-4 sm:pt-5 border-t border-[#E8E0D5]/70 grid grid-cols-3 gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-[#4A3A0B] font-semibold">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E2A69B] shrink-0" />
                <span>100% Эко-муслин</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Truck className="w-4 h-4 text-[#E2A69B] shrink-0" />
                <span>По Таджикистану</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <RefreshCw className="w-4 h-4 text-[#E2A69B] shrink-0" />
                <span>Примерка до оплаты</span>
              </div>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 sm:border-4 border-white bg-[#FAF6F0]">
              <img
                src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=1000"
                alt="AMINA KIDS детская одежда из муслина"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            {/* Floating Card Overlay */}
            <div className="absolute -bottom-3 sm:-bottom-5 -left-1 sm:-left-5 flex items-center gap-3 p-3 sm:p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-[#E8E0D5] max-w-xs animate-fade-in">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#4A3A0B]">Более 5 000 мам доверяют нам</h4>
                <div className="flex items-center gap-1 text-[10px] text-[#7A695D]">
                  <div className="flex text-[#E2A69B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span>4.9 из 5 звезд</span>
                </div>
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
              className="group relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-sm border border-[#E8E0D5]/80 hover:shadow-xl transition-all duration-300 select-none bg-[#FAF6F0]"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-3.5 sm:p-5 text-white">
                <span className="inline-flex px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] text-white font-semibold uppercase tracking-wider w-fit mb-1">
                  Муслин 100%
                </span>
                <h3 className="text-base sm:text-xl font-bold font-serif mb-0.5 group-hover:text-[#F8EBE8] transition-colors leading-tight">
                  {cat.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/80 line-clamp-1 leading-tight hidden xs:block">{cat.subtitle}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#E2A69B] group-hover:underline">
                  Смотреть коллекцию <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
        <div className="bg-[#FAF6F0] rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-[#E8E0D5]/80 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-1.5">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E2A69B]">Наши стандарты</span>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#4A3A0B]">Почему выбирают AMINA KIDS</h2>
            <p className="text-xs text-[#7A695D]">Мы шьем одежду так, как шили бы для собственных детей</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_2px_10px_rgba(74,58,11,0.03)] border border-[#E8E0D5]/80 space-y-3 hover:shadow-[0_8px_24px_rgba(74,58,11,0.06)] transition-all">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] border border-[#E2A69B]/30">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#4A3A0B]">Органический хлопок</h3>
              <p className="text-xs text-[#7A695D] leading-relaxed">
                Только гипоаллергенный хлопковый муслин с международными эко-сертификатами.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_2px_10px_rgba(74,58,11,0.03)] border border-[#E8E0D5]/80 space-y-3 hover:shadow-[0_8px_24px_rgba(74,58,11,0.06)] transition-all">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] border border-[#E2A69B]/30">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </div>
              <h3 className="font-bold text-sm text-[#4A3A0B]">Безопасные швы</h3>
              <p className="text-xs text-[#7A695D] leading-relaxed">
                Плоские наружные швы и отсутствие колючих ярлыков защищают чувствительную кожу.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_2px_10px_rgba(74,58,11,0.03)] border border-[#E8E0D5]/80 space-y-3 hover:shadow-[0_8px_24px_rgba(74,58,11,0.06)] transition-all">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] border border-[#E2A69B]/30">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#4A3A0B]">Быстрая доставка</h3>
              <p className="text-xs text-[#7A695D] leading-relaxed">
                Курьерская доставка до двери по Душанбе и отправка во все регионы Таджикистана.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_2px_10px_rgba(74,58,11,0.03)] border border-[#E8E0D5]/80 space-y-3 hover:shadow-[0_8px_24px_rgba(74,58,11,0.06)] transition-all">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] border border-[#E2A69B]/30">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#4A3A0B]">Примерка до оплаты</h3>
              <p className="text-xs text-[#7A695D] leading-relaxed">
                Заказывайте смежные размеры и оплачивайте курьеру только то, что идеально подошло.
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
          <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#E8E0D5]/80 shadow-[0_2px_10px_rgba(74,58,11,0.03)] space-y-3 hover:shadow-[0_8px_24px_rgba(74,58,11,0.06)] transition-all">
            <div className="flex items-center gap-1 text-[#E2A69B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#4A3A0B] leading-relaxed italic">
              «Заказывала муслиновый комплект на лето. Качество выше всех похвал! После 10 стирок ткань осталась такой же мягкой и яркой.»
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-[#E8E0D5]/60 text-xs">
              <span className="font-bold text-[#4A3A0B]">Ольга С.</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> Проверенный покупатель
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#E8E0D5]/80 shadow-[0_2px_10px_rgba(74,58,11,0.03)] space-y-3 hover:shadow-[0_8px_24px_rgba(74,58,11,0.06)] transition-all">
            <div className="flex items-center gap-1 text-[#E2A69B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#4A3A0B] leading-relaxed italic">
              «Вязаный комбинезон с ушками — это просто любовь! Брали на выписку, теперь носим каждый день на прогулки.»
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-[#E8E0D5]/60 text-xs">
              <span className="font-bold text-[#4A3A0B]">Виктория В.</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> Проверенный покупатель
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#E8E0D5]/80 shadow-[0_2px_10px_rgba(74,58,11,0.03)] space-y-3 hover:shadow-[0_8px_24px_rgba(74,58,11,0.06)] transition-all">
            <div className="flex items-center gap-1 text-[#E2A69B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#4A3A0B] leading-relaxed italic">
              «Очень быстрая доставка! Все пришло в красивой подарочной упаковке. Очень приятно дарить подругам.»
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-[#E8E0D5]/60 text-xs">
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
