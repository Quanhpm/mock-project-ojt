import { useState, useEffect, useCallback } from 'react';
import {
    searchProductFranchises,
    type ProductFranchiseItem,
    type SearchProductFranchisesRequest,
} from '@/apis/endpoints/product-franchise.api';
import { productApi, type ProductItem } from '@/apis/endpoints/product.api';
import type { PageInfo } from '@/apis/http.types';

export interface EnrichedProductFranchiseItem extends ProductFranchiseItem {
    product?: ProductItem;
}

interface UseProductFranchiseListParams {
    franchiseId: string;
}

export function useProductFranchiseList({ franchiseId }: UseProductFranchiseListParams) {
    const [products, setProducts] = useState<EnrichedProductFranchiseItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageInfo, setPageInfo] = useState<PageInfo>({
        pageNum: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProducts = useCallback(async (pageNum = 1) => {
        if (!franchiseId) return;

        setIsLoading(true);
        setError(null);

        try {
            const request: SearchProductFranchisesRequest = {
                searchCondition: {
                    franchise_id: franchiseId,
                    is_deleted: false,
                },
                pageInfo: {
                    pageNum,
                    pageSize: 20,
                },
            };

            const response = await searchProductFranchises(request);

            if (response?.data) {
                // Batch-fetch product details in parallel to get names, images, descriptions
                const enriched = await Promise.all(
                    response.data.map(async (pf) => {
                        try {
                            const product = await productApi.getProductById(pf.product_id);
                            return { ...pf, product: product ?? undefined };
                        } catch {
                            return { ...pf };
                        }
                    })
                );
                setProducts(enriched);
                setPageInfo(response.pageInfo);
            }
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

    const setCurrentPage = (page: number) => {
        fetchProducts(page);
    };

    return {
        products,
        isLoading,
        error,
        pageInfo,
        searchQuery,
        setSearchQuery,
        setCurrentPage,
        refetch: fetchProducts,
    };
}
