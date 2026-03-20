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
    <div className="group flex h-full cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-amber-700 hover:shadow-lg">
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url('${product.image_url}')` }}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-1 line-clamp-1 font-bold text-gray-800 transition-colors group-hover:text-amber-800">
          {product.name}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-gray-500">{product.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-amber-700">{currency.format(defaultPrice)}đ</span>
          <button
            onClick={() => onAdd(product)}
            disabled={disabled}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-amber-700 shadow-sm transition-colors hover:bg-amber-700 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default PosProductCard;
