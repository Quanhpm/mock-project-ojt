import { httpClient } from "../httpClient";

// Interface
// interface ResponseItem<T> {
//     success: boolean;
//     data: T;
// }
type Size = "S" | "M" | "L" | "DEFAULT"

export interface FranchiseResponse {
    id: string;
    code: string;
    name: string;
}

export interface CategoryResponse {
    category_id: string;
    category_name: string;
    category_code: string;
    franchise_id: string;
    franchise_name: string;
    franchise_code: string;
    display_order: number;
}

export interface ProductSize {
    product_franchise_id: string;
    size: Size;
    price: number;
    is_available: boolean;
}

export interface MenuProduct {
    product_id: string;
    name: string;
    description: string;
    image_url: string;
    is_have_topping: boolean;
    sizes: ProductSize[];
}

export interface MenuByFranchise {
    category_id: string;
    category_name: string;
    category_display_order: number;
    products: MenuProduct[];
}

export interface ProductByFranchiseAndCategory {
    product_id: string;
    category_id: string;
    category_name: string;
    category_display_order: number;
    product_display_order: number;
    SKU: string;
    name: string;
    description: string;
    image_url: string;
    is_have_topping: boolean;
    sizes: ProductSize[];
}

interface ProductDetailResponse {
    product_id: string;
    category_id: string;
    category_name: string;
    SKU: string;
    name: string;
    description: string;
    content: string;
    image_url: string;
    image_urls: string[];
    is_have_topping: boolean;
    sizes: ProductSize[];
}

// API Endpoints
let allFranchisesCache: FranchiseResponse[] | null = null;
let allFranchisesRequest: Promise<FranchiseResponse[] | null> | null = null;

export const getAllFranchises = (): Promise<FranchiseResponse[] | null> => {
    return httpClient.get<FranchiseResponse[]>({
        url: "clients/franchises",
    });
}

export const getAllFranchisesCached = async (): Promise<FranchiseResponse[] | null> => {
    if (allFranchisesCache) {
        return allFranchisesCache;
    }

    if (allFranchisesRequest) {
        return allFranchisesRequest;
    }

    allFranchisesRequest = getAllFranchises()
        .then((response) => {
            allFranchisesCache = response ?? [];
            return allFranchisesCache;
        })
        .finally(() => {
            allFranchisesRequest = null;
        });

    return allFranchisesRequest;
}

export const getAllCategoriesByFranchise = (franchiseId: string): Promise<CategoryResponse[] | null> => {
    return httpClient.get<CategoryResponse[]>({
        url: `clients/franchises/${franchiseId}/categories`,
    });
}

// Không truyền categoryId -> lấy hết product trong franchise
// Truyền categoryId -> lấy product theo category
export const getMenuByFranchise = (franchiseId: string, categoryId?: string): Promise<MenuByFranchise[] | null> => {
    return httpClient.get<MenuByFranchise[]>({
        url: `clients/menu?franchiseId=${franchiseId}&categoryId=${categoryId}`,
    });
}

export const getProductsByFranchiseAndCategory = (franchiseId: string, categoryId?: string): Promise<ProductByFranchiseAndCategory[] | null> => {
    return httpClient.get<ProductByFranchiseAndCategory[]>({
        url: `clients/products?franchiseId=${franchiseId}&categoryId=${categoryId}`,
    });
}

export const getProductDetail = (productId: string): Promise<ProductDetailResponse | null> => {
    return httpClient.get<ProductDetailResponse>({
        url: `clients/products/${productId}`,
    });
}
