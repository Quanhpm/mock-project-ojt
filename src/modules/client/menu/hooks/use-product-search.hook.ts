import { useState } from 'react';
import type { MenuByFranchise, MenuProduct } from '@/apis/endpointsCLIENT/client.api';

interface UseProductSearchReturn {
  search: string;
  filteredProducts: MenuProduct[];
  showSearchResults: boolean;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useProductSearch(products: MenuByFranchise[]): UseProductSearchReturn {
  const [search, setSearch] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<MenuProduct[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // Filter products by search term
  const filterProductsBySearch = (searchTerm: string): MenuProduct[] => {
    return products.flatMap((category) =>
      category.products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.category_name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  };

  // Handle Enter key press
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const results = filterProductsBySearch(search);
      setFilteredProducts(results);
      setShowSearchResults(true);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);

    // Clear results when search input is empty
    if (searchTerm === '') {
      setShowSearchResults(false);
    }
  };

  return { search, filteredProducts, showSearchResults, handleSearchChange, handleKeyDown };
}
