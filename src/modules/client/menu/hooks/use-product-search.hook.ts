import { useState } from 'react';
import type { MenuProduct } from '@/apis/endpointsCLIENT/client.api';
import type { MenuSectionData } from '../services/menu-page.service';

interface UseProductSearchReturn {
  search: string;
  filteredProducts: MenuProduct[];
  showSearchResults: boolean;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useProductSearch(sections: MenuSectionData[]): UseProductSearchReturn {
  const [search, setSearch] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<MenuProduct[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const filterProductsBySearch = (searchTerm: string): MenuProduct[] => {
    return sections.flatMap((section) =>
      section.products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const results = filterProductsBySearch(search);
      setFilteredProducts(results);
      setShowSearchResults(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);

    if (searchTerm === '') {
      setFilteredProducts([]);
      setShowSearchResults(false);
    }
  };

  return { search, filteredProducts, showSearchResults, handleSearchChange, handleKeyDown };
}
