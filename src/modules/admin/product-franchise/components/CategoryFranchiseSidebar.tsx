import React, { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import type { EnrichedCategoryFranchiseItem } from '../hooks/useCategoryFranchiseList.hook.ts';

interface CategoryFranchiseSidebarProps {
    categories: EnrichedCategoryFranchiseItem[];
    isLoading: boolean;
    selectedCategory: EnrichedCategoryFranchiseItem | null;
    onSelectCategory: (cat: EnrichedCategoryFranchiseItem | null) => void;
    canAssign: boolean;
    isAssigning: boolean;
    onAssign: () => void;
    onAddCategory?: () => void;
    onClose?: () => void;
}

export const CategoryFranchiseSidebar: React.FC<CategoryFranchiseSidebarProps> = ({
    categories,
    isLoading,
    selectedCategory,
    onSelectCategory,
    canAssign,
    isAssigning,
    onAssign,
    onAddCategory,
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter((cat) => {
        const name = cat.category?.name ?? cat.category_id;
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
        <aside className="w-96 shrink-0 bg-white flex flex-col z-10 shadow-xl border-l border-gray-100">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Categories</h2>
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
            </div>

            {/* Category List */}
            <div className="flex-1 overflow-y-auto p-5">
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
                            const name = cat.category?.name ?? cat.category_id;
                            const isChecked = selectedCategory?.id === cat.id;
                            return (
                                <label
                                    key={cat.id}
                                    onClick={() => handleToggleCategory(cat)}
                                    className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors ${isChecked
                                        ? 'bg-amber-50 border border-amber-200'
                                        : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="category-selection"
                                            checked={isChecked}
                                            onChange={() => handleToggleCategory(cat)}
                                            className="w-5 h-5 border-gray-300 text-amber-700 focus:ring-amber-700 cursor-pointer accent-amber-700"
                                        />
                                        <span className={`text-sm font-medium ${isChecked ? 'text-amber-800 font-bold' : 'text-gray-700'
                                            }`}>
                                            {name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {cat.display_order} Items
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}

                {/* Add New Category Button */}
                <button
                    onClick={onAddCategory}
                    className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-400 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
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
                {selectedCategory && !canAssign && (
                    <p className="text-xs text-amber-700 font-medium text-center">
                        ← Chọn một product để gán
                    </p>
                )}
                <button
                    onClick={onAssign}
                    disabled={!canAssign || isAssigning}
                    className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2
                        ${canAssign && !isAssigning
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
