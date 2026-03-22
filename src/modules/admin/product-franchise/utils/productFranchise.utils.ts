import type { ProductCategoryFranchiseItem } from '@/apis/endpoints/product-category-franchise.api';
import type { EnrichedCategoryFranchiseItem } from '../hooks/useCategoryFranchiseList.hook.ts';
import type { EnrichedProductFranchiseItem } from '../hooks/useProductFranchiseList.hook.ts';

export const ALL_CATEGORY_TAB_ID = 'all';

interface CategoryLabelSource {
    category_id: string;
    category_name?: string | null;
    category?: {
        name?: string | null;
    } | null;
}

export interface ProductFranchiseCategoryTab {
    id: string;
    name: string;
}

interface FilterProductsParams {
    products: EnrichedProductFranchiseItem[];
    selectedCategoryTab: string;
    showDeletedInCategory: boolean;
    categoryTabItems: Map<string, ProductCategoryFranchiseItem> | null;
    appliedSearchQuery: string;
    selectedSize: string;
    selectedStatus: string;
}

export function getCategoryLabel(category: CategoryLabelSource): string {
    return category.category_name ?? category.category?.name ?? category.category_id;
}

export function buildCategoryTabs(
    categories: EnrichedCategoryFranchiseItem[],
): ProductFranchiseCategoryTab[] {
    return [
        { id: ALL_CATEGORY_TAB_ID, name: 'All' },
        ...categories.map((category) => ({
            id: category.category_id,
            name: getCategoryLabel(category),
        })),
    ];
}

export function buildCategoryItemCounts(
    products: EnrichedProductFranchiseItem[],
): Record<string, number> {
    return products.reduce<Record<string, number>>((counts, product) => {
        product.categories.forEach((category) => {
            counts[category.category_id] = (counts[category.category_id] || 0) + 1;
        });

        return counts;
    }, {});
}

export function filterProductFranchises({
    products,
    selectedCategoryTab,
    showDeletedInCategory,
    categoryTabItems,
    appliedSearchQuery,
    selectedSize,
    selectedStatus,
}: FilterProductsParams): EnrichedProductFranchiseItem[] {
    let result = products;

    if (selectedCategoryTab !== ALL_CATEGORY_TAB_ID) {
        result = showDeletedInCategory
            ? result.filter((product) => categoryTabItems?.has(product.product_franchise_id))
            : result.filter((product) =>
                product.categories.some((category) => category.category_id === selectedCategoryTab),
            );
    }

    if (appliedSearchQuery) {
        const query = appliedSearchQuery.toLowerCase();
        result = result.filter((product) =>
            [
                product.product_name,
                product.product_sku,
                product.size,
                product.product?.name,
                product.product?.SKU,
            ]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(query)),
        );
    }

    if (selectedSize !== ALL_CATEGORY_TAB_ID) {
        result = result.filter((product) => product.size.toLowerCase() === selectedSize.toLowerCase());
    }

    if (selectedStatus !== ALL_CATEGORY_TAB_ID) {
        const normalizedStatus = selectedStatus.toLowerCase();
        result = result.filter((product) => {
            if (normalizedStatus === 'active' || normalizedStatus === 'true') {
                return product.is_active === true;
            }

            if (normalizedStatus === 'inactive' || normalizedStatus === 'false') {
                return product.is_active === false;
            }

            if (normalizedStatus === 'deleted') {
                return product.is_deleted === true;
            }

            return false;
        });
    }

    return result;
}
