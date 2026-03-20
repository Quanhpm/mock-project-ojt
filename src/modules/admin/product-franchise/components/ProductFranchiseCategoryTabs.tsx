import React from 'react';
import type { ProductFranchiseCategoryTab } from '../utils/productFranchise.utils.ts';
import { ALL_CATEGORY_TAB_ID } from '../utils/productFranchise.utils.ts';

interface ProductFranchiseCategoryTabsProps {
    tabs: ProductFranchiseCategoryTab[];
    selectedCategoryTab: string;
    showDeletedInCategory: boolean;
    onSelectCategoryTab: (tabId: string) => void;
    onToggleShowDeleted: () => void;
}

export const ProductFranchiseCategoryTabs: React.FC<ProductFranchiseCategoryTabsProps> = ({
    tabs,
    selectedCategoryTab,
    showDeletedInCategory,
    onSelectCategoryTab,
    onToggleShowDeleted,
}) => {
    const isAllTab = selectedCategoryTab === ALL_CATEGORY_TAB_ID;

    return (
        <div className="flex items-center justify-between px-6 pb-2 pt-2">
            <div className="hide-scroll flex items-center gap-3 overflow-x-auto pr-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectCategoryTab(tab.id)}
                        className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-5 py-2.5 text-sm font-bold shadow-md transition-transform active:scale-95 ${selectedCategoryTab === tab.id
                            ? 'border-amber-700 bg-amber-700 text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-amber-700'
                            }`}
                    >
                        {tab.id === ALL_CATEGORY_TAB_ID ? '🏷️ ' : null}
                        {tab.name}
                    </button>
                ))}
            </div>

            {!isAllTab && (
                <div className="shrink-0">
                    <button
                        type="button"
                        onClick={onToggleShowDeleted}
                        className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${showDeletedInCategory
                            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        title="Lọc sản phẩm bị xoá khỏi danh mục"
                    >
                        {showDeletedInCategory ? 'Đang xem: Đã xoá' : 'Xem sản phẩm đã xoá'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductFranchiseCategoryTabs;
