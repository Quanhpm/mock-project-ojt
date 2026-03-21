import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getProductsByFranchiseWithCategory,
    type ProductWithCategoriesApiItem,
} from '@/apis/endpoints/product-category-franchise.api';
import { productApi, type ProductItem } from '@/apis/endpoints/product.api';

export interface EnrichedProductFranchiseItem extends ProductWithCategoriesApiItem {
    product?: ProductItem;
    image_url?: string;
    description?: string;
}

interface UseProductFranchiseListParams {
    franchiseId: string;
}

export function useProductFranchiseList({ franchiseId }: UseProductFranchiseListParams) {
    const [products, setProducts] = useState<EnrichedProductFranchiseItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

    const fetchProducts = useCallback(async () => {
        if (!franchiseId) {
            setProducts([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const [productFranchises, masterProducts] = await Promise.all([
                getProductsByFranchiseWithCategory(franchiseId),
                productApi.searchProducts({
                    searchCondition: {
                        is_deleted: false,
                    },
                    pageInfo: {
                        pageNum: 1,
                        pageSize: 1000,
                    },
                }),
            ]);

            const productById = new Map(
                (masterProducts.data ?? []).map((product) => [product.id, product] as const),
            );

            const enriched = (productFranchises ?? []).map((item) => {
                const product = productById.get(item.product_id);

                return {
                    ...item,
                    product,
                    image_url: product?.image_url,
                    description: product?.description ?? product?.content ?? '',
                };
            });

            setProducts(enriched);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load products';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [franchiseId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const sizeOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    products
                        .map((item) => item.size)
                        .filter((size): size is string => Boolean(size)),
                ),
            ),
        [products],
    );

    return {
        products,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        appliedSearchQuery,
        setAppliedSearchQuery,
        sizeOptions,
        refetch: fetchProducts,
    };
}
