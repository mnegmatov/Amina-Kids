import React, { useState } from 'react';
import { Product, ProductColor } from '../types';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenQuickView,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onSelectProduct,
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize] = useState<string>(product.sizes[0]);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedColor, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      onOpenQuickView(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col group relative bg-white rounded-2xl sm:rounded-3xl border border-[#E8E0D5]/80 p-2.5 sm:p-3 shadow-[0_2px_10px_rgba(74,58,11,0.03)] hover:shadow-[0_14px_34px_rgba(74,58,11,0.08)] transition-all duration-300 cursor-pointer hover:border-[#E2A69B]/60 select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick();
      }}
      aria-label={`Товар: ${product.name}, цена: ${formatPrice(product.price)} сомони`}
    >
      {/* Image Container with 4:5 aspect ratio */}
      <div className="relative aspect-[4/5] w-full bg-[#FAF6F0] rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 sm:mb-3">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2008]/20 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges Top Left (Pill format) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isHit && (
            <span className="bg-[#4A3A0B] text-[#F7F1E5] text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold shadow-xs">
              Хит
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#E2A69B] text-white text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold shadow-xs">
              New
            </span>
          )}
          {product.discount && (
            <span className="bg-rose-50 text-rose-700 border border-rose-200/80 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-xs">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button Top Right */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full backdrop-blur-md transition-all z-20 cursor-pointer ${
            isWishlisted
              ? 'bg-[#E2A69B] text-white shadow-md'
              : 'bg-white/90 text-[#4A3A0B]/70 hover:text-[#E2A69B] hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
          }`}
          aria-label={isWishlisted ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <motion.span
            key={isWishlisted ? 'wishlisted' : 'unwishlisted'}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="flex items-center justify-center"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.span>
        </motion.button>

        {/* Desktop Slide-Up Add To Cart Button */}
        <button
          type="button"
          onClick={handleAdd}
          className={`hidden sm:flex absolute bottom-3 left-1/2 -translate-x-1/2 w-[88%] py-2.5 rounded-full items-center justify-center gap-1.5 text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md z-20 cursor-pointer ${
            added
              ? 'bg-emerald-600 text-white translate-y-0 opacity-100'
              : 'bg-white/95 backdrop-blur-xs text-[#4A3A0B] hover:bg-[#E2A69B] hover:text-white translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 active:scale-[0.97]'
          }`}
          aria-label={`Добавить ${product.name} в корзину`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Добавлено</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>В корзину</span>
            </>
          )}
        </button>
      </div>

      {/* Info Container */}
      <div className="flex flex-col flex-1 justify-between px-0.5">
        <div>
          {/* Subcategory & Rating */}
          <div className="flex items-center justify-between text-[11px] text-[#7A695D] mb-1">
            <span className="truncate pr-1 uppercase tracking-wider font-semibold text-[10px] text-[#7A695D]">{product.subcategory}</span>
            <div className="inline-flex items-center gap-1 text-[10px] text-[#4A3A0B] font-bold bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#E8E0D5]/60 shrink-0">
              <Star className="w-3 h-3 fill-[#E2A69B] text-[#E2A69B]" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-xs sm:text-sm font-bold text-[#4A3A0B] group-hover:text-[#E2A69B] transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h4>

          {/* Color Swatches */}
          <div
            className="flex items-center gap-1 my-1 py-0.5 overflow-x-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                title={color.name}
                className="min-w-[28px] min-h-[28px] p-1 flex items-center justify-center cursor-pointer rounded-full"
                aria-label={`Выбрать цвет: ${color.name}`}
              >
                <span
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all block ${
                    selectedColor.name === color.name
                      ? 'ring-2 ring-offset-1 ring-[#E2A69B] border-transparent scale-110'
                      : 'border-[#E8E0D5] hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Price Row & Mobile Add Action */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E0D5]/60 mt-1">
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-sm sm:text-base font-extrabold text-[#4A3A0B] leading-none whitespace-nowrap">
              {formatPrice(product.price)} <span className="text-xs font-bold font-sans">с.</span>
            </span>
            {product.oldPrice && (
              <span className="text-[10px] sm:text-xs text-[#7A695D]/60 line-through font-normal mt-0.5 whitespace-nowrap">
                {formatPrice(product.oldPrice)} с.
              </span>
            )}
          </div>

          {/* Mobile Quick Add Button */}
          <button
            type="button"
            onClick={handleAdd}
            className={`sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all active:scale-90 cursor-pointer shrink-0 ${
              added
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#4A3A0B] border border-[#E8E0D5] hover:bg-[#E2A69B] hover:text-white hover:border-[#E2A69B]'
            }`}
            aria-label={`Добавить ${product.name} в корзину`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};