import productsData from '@/mockdata/products.json';
import categoriesData from '@/mockdata/categories.json';
import type { MenuItem, MenuCategory } from '../types/order.types.ts';

// Map categories from mockdata
export const menuCategories: MenuCategory[] = categoriesData
  .filter((cat) => cat.is_active && !cat.is_deleted)
  .map((cat) => ({
    id: cat.id.toString(),
    name: cat.name,
    icon: cat.code === 'COFFEE' ? 'Coffee' : cat.code === 'TEA' ? 'Wine' : 'Cake',
  }));

// Map products from mockdata
export const mockMenuItems: MenuItem[] = productsData
  .filter((product) => product.is_active && !product.is_deleted)
  .slice(0, 16) // Limit to 16 items for display
  .map((product) => ({
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    price: product.min_price,
    image: product.image_url,
    category: product.category_id.toString().toLowerCase(),
    isLowStock: Math.random() > 0.8, // Randomly mark some as low stock
  }));
