import { httpClient } from "@/apis";
import type {
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductSearchPayload,
  ProductSearchResponse,
  ProductStatusPayload,
  ProductSelectItem,
} from "./product.types";

// Search products with pagination
export const searchProducts = (
  payload: ProductSearchPayload
): Promise<ProductSearchResponse> => {
  return httpClient.search<Product, ProductSearchPayload>({
    url: "/products/search",
    data: payload,
  }) as Promise<ProductSearchResponse>;
};

// Get single product by ID
export const getProductById = (id: string): Promise<Product | null> => {
  return httpClient.get<Product>({
    url: `/products/${id}`,
  });
};

// Create new product
export const createProduct = (
  payload: ProductCreatePayload
): Promise<Product | null> => {
  return httpClient.post<Product, ProductCreatePayload>({
    url: "/products",
    data: payload,
  });
};

// Update product
export const updateProduct = (
  id: string,
  payload: ProductUpdatePayload
): Promise<Product | null> => {
  return httpClient.put<Product, ProductUpdatePayload>({
    url: `/products/${id}`,
    data: payload,
  });
};

// Delete product
export const deleteProduct = (id: string): Promise<any> => {
  return httpClient.delete<any>({
    url: `/products/${id}`,
  });
};

// Restore deleted product
export const restoreProduct = (id: string): Promise<Product | null> => {
  return httpClient.patch<Product, {}>({
    url: `/products/${id}/restore`,
    data: {},
  });
};

// Toggle product status (active/inactive)
export const toggleProductStatus = (
  id: string,
  payload: ProductStatusPayload
): Promise<Product | null> => {
  return httpClient.patch<Product, ProductStatusPayload>({
    url: `/products/${id}/status`,
    data: payload,
  });
};

// Get products for dropdown selection (using search API as workaround)
export const getProductSelectItems = async (): Promise<ProductSelectItem[]> => {
  try {
    // Use search API to get all active master products
    const response = await searchProducts({
      searchCondition: {
        is_active: true,
        is_deleted: false,
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 1000, // Large size to get all products
      },
    });

    // Map Product[] to ProductSelectItem[] with correct field names
    return response.data.map((product) => ({
      value: product.id,
      label: product.name,
      SKU: product.SKU,
      min_price: product.min_price ?? 0,
      max_price: product.max_price ?? 0,
    }));
  } catch (error) {
    console.error("Failed to load products via search API:", error);
    throw error;
  }
};
