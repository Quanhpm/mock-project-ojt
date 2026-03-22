import { useState, useEffect } from 'react';
import { useStore } from './use-store.hook';
import {
  getAllFranchises,
  getAllCategoriesByFranchise,
  getMenuByFranchise,
  type FranchiseResponse,
  type CategoryResponse,
  type MenuByFranchise,
} from '@/apis/endpointsCLIENT/client.api';
import { filterNonToppingItems } from '../services/menu-page.service';

export function useMenuData() {
  const { franchiseId, setFranchiseId } = useStore();
  
  const [franchises, setFranchises] = useState<FranchiseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<MenuByFranchise[]>([]);

  // Fetch all franchises (only once on mount)
  const fetchFranchises = async () => {
    try {
      const response = await getAllFranchises();
      setFranchises(response || []);

      if (franchiseId) {
        setFranchiseId(franchiseId);
      } else {
        setFranchiseId(response?.[0]?.id ?? '');
      }
    } catch (error) {
      console.error('Failed to fetch franchises:', error);
      setFranchises([]);
    }
  };

  // Fetch categories for the selected franchise
  const fetchCategories = async (id: string) => {
    try {
      const response = await getAllCategoriesByFranchise(id);
      setCategories(filterNonToppingItems(response ?? []));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  // Fetch products for the selected franchise
  const fetchAllProducts = async (id: string) => {
    try {
      const response = await getMenuByFranchise(id, '');
      setProducts(filterNonToppingItems(response ?? []));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    }
  };

  // Get products filtered by category ID
  const getProductByCategory = (categoryId: string) => {
    const category = products.find((item) => item.category_id === categoryId);
    return category?.products ?? [];
  };

  // Load franchises on mount
  useEffect(() => {
    fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load categories and products when franchise changes
  useEffect(() => {
    if (!franchiseId) return;

    const loadData = async () => {
      await Promise.all([fetchCategories(franchiseId), fetchAllProducts(franchiseId)]);
    };

    loadData();
  }, [franchiseId]);

  return { franchises, categories, products, getProductByCategory }
}