import { type ApiSuccessResponse } from "../http.types";
import { httpClient } from "../httpClient";

// Interface
interface FranchiseResponse {
    id: string;
    code: string;
    name: string;
}

interface CategoryResponse {
    category_id: string;
    category_name: string;
    category_code: string;
    franchise_id: string;
    franchise_name: string;
    franchise_code: string;
    display_order: number;
}

interface MenuProduct {
    product_id: string;
    name: string;
    description: string;
    image_url: string;
    is_have_topping: string[];
    sizes: {
        product_franchise_id: string;
        size: string;
        price: number;
        is_available: boolean;
    }[];
}

interface MenuByFranchise {
    category_id: string;
    category_name: string;
    category_display_order: number;
    products: MenuProduct[];
}

interface ProductByFranchiseAndCategory {
    product_id: string;
    category_id: string;
    category_name: string;
    category_display_order: number;
    product_display_order: number;
    SKU: string;
    name: string;
    description: string;
    image_url: string;
    is_have_topping: string[];
    sizes: {
        product_franchise_id: string;
        size: string;
        price: number;
        is_available: boolean;
    }[];
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
    is_have_topping: string[];
    sizes: {
        product_franchise_id: string;
        size: string;
        price: number;
        is_available: boolean;
    }[];
}

type ClientGetAllFranchisesResponse = ApiSuccessResponse<FranchiseResponse[]>;
type ClientGetAllCategoriesByFranchiseResponse = ApiSuccessResponse<CategoryResponse[]>;
type ClientGetMenuByFranchiseResponse = ApiSuccessResponse<MenuByFranchise[]>;
type ClientGetProductDetailResponse = ApiSuccessResponse<ProductDetailResponse>;
type ClientGetProductsByFranchiseAndCategoryResponse = ApiSuccessResponse<ProductByFranchiseAndCategory[]>;

// API Endpoints
export const getAllFranchises = (): Promise<ClientGetAllFranchisesResponse | null> => {
    return httpClient.get<ClientGetAllFranchisesResponse>({
        url: "clients/franchises",
    });
}

export const getAllCategoriesByFranchise = (franchiseId: string): Promise<ClientGetAllCategoriesByFranchiseResponse | null> => {
    return httpClient.get<ClientGetAllCategoriesByFranchiseResponse>({
        url: `clients/franchises/${franchiseId}/categories`,
    });
}

// Category có thể rỗng
export const getMenuByFranchise = (franchiseId: string, categoryId?: string): Promise<ClientGetMenuByFranchiseResponse | null> => {
    return httpClient.get<ClientGetMenuByFranchiseResponse>({
        url: `clients/franchises/menu?franchise_id=${franchiseId}&category_id=${categoryId}`,
    });
}

export const getProductsByFranchiseAndCategory = (franchiseId: string, categoryId?: string): Promise<ClientGetProductsByFranchiseAndCategoryResponse | null> => {
    return httpClient.get<ClientGetProductsByFranchiseAndCategoryResponse>({
        url: `clients/franchises/products?franchise_id=${franchiseId}&category_id=${categoryId}`,
    });
}

export const getProductDetail = (productId: string): Promise<ClientGetProductDetailResponse | null> => {
    return httpClient.get<ClientGetProductDetailResponse>({
        url: `clients/products/${productId}`,
    });
}