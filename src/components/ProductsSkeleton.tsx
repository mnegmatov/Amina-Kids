import React from 'react';

interface ProductsSkeletonProps {
  count?: number;
}

/**
 * Placeholder grid shown while the catalog is being fetched from Supabase.
 * Mirrors ProductCard's proportions (image aspect ratio, radius, spacing)
 * so the page doesn't "jump" once real products arrive.
 */
export const ProductsSkeleton: React.FC<ProductsSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col bg-white rounded-2xl border border-[#E8E0D5]/60 p-3 shadow-sm animate-pulse"
          >
            <div className="aspect-[4/5] w-full bg-[#E2A69B]/10 rounded-2xl mb-3" />
            <div className="px-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-1/3 bg-[#E8E0D5] rounded" />
                <div className="h-2.5 w-8 bg-[#E8E0D5] rounded" />
              </div>
              <div className="h-3.5 w-4/5 bg-[#E8E0D5] rounded" />
              <div className="flex items-center gap-1.5 py-1">
                <div className="w-3.5 h-3.5 rounded-full bg-[#E8E0D5]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#E8E0D5]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#E8E0D5]" />
              </div>
              <div className="h-4 w-1/2 bg-[#E8E0D5] rounded mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
