import { memo } from "react";
import { Plus } from "lucide-react";
import type { PosProduct } from "../../models/menu.models";

const currency = new Intl.NumberFormat("vi-VN");

interface PosProductCardProps {
  product: PosProduct;
  disabled?: boolean;
  onAdd: (product: PosProduct) => void;
}

export const PosProductCard = memo(({
  product,
  disabled = false,
  onAdd,
}: PosProductCardProps) => {
  const defaultPrice = product.sizes.find((size) => size.is_available)?.price ?? product.sizes[0]?.price ?? 0;

  return (
    <div
      onClick={() => {
        if (!disabled) onAdd(product);
      }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-xl hover:ring-amber-500/50"
    >
      <div className="relative mb-4 aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[16px] bg-gray-50">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1">
        <h3 className="line-clamp-2 text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-amber-800">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-1 text-sm text-gray-400">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <span className="text-lg font-black tracking-tight text-amber-700">
            {currency.format(defaultPrice)}<span className="text-sm">đ</span>
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            disabled={disabled}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700 transition hover:bg-amber-600 hover:text-white disabled:opacity-50"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default PosProductCard;
