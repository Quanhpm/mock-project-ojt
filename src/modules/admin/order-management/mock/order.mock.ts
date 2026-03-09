import productsData from '@/mockdata/products.json';
import categoriesData from '@/mockdata/categories.json';
import type { MenuItem, MenuCategory } from '../types/order.types.ts';

const getCategoryIcon = (code: string) => {
  if (code === 'COFFEE') return 'Coffee';
  if (code === 'TEA') return 'Wine';
  return 'Cake';
};

// Map categories from mockdata
export const menuCategories: MenuCategory[] = [
  { id: 'all', name: 'Tất cả', icon: 'Star' },
  ...categoriesData
    .filter((cat) => cat.is_active && !cat.is_deleted)
    .map((cat) => ({
      id: cat.id.toString(),
      name: cat.name,
      icon: getCategoryIcon(cat.code),
    })),
];

// Map products from mockdata
export const mockMenuItems: MenuItem[] = productsData
  .filter((product) => product.is_active && !product.is_deleted)
  .slice(0, 40) // Limit to 40 items for display
  .map((product) => ({
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    price: product.min_price,
    image: product.image_url,
    category: product.category_id.toString().toLowerCase(),
    isLowStock: Math.random() > 0.8, // Randomly mark some as low stock
  }));
