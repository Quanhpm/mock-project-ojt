import React from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import type { EnrichedProductFranchiseItem } from '../hooks/useProductFranchiseList.hook.ts';

interface ProductFranchiseCardProps {
    item: EnrichedProductFranchiseItem;
    isSelected: boolean;
    isDimmed: boolean;
    disabled: boolean;
    onSelect: (id: string) => void;
    showDelete?: boolean;
    isDeleted?: boolean;
    onDelete?: () => void;
    onRestore?: () => void;
}

export const ProductFranchiseCard: React.FC<ProductFranchiseCardProps> = ({
    item,
    isSelected,
    isDimmed,
    disabled,
    onSelect,
    showDelete,
    isDeleted,
    onDelete,
    onRestore,
}) => {
    const productName = item.product?.name ?? item.product_id;
    const productDescription = item.product?.description ?? '';
    const productSize = item.size ?? 'N/A';
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
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-bold line-clamp-1 transition-colors ${isSelected ? 'text-amber-800' : 'text-gray-800 group-hover:text-amber-800'}`}>
                        {productName}
                    </h3>
                    <span className="shrink-0 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                        {productSize}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[32px]">
                    {productDescription || 'Không có mô tả'}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-700">
                        {item.price_base.toLocaleString('vi-VN')}đ
                    </span>
                    <div className="flex gap-2">
                        {showDelete && isDeleted && onRestore && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRestore(); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm bg-green-100 hover:bg-green-600 text-green-600 hover:text-white"
                                title="Restore Product"
                            >
                                <RefreshCw size={18} />
                            </button>
                        )}
                        {showDelete && !isDeleted && onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm bg-red-100 hover:bg-red-600 text-red-600 hover:text-white"
                                title="Remove from Category"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        {!showDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm
                                    ${isSelected
                                        ? 'bg-amber-700 text-white'
                                        : 'bg-gray-100 hover:bg-amber-700 text-amber-700 hover:text-white'
                                    }`}
                                title={isSelected ? 'Selected' : 'Select for assignment'}
                            >
                                <Plus size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFranchiseCard;
