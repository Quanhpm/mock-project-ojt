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
            className="h-72 animate-pulse rounded-xl border border-gray-200 bg-white"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-gray-400">
        Không có sản phẩm phù hợp
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
