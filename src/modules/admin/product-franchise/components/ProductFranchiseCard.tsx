import React from 'react';
import { Plus } from 'lucide-react';
import type { EnrichedProductFranchiseItem } from '../hooks/useProductFranchiseList.hook.ts';

interface ProductFranchiseCardProps {
    item: EnrichedProductFranchiseItem;
    isSelected: boolean;
    isDimmed: boolean;
    disabled: boolean;
    onSelect: (id: string) => void;
}

export const ProductFranchiseCard: React.FC<ProductFranchiseCardProps> = ({
    item,
    isSelected,
    isDimmed,
    disabled,
    onSelect,
}) => {
    const productName = item.product?.name ?? item.product_id;
    const productDescription = item.product?.description ?? `Size: ${item.size || 'N/A'}`;
    const imageUrl = item.product?.image_url;

    return (
        <div
            className={`group bg-white rounded-xl p-3 shadow-sm border flex flex-col h-full transition-all
                ${disabled ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                ${isSelected ? 'border-amber-700 shadow-lg ring-2 ring-amber-700/30' : 'border-gray-200'}
                ${isDimmed ? 'opacity-40' : ''}
                ${!disabled && !isDimmed && !isSelected ? 'hover:shadow-lg hover:border-amber-700' : ''}
            `}
        >
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-gray-100">
                {imageUrl ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                        style={{ backgroundImage: `url('${imageUrl}')` }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                            </div>
                        </div>
                    </div>
                )}
                {!item.is_active && (
                    <div className="absolute top-2 right-2 bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        INACTIVE
                    </div>
                )}
                {isSelected && (
                    <div className="absolute top-2 left-2 bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        SELECTED
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1">
                <h3 className={`font-bold mb-1 line-clamp-1 transition-colors ${isSelected ? 'text-amber-800' : 'text-gray-800 group-hover:text-amber-800'}`}>
                    {productName}
                </h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {productDescription}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-700">
                        {item.price_base.toLocaleString('vi-VN')}đ
                    </span>
                    <button
                        onClick={() => onSelect(item.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm
                            ${isSelected
                                ? 'bg-amber-700 text-white'
                                : 'bg-gray-100 hover:bg-amber-700 text-amber-700 hover:text-white'
                            }`}
                        title={isSelected ? 'Selected' : 'Select for assignment'}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFranchiseCard;
