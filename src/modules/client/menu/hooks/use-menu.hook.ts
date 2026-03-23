import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from './use-store.hook';
import {
  getAllFranchises,
  getMenuByFranchise,
  type FranchiseResponse,
  type MenuByFranchise,
} from '@/apis/endpointsCLIENT/client.api';
import {
  buildMenuCategories,
  buildMenuSections,
  type MenuCategory,
  type MenuSectionData,
} from '../services/menu-page.service';

interface UseMenuReturn {
  franchises: FranchiseResponse[];
  categories: MenuCategory[];
  sections: MenuSectionData[];
}

export function useMenu(): UseMenuReturn {
  const { franchiseId, setFranchiseId } = useStore();
  const initialFranchiseIdRef = useRef(franchiseId);

  const [franchises, setFranchises] = useState<FranchiseResponse[]>([]);
  const [menu, setMenu] = useState<MenuByFranchise[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchFranchises = async () => {
      try {
        const response = await getAllFranchises();

        if (!isMounted) return;

        const nextFranchises = response ?? [];
        setFranchises(nextFranchises);

        const currentFranchiseId = useStore.getState().franchiseId;
        const nextFranchiseId =
          currentFranchiseId || initialFranchiseIdRef.current || nextFranchises[0]?.id || '';

        if (nextFranchiseId && nextFranchiseId !== currentFranchiseId) {
          setFranchiseId(nextFranchiseId);
        }
      } catch (error) {
        if (!isMounted) return;

        console.error('Failed to fetch franchises:', error);
        setFranchises([]);
      }
    };

    fetchFranchises();

    return () => {
      isMounted = false;
    };
  }, [setFranchiseId]);

  useEffect(() => {
    if (!franchiseId) {
      return;
    }

    let isMounted = true;

    const fetchMenu = async () => {
      try {
        const response = await getMenuByFranchise(franchiseId, '');

        if (!isMounted) return;

        setMenu(response ?? []);
      } catch (error) {
        if (!isMounted) return;

        console.error('Failed to fetch menu:', error);
        setMenu([]);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, [franchiseId]);

  const sections = useMemo(
    () => (franchiseId ? buildMenuSections(menu) : []),
    [franchiseId, menu],
  );
  const categories = useMemo(() => buildMenuCategories(sections), [sections]);

  return {
    franchises,
    categories,
    sections,
  };
}
