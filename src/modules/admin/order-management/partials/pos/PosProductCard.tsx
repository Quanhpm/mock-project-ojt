import { memo } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/utils/cn";
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
  const isSoldOut =
    product.sizes.length > 0 && product.sizes.every((size) => size.is_available === false);
  const isInteractionDisabled = disabled || isSoldOut;

  return (
    <div
      aria-disabled={isInteractionDisabled}
      onClick={() => {
        if (!isInteractionDisabled) {
          onAdd(product);
        }
      }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-black/5 transition-all",
        isInteractionDisabled
          ? "cursor-not-allowed opacity-50 grayscale"
          : "cursor-pointer hover:shadow-xl hover:ring-amber-500/50",
      )}
    >
      <div className="relative mb-4 aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[16px] bg-gray-50">
        {isSoldOut ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-gray-900/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
            Hết hàng
          </span>
        ) : null}

        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500",
              isInteractionDisabled ? "" : "group-hover:scale-110",
            )}
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
              if (!isInteractionDisabled) {
                onAdd(product);
              }
            }}
            disabled={isInteractionDisabled}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700 transition hover:bg-amber-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default PosProductCard;
