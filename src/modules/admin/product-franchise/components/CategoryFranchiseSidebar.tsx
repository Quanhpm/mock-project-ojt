import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import type { EnrichedCategoryFranchiseItem } from '../hooks/useCategoryFranchiseList.hook.ts';
import { getCategoryLabel } from '../utils/productFranchise.utils.ts';

interface CategoryFranchiseSidebarProps {
    categories: EnrichedCategoryFranchiseItem[];
    categoryItemCounts?: Record<string, number>;
    isLoading: boolean;
    selectedCategory: EnrichedCategoryFranchiseItem | null;
    onSelectCategory: (cat: EnrichedCategoryFranchiseItem | null) => void;
    assignmentEnabled?: boolean;
    activeDraggedProductName?: string | null;
    highlightedCategoryId?: string | null;
    successAnimationKey?: number;
    canAssign: boolean;
    isAssigning: boolean;
    onAssign: () => void;
    onAddCategory?: () => void;
    onClose?: () => void;
}

interface DroppableCategoryItemProps {
    category: EnrichedCategoryFranchiseItem;
    itemCount: number;
    isChecked: boolean;
    isRecentlyAssigned: boolean;
    assignmentEnabled: boolean;
    successAnimationKey: number;
    onToggle: (category: EnrichedCategoryFranchiseItem) => void;
    getCategoryLabel: (category: EnrichedCategoryFranchiseItem) => string;
}

const DroppableCategoryItem: React.FC<DroppableCategoryItemProps> = ({
    category,
    itemCount,
    isChecked,
    isRecentlyAssigned,
    assignmentEnabled,
    successAnimationKey,
    onToggle,
    getCategoryLabel,
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `category-franchise-${category.id}`,
        disabled: !assignmentEnabled,
        data: {
            type: 'category-franchise',
            category,
        },
    });

    const name = getCategoryLabel(category);
    const baseBackgroundColor = isChecked ? 'rgba(255, 251, 235, 1)' : 'rgba(255, 255, 255, 0)';
    const baseBorderColor = isChecked ? 'rgba(253, 230, 138, 1)' : 'rgba(255, 255, 255, 0)';

    return (
        <motion.button
            ref={setNodeRef}
            type="button"
            onClick={() => onToggle(category)}
            animate={isRecentlyAssigned
                ? {
                    scale: [1, 1.035, 1],
                    borderColor: [baseBorderColor, 'rgba(16, 185, 129, 0.9)', baseBorderColor],
                    backgroundColor: [baseBackgroundColor, 'rgba(220, 252, 231, 0.95)', baseBackgroundColor],
                    boxShadow: [
                        '0 0 0 rgba(0, 0, 0, 0)',
                        '0 16px 32px rgba(16, 185, 129, 0.22)',
                        '0 0 0 rgba(0, 0, 0, 0)',
                    ],
                }
                : {
                    scale: isOver ? 1.02 : 1,
                    borderColor: isOver ? 'rgba(251, 191, 36, 1)' : baseBorderColor,
                    backgroundColor: isOver ? 'rgba(254, 243, 199, 0.8)' : baseBackgroundColor,
                    boxShadow: isOver ? '0 12px 30px rgba(180, 83, 9, 0.16)' : '0 0 0 rgba(0, 0, 0, 0)',
                }}
            transition={isRecentlyAssigned
                ? { duration: 0.72, ease: 'easeOut', times: [0, 0.4, 1] }
                : { duration: 0.18, ease: 'easeOut' }}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-colors ${isOver
                ? 'border-amber-400 bg-amber-100/80 ring-2 ring-amber-300/70'
                : isChecked
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-transparent hover:bg-gray-50'
                }`}
        >
            <div className="flex items-center gap-3">
                <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${isChecked || isOver
                        ? 'border-amber-700 bg-amber-700'
                        : 'border-gray-300 bg-white'
                        }`}
                >
                    {(isChecked || isOver) && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <div>
                    <span className={`block text-sm font-medium ${isChecked || isOver ? 'font-bold text-amber-900' : 'text-gray-700'}`}>
                        {name}
                    </span>
                    {isOver && assignmentEnabled && (
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                            Drop here
                        </span>
                    )}
                </div>
            </div>
            <motion.span
                key={`${category.id}-${successAnimationKey}-${itemCount}`}
                animate={isRecentlyAssigned
                    ? {
                        scale: [1, 1.16, 1],
                        y: [0, -2, 0],
                        backgroundColor: [
                            'rgba(243, 244, 246, 1)',
                            'rgba(209, 250, 229, 1)',
                            'rgba(243, 244, 246, 1)',
                        ],
                        color: [
                            'rgba(107, 114, 128, 1)',
                            'rgba(5, 150, 105, 1)',
                            'rgba(107, 114, 128, 1)',
                        ],
                    }
                    : {
                        scale: 1,
                        y: 0,
                    }}
                transition={{ duration: 0.72, ease: 'easeOut', times: [0, 0.4, 1] }}
                className="inline-flex min-w-[72px] items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500"
            >
                {itemCount} Items
            </motion.span>
        </motion.button>
    );
};

