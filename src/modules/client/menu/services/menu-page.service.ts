import type { MenuByFranchise, MenuProduct } from '@/apis/endpointsCLIENT/client.api';

/** Get human-readable size label, convert 'default' to Vietnamese */
export const getDisplaySizeLabel = (rawSize?: string): string => {
  if (!rawSize) return '';
  return rawSize.trim().toLowerCase() === 'default' ? 'M\u1eb7c \u0111\u1ecbnh' : rawSize;
};

/** Filter out items with 'topping' in category name */
export const filterNonToppingItems = <T extends { category_name?: string }>(
  items: T[],
): T[] => {
  return items.filter((item) => !item.category_name?.toLowerCase().includes('topping'));
};

export interface MenuCategory {
  id: string;
  name: string;
  domId: string;
  displayOrder: number;
}

export interface MenuSectionData extends MenuCategory {
  products: MenuProduct[];
}

export const getMenuSectionDomId = (categoryId: string): string => `menu-category-${categoryId}`;

export const buildMenuSections = (items: MenuByFranchise[]): MenuSectionData[] => {
  const sectionMap = new Map<string, MenuSectionData>();

  filterNonToppingItems(items).forEach((item) => {
    if (!item.category_id || item.products.length === 0) {
      return;
    }

    const existingSection = sectionMap.get(item.category_id);
    if (existingSection) {
      existingSection.products.push(...item.products);
      return;
    }

    sectionMap.set(item.category_id, {
      id: item.category_id,
      name: item.category_name,
      domId: getMenuSectionDomId(item.category_id),
      displayOrder: item.category_display_order,
      products: [...item.products],
    });
  });

  return [...sectionMap.values()].sort(
    (sectionA, sectionB) => sectionA.displayOrder - sectionB.displayOrder,
  );
};

export const buildMenuCategories = (sections: MenuSectionData[]): MenuCategory[] =>
  sections.map(({ id, name, domId, displayOrder }) => ({
    id,
    name,
    domId,
    displayOrder,
  }));
