import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#E8E0D5]/70 p-2.5 sm:p-3 shadow-[0_2px_8px_rgba(74,58,11,0.04)] animate-pulse">
      {/* Image Skeleton with 4:5 ratio */}
      <div className="aspect-[4/5] w-full bg-[#F8EBE8]/60 rounded-xl mb-2.5 sm:mb-3" />
      
      {/* Info Skeleton */}
      <div className="px-0.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-16 bg-[#E8E0D5]/80 rounded-full" />
          <div className="h-2.5 w-8 bg-[#E8E0D5]/80 rounded-full" />
        </div>
        <div className="h-3.5 w-4/5 bg-[#E8E0D5]/80 rounded-full" />
        <div className="flex items-center gap-1.5 py-1">
          <div className="w-4 h-4 rounded-full bg-[#E8E0D5]/80" />
          <div className="w-4 h-4 rounded-full bg-[#E8E0D5]/80" />
          <div className="w-4 h-4 rounded-full bg-[#E8E0D5]/80" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E0D5]/60 mt-1">
          <div className="h-4 w-20 bg-[#E8E0D5]/80 rounded-full" />
          <div className="sm:hidden w-8 h-8 rounded-xl bg-[#E8E0D5]/60" />
        </div>
      </div>
    </div>
  );
};

interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </>
  );
};
