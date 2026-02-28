import { httpClient } from "@/apis/httpClient";
import type { Franchise, Product } from "@/types";

// ======================== API Endpoints ========================

export const getProductsByFranchise = async (franchiseId: number) => {
    return httpClient.get<Product[], { franchiseId: number }>({
        url: `/products/franchise/${franchiseId}`,
        params: { franchiseId },
    });
};

export const getAllProductInFranchise = async (franchiseId: number) => {
    return httpClient.get<Franchise, { franchiseId: number }>({
        url: `/franchises/${franchiseId}/products`,
        params: { franchiseId },
    });
};

export const getProductsByCategory = async (categoryId: number) => {
    return httpClient.get<Product[], { categoryId: number }>({
        url: `/products/category/${categoryId}`,
        params: { categoryId },
    });
};

export const getProductById = async (productId: number) => {
    return httpClient.get<Product, { productId: number }>({
        url: `/products/${productId}`,
        params: { productId },
    });
};