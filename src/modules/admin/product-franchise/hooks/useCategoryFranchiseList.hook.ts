import { useState, useEffect, useCallback } from 'react';
import {
    getCategoriesByFranchise,
    type FranchiseCategoryListItem,
} from '@/apis/endpoints/category-franchise.api';

export type EnrichedCategoryFranchiseItem = FranchiseCategoryListItem;

interface UseCategoryFranchiseListParams {
    franchiseId: string;
}

export function useCategoryFranchiseList({ franchiseId }: UseCategoryFranchiseListParams) {
    const [categories, setCategories] = useState<EnrichedCategoryFranchiseItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        if (!franchiseId) {
            setCategories([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getCategoriesByFranchise(franchiseId);
            setCategories(response ?? []);
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
