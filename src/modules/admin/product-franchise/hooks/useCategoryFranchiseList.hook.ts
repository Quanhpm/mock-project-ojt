import { useState, useEffect, useCallback } from 'react';
import {
    searchCategoryFranchises,
    type CategoryFranchiseItem,
    type SearchCategoryFranchisesRequest,
} from '@/apis/endpoints/category-franchise.api';
import { getCategoryById, type CategoryItem } from '@/apis/endpoints/category.api';

export interface EnrichedCategoryFranchiseItem extends CategoryFranchiseItem {
    category?: CategoryItem;
}

interface UseCategoryFranchiseListParams {
    franchiseId: string;
}

export function useCategoryFranchiseList({ franchiseId }: UseCategoryFranchiseListParams) {
    const [categories, setCategories] = useState<EnrichedCategoryFranchiseItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        if (!franchiseId) return;

        setIsLoading(true);
        setError(null);

        try {
            const request: SearchCategoryFranchisesRequest = {
                searchCondition: {
                    franchise_id: franchiseId,
                    is_deleted: false,
                },
                pageInfo: {
                    pageNum: 1,
                    pageSize: 100,
                },
            };

            const response = await searchCategoryFranchises(request);

            if (response?.data) {
                // Batch-fetch category details in parallel to get names
                const enriched = await Promise.all(
                    response.data.map(async (cf) => {
                        try {
                            const category = await getCategoryById(cf.category_id);
                            return { ...cf, category: category ?? undefined };
                        } catch {
                            return { ...cf };
                        }
                    })
                );
                setCategories(enriched);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load categories';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [franchiseId]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        isLoading,
        error,
        refetch: fetchCategories,
    };
}
