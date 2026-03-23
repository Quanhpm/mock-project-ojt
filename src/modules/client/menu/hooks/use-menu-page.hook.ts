import { useMenu } from './use-menu.hook';
import { useProductSearch } from './use-product-search.hook';
import { useScrollSpy } from './use-scroll-spy.hook';
import { useStore } from './use-store.hook';

export function useMenuPage() {
  const { franchiseId, setFranchiseId } = useStore();
  const { franchises, categories, sections } = useMenu();
  const { activeCategory, scrollToSection, setSectionRef } = useScrollSpy(categories);

  const { search, filteredProducts, showSearchResults, handleSearchChange, handleKeyDown } =
    useProductSearch(sections);

  return {
    franchiseId,
    setFranchiseId,
    franchises,
    categories,
    sections,
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
