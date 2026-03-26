import { httpClient } from "@/apis/httpClient";
import type {
  ProductFranchiseCreateRequest,
  ProductFranchiseDetail,
  ProductFranchiseSearchItem,
  ProductFranchiseSearchRequest,
  ProductFranchiseSearchResponse,
  ProductFranchiseStatusRequest,
  ProductFranchiseUpdateRequest,
} from "../types/product-franchise.types";

export const createProductFranchise = (
  payload: ProductFranchiseCreateRequest,
): Promise<ProductFranchiseDetail | null> => {
  return httpClient.post<ProductFranchiseDetail, ProductFranchiseCreateRequest>({
    url: "/product-franchises",
    data: payload,
  });
};

export const searchProductFranchises = (
  payload: ProductFranchiseSearchRequest,
): Promise<ProductFranchiseSearchResponse> => {
  return httpClient.search<
    ProductFranchiseSearchItem,
    ProductFranchiseSearchRequest
  >({
    url: "/product-franchises/search",
    data: payload,
  }) as Promise<ProductFranchiseSearchResponse>;
};

export const getProductFranchiseById = (
  id: string,
): Promise<ProductFranchiseDetail | null> => {
  return httpClient.get<ProductFranchiseDetail>({
    url: `/product-franchises/${id}`,
  });
};

export const updateProductFranchise = (
  id: string,
  payload: ProductFranchiseUpdateRequest,
): Promise<ProductFranchiseDetail | null> => {
  return httpClient.put<ProductFranchiseDetail, ProductFranchiseUpdateRequest>({
    url: `/product-franchises/${id}`,
    data: payload,
  });
};

export const deleteProductFranchise = (id: string): Promise<null> => {
  return httpClient.delete<null>({
    url: `/product-franchises/${id}`,
  });
};

export const restoreProductFranchise = (
  id: string,
): Promise<ProductFranchiseDetail | null> => {
  return httpClient.patch<ProductFranchiseDetail>({
    url: `/product-franchises/${id}/restore`,
  });
};

export const updateProductFranchiseStatus = (
  id: string,
  payload: ProductFranchiseStatusRequest,
): Promise<ProductFranchiseDetail | null> => {
  return httpClient.patch<ProductFranchiseDetail, ProductFranchiseStatusRequest>(
    {
      url: `/product-franchises/${id}/status`,
      data: payload,
    },
  );
};
