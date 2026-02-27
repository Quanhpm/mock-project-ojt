import React from 'react';
import { Plus } from 'lucide-react';
import type { MenuItem } from '../types/order.types.ts';

interface ProductCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onAddToCart }) => {
  return (
    <div className="group bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-lg hover:border-amber-700 transition-all cursor-pointer flex flex-col h-full">
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-gray-100">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
          style={{ backgroundImage: `url('${item.image}')` }}
        />
        {item.isLowStock && (
          <div className="absolute top-2 right-2 bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            LOW STOCK
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-amber-800 transition-colors">
          {item.name}
        </h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-amber-700">{item.price.toLocaleString('vi-VN')}đ</span>
          <button
            onClick={() => onAddToCart(item)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm bg-gray-100 hover:bg-amber-700 text-amber-700 hover:text-white"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
