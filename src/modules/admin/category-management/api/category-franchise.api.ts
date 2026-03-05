import { httpClient } from "@/apis/httpClient";
import { axiosClient } from "@/apis/axios.config";
import type {
  CategoryFranchise,
  CategoryFranchiseSearchPayload,
  CategoryFranchiseSearchResponse,
  CategoryFranchiseCreatePayload,
  CategoryFranchiseUpdateDisplayOrderPayload,
  CategoryFranchiseToggleStatusPayload,
  CategorySelectItem,
} from "./category-franchise.types";

/**
 * Search category franchises with pagination and filters
 */
export const searchCategoryFranchises = async (
  payload: CategoryFranchiseSearchPayload
): Promise<CategoryFranchiseSearchResponse> => {
  const response = await axiosClient.post<CategoryFranchiseSearchResponse>(
    "/category-franchises/search",
    payload
  );
  return response.data;
};

/**
 * Get category franchise by ID
 */
export const getCategoryFranchiseById = async (
  id: string
): Promise<CategoryFranchise> => {
  const data = await httpClient.get<CategoryFranchise>({
    url: `/category-franchises/${id}`,
  });
  return data!;
};

/**
 * Create new category franchise assignment
 */
export const createCategoryFranchise = async (
  payload: CategoryFranchiseCreatePayload
): Promise<CategoryFranchise> => {
  const data = await httpClient.post<CategoryFranchise>({
    url: "/category-franchises",
    data: payload,
  });
  return data!;
};

/**
 * Update display order of category franchise
 */
export const updateCategoryFranchiseDisplayOrder = async (
  id: string,
  payload: CategoryFranchiseUpdateDisplayOrderPayload
): Promise<CategoryFranchise> => {
  const data = await httpClient.patch<CategoryFranchise>({
    url: `/category-franchises/${id}/display-order`,
    data: payload,
  });
  return data!;
};

/**
 * Toggle category franchise active status
 */
export const toggleCategoryFranchiseStatus = async (
  id: string,
  payload: CategoryFranchiseToggleStatusPayload
): Promise<CategoryFranchise> => {
  const data = await httpClient.patch<CategoryFranchise>({
    url: `/category-franchises/${id}/status`,
    data: payload,
  });
  return data!;
};

/**
 * Soft delete category franchise
 */
export const deleteCategoryFranchise = async (
  id: string
): Promise<void> => {
  await httpClient.delete({
    url: `/category-franchises/${id}`,
  });
};

/**
 * Restore deleted category franchise
 */
export const restoreCategoryFranchise = async (
  id: string
): Promise<CategoryFranchise> => {
  const data = await httpClient.patch<CategoryFranchise>({
    url: `/category-franchises/${id}/restore`,
  });
  return data!;
};

/**
 * Get master categories for dropdown (from categories API)
 */
export const getCategorySelectItems = async (): Promise<CategorySelectItem[]> => {
  const data = await httpClient.get<CategorySelectItem[]>({
    url: "/categories/select",
  });
  return data!;
};
