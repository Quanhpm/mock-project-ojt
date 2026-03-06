// Product Franchise API endpoints
import { httpClient } from "@/apis/httpClient";
import type { ProductFranchise } from "@/types"; // Đảm bảo bạn đã khai báo type này

// ======================== API Endpoints ========================

// PRODUCT-FRANCHISE-01: Create Item
export const createProductFranchise = async (data: {
  franchise_id: string;
  product_id: string;
  size: string;
  price_base: number;
}) => {
  return httpClient.post<ProductFranchise, typeof data>({
    url: `/product-franchises`,
    data,
  });
};

// PRODUCT-FRANCHISE-02: Search Items by Conditions
export const searchProductFranchises = async (data: {
  searchCondition: {
    product_id?: string;
    franchise_id?: string;
    size?: string;
    price_from?: string | number;
    price_to?: string | number;
    is_active?: string | boolean;
    is_deleted?: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}) => {
  return httpClient.post<ProductFranchise[], typeof data>({
    url: `/product-franchises/search`,
    data,
  });
};

// PRODUCT-FRANCHISE-03: Get Item
export const getProductFranchiseById = async (id: string) => {
  return httpClient.get<ProductFranchise, { id: string }>({
    url: `/product-franchises/${id}`,
    params: { id },
  });
};

// PRODUCT-FRANCHISE-04: Update Item
export const updateProductFranchise = async (
  id: string,
  data: {
    size: string;
    price_base: number;
  },
) => {
  return httpClient.put<ProductFranchise, typeof data>({
    url: `/product-franchises/${id}`,
    data,
  });
};

// PRODUCT-FRANCHISE-05: Delete Item
export const deleteProductFranchise = async (id: string) => {
  return httpClient.delete<null, { id: string }>({
    url: `/product-franchises/${id}`,
    params: { id },
  });
};

// PRODUCT-FRANCHISE-06: Restore Item
export const restoreProductFranchise = async (id: string) => {
  // Lưu ý: Trong tài liệu ghi URL là /api/product-franchises/restore.
  // Nếu BE yêu cầu truyền id trên URL theo chuẩn các API khác, hãy đổi thành: `/product-franchises/${id}/restore`
  return httpClient.patch<null, any>({
    url: `/product-franchises/restore`,
    data: { id }, // Truyền id qua body (hoặc params tùy thuộc vào BE)
  });
};

// PRODUCT-FRANCHISE-07: Change Status Item
export const changeProductFranchiseStatus = async (
  id: string,
  is_active: boolean,
) => {
  // Lưu ý: Trong tài liệu ghi URL là /api/product-franchises/status.
  // Nếu BE yêu cầu truyền id trên URL, hãy đổi thành: `/product-franchises/${id}/status`
  return httpClient.patch<null, { is_active: boolean; id?: string }>({
    url: `/product-franchises/status`,
    data: { id, is_active },
  });
};
