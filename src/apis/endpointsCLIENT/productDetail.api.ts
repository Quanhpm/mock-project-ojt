import { httpClient } from "../httpClient";

export interface ProductSize {
    product_franchise_id: string;
    size: string;
    price: number;
    is_available: boolean;
}

export interface ProductDetailResponse {
    product_id: string;
    category_id: string;
    category_name: string;
    SKU: string;
    name: string;
    description: string;
    content: string;
    image_url: string;
    images_url: string[];
    is_have_topping: boolean;
    sizes: ProductSize[];
}

export const getProductDetail = async (franchiseId: string, productId: string): Promise<ProductDetailResponse | null> => {
    return httpClient.get<ProductDetailResponse>({
        url: `clients/franchises/${franchiseId}/products/${productId}`,
    });
}
