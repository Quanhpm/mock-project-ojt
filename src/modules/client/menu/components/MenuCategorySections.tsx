import { memo } from 'react';
import type { MenuSectionData } from '../services/menu-page.service';
import MenuSection from './MenuSection';

interface MenuCategorySectionsProps {
  sections: MenuSectionData[];
  franchiseId: string;
  setSectionRef: (categoryId: string, el: HTMLDivElement | null) => void;
}

function MenuCategorySections({
  sections,
  franchiseId,
  setSectionRef,
}: MenuCategorySectionsProps) {
  return (
    <>
      {sections.map((section) => (
        <MenuSection
          key={section.id}
          section={section}
          franchiseId={franchiseId}
          setSectionRef={setSectionRef}
        />
      ))}
    </>
  );
}

export default memo(MenuCategorySections);
