import { useMemo } from 'react';
import { useMenuData } from './use-menu-data.hook';
import { useProductSearch } from './use-product-search.hook';
import { useScrollSpy } from './use-scroll-spy.hook';
import { useStore } from './use-store.hook';
import { filterValidCategories } from '../services/menu-page.service';

export function useMenuPage() {
  const { franchiseId, setFranchiseId } = useStore();
  const { franchises, categories, products, getProductByCategory } = useMenuData();

  // Filter categories that have products
  const validCategories = useMemo(
    () => filterValidCategories(categories, getProductByCategory),
    [categories, getProductByCategory],
  );

  const validCount = validCategories.length;
  const { activeCategory, scrollToSection, setSectionRef } = useScrollSpy(validCategories, validCount);

  const { search, filteredProducts, showSearchResults, handleSearchChange, handleKeyDown } =
    useProductSearch(products);

  return {
    franchiseId,
    setFranchiseId,
    franchises,
    categories,
    validCategories,
    products,
    getProductByCategory,
    activeCategory,
    scrollToSection,
    setSectionRef,
    search,
    filteredProducts,
    showSearchResults,
    handleSearchChange,
    handleKeyDown,
  };
}