export const CategoryFranchiseSidebar: React.FC<CategoryFranchiseSidebarProps> = ({
    categories,
    categoryItemCounts = {},
    isLoading,
    selectedCategory,
    onSelectCategory, 
    assignmentEnabled = true,
    activeDraggedProductName,
    highlightedCategoryId,
    successAnimationKey = 0,
    canAssign,
    isAssigning,
    onAssign,
    onAddCategory,
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter((cat) => {
        const name = getCategoryLabel(cat);
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleToggleCategory = (cat: EnrichedCategoryFranchiseItem) => {
        // Single-select: clicking same category deselects
        if (selectedCategory?.id === cat.id) {
            onSelectCategory(null);
        } else {
            onSelectCategory(cat);
        }
    };

    return (
        <aside className="flex w-full shrink-0 flex-col border-t border-gray-100 bg-white shadow-xl z-10 lg:w-96 lg:border-l lg:border-t-0">
            {/* Header */}
            <div className="shrink-0 border-b border-gray-100 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-gray-800 sm:text-xl">Categories</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={16} />
                    </div>
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-amber-300 rounded-lg bg-amber-50/30 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all text-sm"
                    placeholder="Search categories..."
                    type="text"
                    />
                </div>

                {activeDraggedProductName && assignmentEnabled && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                    >
                        <p className="text-xs font-semibold text-amber-800">Dragging product</p>
                        <p className="truncate text-sm text-amber-900">{activeDraggedProductName}</p>
                    </motion.div>
                )}
            </div>

            {/* Category List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <p className="text-xs font-semibold text-gray-400 tracking-wider mb-4 uppercase">
                    Select to Assign
                </p>

                {isLoading ? (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                        <p className="text-sm">Loading categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                        <p className="text-sm">No categories found</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredCategories.map((cat) => {
                            const isChecked = selectedCategory?.id === cat.id;
                            return (
                                <DroppableCategoryItem
                                    key={cat.id}
                                    category={cat}
                                    itemCount={categoryItemCounts?.[cat.category_id] || 0}
                                    isChecked={isChecked}
                                    isRecentlyAssigned={highlightedCategoryId === cat.category_id}
                                    assignmentEnabled={assignmentEnabled}
                                    successAnimationKey={successAnimationKey}
                                    onToggle={handleToggleCategory}
                                    getCategoryLabel={getCategoryLabel}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Add New Category Button */}
                <button
                    onClick={onAddCategory}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm text-gray-400 transition-colors hover:border-amber-400 hover:text-amber-600"
                >
                    <span>+</span>
                    <span>Add New Category</span>
                </button>
            </div>

            {/* Bottom Action */}
            <div className="shrink-0 bg-white p-5 border-t border-gray-100 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {!selectedCategory && (
                    <p className="text-xs text-amber-700 font-medium text-center">
                        ← Chọn một category trước
                    </p>
                )}
                {!assignmentEnabled && (
                    <p className="text-xs text-amber-700 font-medium text-center">
                        ← Chuyển về tab All để gán product
                    </p>
                )}
                {selectedCategory && assignmentEnabled && !canAssign && (
                    <p className="text-xs text-amber-700 font-medium text-center">
                        ← Chọn một product để gán
                    </p>
                )}
                <button
                    onClick={onAssign}
                    disabled={!assignmentEnabled || !canAssign || isAssigning}
                    className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2
                        ${assignmentEnabled && canAssign && !isAssigning
                            ? 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-700/20 cursor-pointer'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                >
                    {isAssigning && <Loader2 size={18} className="animate-spin" />}
                    {isAssigning ? 'Assigning...' : 'Assign to Product'}
                </button>
                <p className="text-xs text-gray-400 text-center">
                    Selected products will be updated with these categories.
                </p>
            </div>
        </aside>
    );
};

export default CategoryFranchiseSidebar;
