import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { CheckCircle2, GripVertical, Loader2, Package, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import type { ProductCategoryFranchiseItem } from '@/apis/endpoints/product-category-franchise.api';
import type { EnrichedProductFranchiseItem } from '../hooks/useProductFranchiseList.hook.ts';
import { getCategoryLabel } from '../utils/productFranchise.utils.ts';

export interface ProductFranchiseTableRowProps {
    item: EnrichedProductFranchiseItem;
    selectedProductFranchiseId: string | null;
    selectionDisabled: boolean;
    dragEnabled: boolean;
    selectedCategoryId?: string | null;
    selectedCategoryName?: string | null;
    showDeleteActions: boolean;
    showDeletedInCategory: boolean;
    assignmentLookup?: Map<string, ProductCategoryFranchiseItem> | null;
    categoryAssignmentLookup?: Map<string, ProductCategoryFranchiseItem> | null;
    highlightedProductFranchiseId?: string | null;
    successAnimationKey?: number;
    gridTemplateColumns: string;
    rowHeight: number;
    onSelect: (productFranchiseId: string) => void;
    onRemoveCategory?: (itemId: string) => void;
    onDelete?: (itemId: string) => void;
    onRestore?: (itemId: string) => void;
}

const cellClassName = 'flex items-center px-4 py-4';

export const ProductFranchiseTableRow: React.FC<ProductFranchiseTableRowProps> = ({
    item,
    selectedProductFranchiseId,
    selectionDisabled,
    dragEnabled,
    selectedCategoryId,
    selectedCategoryName,
    showDeleteActions,
    showDeletedInCategory,
    assignmentLookup,
    categoryAssignmentLookup,
    highlightedProductFranchiseId,
    successAnimationKey = 0,
    gridTemplateColumns,
    rowHeight,
    onSelect,
    onRemoveCategory,
    onDelete,
    onRestore,
}) => {
    const rowId = item.product_franchise_id || item.id;
    const isSelected = selectedProductFranchiseId === rowId;
    const isRecentlyAssigned = highlightedProductFranchiseId === rowId;
    const isAlreadyAssigned =
        !showDeleteActions &&
        Boolean(selectedCategoryId) &&
        item.categories.some((category) => category.category_id === selectedCategoryId);
    const visibleCategories = item.categories.slice(0, 2);
    const hiddenCategories = item.categories.slice(2);
    const assignmentItem = assignmentLookup?.get(rowId);
    const productName = item.product_name || item.product?.name || item.product_id;
    const productSku = item.product_sku || item.product?.SKU || 'N/A';
    const imageUrl = item.image_url || item.product?.image_url;
    const description =
        item.description || item.product?.description || item.product?.content || 'Không có mô tả';

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: `product-franchise-${rowId}`,
        disabled: !dragEnabled,
        data: {
            type: 'product-franchise',
            product: item,
        },
    });

    return (
        <motion.div
            ref={setNodeRef}
            role="row"
            style={{
                height: rowHeight,
                transform: CSS.Translate.toString(transform),
                visibility: isDragging ? 'hidden' : 'visible',
                gridTemplateColumns,
            }}
            className={`relative grid border-b border-gray-100 transition-colors ${isSelected
                ? 'bg-amber-50/80'
                : 'hover:bg-gray-50/80'
                } ${isDragging ? 'pointer-events-none' : ''}`}
        >
            {isRecentlyAssigned && (
                <motion.div
                    key={`${rowId}-${successAnimationKey}`}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 0.95, 0],
                        scaleX: [0.995, 1, 1],
                    }}
                    transition={{ duration: 0.9, ease: 'easeOut', times: [0, 0.25, 1] }}
                    className="pointer-events-none absolute inset-0 bg-emerald-200/70"
                />
            )}

            {isRecentlyAssigned && (
                <motion.div
                    key={`accent-${rowId}-${successAnimationKey}`}
                    initial={{ opacity: 0, scaleY: 0.5 }}
                    animate={{
                        opacity: [0, 1, 0],
                        scaleY: [0.5, 1, 1],
                    }}
                    transition={{ duration: 0.9, ease: 'easeOut', times: [0, 0.25, 1] }}
                    className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-r-full bg-emerald-500"
                />
            )}

            <div className={`${cellClassName} min-w-0`}>
                <div className="flex min-w-[260px] items-center gap-3">
                    {dragEnabled && (
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            {...listeners}
                            {...attributes}
                            className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition-colors hover:border-amber-200 hover:text-amber-700 active:cursor-grabbing"
                            title="Kéo product vào category"
                        >
                            <GripVertical size={18} />
                        </motion.button>
                    )}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={productName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <Package size={24} />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                {productName}
                            </p>
                            {isAlreadyAssigned && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                    Assigned
                                </span>
                            )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            <div className={`${cellClassName} text-sm font-medium text-gray-700`}>
                {productSku}
            </div>

            <div className={cellClassName}>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
                    {item.size || 'N/A'}
                </span>
            </div>

            <div className={`${cellClassName} text-sm font-semibold text-amber-700`}>
                {item.price_base.toLocaleString('vi-VN')} VND
            </div>

            <div className={`${cellClassName} min-w-0`}>
                <div className="flex min-w-[220px] flex-wrap gap-2">
                    {item.categories.length > 0 ? (
                        <>
                            {visibleCategories.map((category) => (
                                <span
                                    key={`${rowId}-${category.category_id}`}
                                    className="group inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                                >
                                    <span>{getCategoryLabel(category)}</span>
                                    {!showDeleteActions &&
                                        onRemoveCategory &&
                                        categoryAssignmentLookup?.get(`${rowId}:${category.category_id}`) && (
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    const assignment = categoryAssignmentLookup.get(`${rowId}:${category.category_id}`);
                                                    if (assignment) {
                                                        onRemoveCategory(assignment.id);
                                                    }
                                                }}
                                                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-amber-700 opacity-0 transition hover:bg-amber-200 group-hover:opacity-100"
                                                title={`Gỡ ${getCategoryLabel(category)}`}
                                            >
                                                <X size={10} />
                                            </button>
                                        )}
                                </span>
                            ))}
                            {hiddenCategories.length > 0 && (
                                <span
                                    className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
                                    title={hiddenCategories.map((category) => getCategoryLabel(category)).join(', ')}
                                >
                                    ...
                                </span>
                            )}
                        </>
                    ) : showDeleteActions && showDeletedInCategory && selectedCategoryName ? (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            {selectedCategoryName} (Removed)
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400">Uncategorized</span>
                    )}
                </div>
            </div>

            <div className={cellClassName}>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.is_active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-200 text-gray-600'
                    }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>

            <div className={`${cellClassName} justify-center`}>
                {showDeleteActions ? (
                    assignmentItem ? (
                        showDeletedInCategory ? (
                            <button
                                type="button"
                                onClick={() => onRestore?.(assignmentItem.id)}
                                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                            >
                                <RefreshCw size={14} />
                                Restore
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onDelete?.(assignmentItem.id)}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                            >
                                <Trash2 size={14} />
                                Remove
                            </button>
                        )
                    ) : (
                        <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400">
                            <Loader2 size={14} className="animate-spin" />
                            Syncing
                        </span>
                    )
                ) : isAlreadyAssigned ? (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 size={14} />
                        Assigned
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={() => onSelect(rowId)}
                        disabled={selectionDisabled}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${isSelected
                            ? 'bg-amber-700 text-white hover:bg-amber-800'
                            : selectionDisabled
                                ? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
                                : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                            }`}
                    >
                        <Plus size={14} />
                        {isSelected ? 'Selected' : 'Select'}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default ProductFranchiseTableRow;
