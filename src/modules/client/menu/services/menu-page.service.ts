import type { CategoryResponse } from '@/apis/endpointsCLIENT/client.api';

/** Get human-readable size label, convert 'default' to Vietnamese */
export const getDisplaySizeLabel = (rawSize?: string): string => {
  if (!rawSize) return '';
  return rawSize.trim().toLowerCase() === 'default' ? 'Mặc định' : rawSize;
};

/** Filter out items with 'topping' in category name */
export const filterNonToppingItems = <T extends { category_name?: string }>(
  items: T[],
): T[] => {
  return items.filter((item) => !item.category_name?.toLowerCase().includes('topping'));
};

/** Get only categories that have products */
export const filterValidCategories = (
  categories: CategoryResponse[],
  getProductByCategory: (categoryId: string) => unknown[],
): CategoryResponse[] => {
  return categories.filter((category) => getProductByCategory(category.category_id).length > 0);
};
