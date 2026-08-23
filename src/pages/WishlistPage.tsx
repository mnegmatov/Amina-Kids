import React from 'react';
import { Product, ProductColor } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';

interface WishlistPageProps {
  wishlistProducts: Product[];
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size: string) => void;
  onToggleWishlist: (product: Product) => void;
  onNavigateToCatalog: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlistProducts,
  onOpenQuickView,
  onAddToCart,
  onToggleWishlist,
  onNavigateToCatalog,
  onSelectProduct,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-safe">
      <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A3A0B]">Избранные товары</h1>
          <p className="text-xs text-[#7A695D] mt-1">
            Сохраненные модели ({wishlistProducts.length})
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E8E0D5] max-w-md mx-auto space-y-4 shadow-sm animate-fade-in my-8">
          <div className="w-16 h-16 rounded-full bg-[#F8EBE8] text-[#E2A69B] flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-lg font-bold text-[#33261D]">Список избранного пуст</h3>
          <p className="text-xs text-[#7A695D] leading-relaxed max-w-xs mx-auto">
            Нажмите сердечко на карточке любого понравившегося товара, чтобы не потерять его
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToCatalog}
              className="min-h-[46px] px-7 py-3 bg-[#E2A69B] hover:bg-[#C88B80] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Перейти в каталог</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {wishlistProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenQuickView={onOpenQuickView}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={true}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};

