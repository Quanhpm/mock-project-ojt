import { useCallback, useEffect, useState } from 'react';
import {
    searchProductCategoryFranchises,
    type ProductCategoryFranchiseItem,
} from '@/apis/endpoints/product-category-franchise.api';
import { ALL_CATEGORY_TAB_ID } from '../utils/productFranchise.utils.ts';

interface UseProductCategoryAssignmentsParams {
    franchiseId: string;
    selectedCategoryTab: string;
    showDeletedInCategory: boolean;
}

function buildCategoryAssignmentLookup(items: ProductCategoryFranchiseItem[]) {
    const lookup = new Map<string, ProductCategoryFranchiseItem>();

    items.forEach((item) => {
        if (item.product_franchise_id && item.category_id) {
            lookup.set(`${item.product_franchise_id}:${item.category_id}`, item);
        }
    });

    return lookup;
}

function buildCategoryTabItemLookup(items: ProductCategoryFranchiseItem[]) {
    const lookup = new Map<string, ProductCategoryFranchiseItem>();

    items.forEach((item) => {
        lookup.set(item.product_franchise_id, item);
    });

    return lookup;
}

export function useProductCategoryAssignments({
    franchiseId,
    selectedCategoryTab,
    showDeletedInCategory,
}: UseProductCategoryAssignmentsParams) {
    const [categoryTabItems, setCategoryTabItems] =
        useState<Map<string, ProductCategoryFranchiseItem> | null>(null);
    const [categoryAssignmentLookup, setCategoryAssignmentLookup] =
        useState<Map<string, ProductCategoryFranchiseItem>>(new Map());
    const [isCategoryTabLoading, setIsCategoryTabLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const refetch = useCallback(() => {
        setRefreshKey((current) => current + 1);
    }, []);

    const fetchActiveAssignments = useCallback(async () => {
        const response = await searchProductCategoryFranchises({
            searchCondition: {
                franchise_id: franchiseId,
                is_deleted: false,
            },
            pageInfo: { pageNum: 1, pageSize: 5000 },
        });

        setCategoryAssignmentLookup(buildCategoryAssignmentLookup(response?.data ?? []));
    }, [franchiseId]);

    useEffect(() => {
        if (!franchiseId) {
            return;
        }

        void fetchActiveAssignments().catch(() => {
            setCategoryAssignmentLookup(new Map());
        });
    }, [fetchActiveAssignments, franchiseId, refreshKey]);

    const fetchCategoryTabAssignments = useCallback(async () => {
        setIsCategoryTabLoading(true);

        try {
            const response = await searchProductCategoryFranchises({
                searchCondition: {
                    franchise_id: franchiseId,
                    category_id: selectedCategoryTab,
                    is_deleted: showDeletedInCategory,
                },
                pageInfo: { pageNum: 1, pageSize: 200 },
            });

            setCategoryTabItems(buildCategoryTabItemLookup(response?.data ?? []));
        } catch {
            setCategoryTabItems(new Map());
        } finally {
            setIsCategoryTabLoading(false);
        }
    }, [franchiseId, selectedCategoryTab, showDeletedInCategory]);

    useEffect(() => {
        if (!franchiseId || selectedCategoryTab === ALL_CATEGORY_TAB_ID) {
            return;
        }

        void fetchCategoryTabAssignments();
    }, [fetchCategoryTabAssignments, franchiseId, refreshKey, selectedCategoryTab]);

    return {
        categoryTabItems:
            !franchiseId || selectedCategoryTab === ALL_CATEGORY_TAB_ID
                ? null
                : categoryTabItems,
        categoryAssignmentLookup: franchiseId ? categoryAssignmentLookup : new Map(),
        isCategoryTabLoading:
            Boolean(franchiseId) &&
            selectedCategoryTab !== ALL_CATEGORY_TAB_ID &&
            isCategoryTabLoading,
        refetch,
    };
}
