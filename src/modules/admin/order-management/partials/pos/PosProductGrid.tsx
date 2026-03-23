import { memo } from "react";
import type { PosProduct } from "../../models/menu.models";
import PosProductCard from "./PosProductCard";

interface PosProductGridProps {
  products: PosProduct[];
  isLoading: boolean;
  disabled?: boolean;
  onAdd: (product: PosProduct) => void;
}

export const PosProductGrid = memo(({
  products,
  isLoading,
  disabled = false,
  onAdd,
}: PosProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-[24px] bg-white ring-1 ring-black/5"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-[24px] bg-white px-6 text-center shadow-sm ring-1 ring-black/5">
        <p className="font-bold text-gray-900">Không tìm thấy món nào</p>
        <p className="mt-1 text-sm text-gray-400">Thử tìm kiếm với từ khóa khác bạn nhé</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <PosProductCard
          key={`${product.product_id}-${product.SKU}`}
          product={product}
          disabled={disabled}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
});

export default PosProductGrid;
