import { useCallback, useEffect, useRef, useState } from 'react';
import type { MenuCategory } from '../services/menu-page.service';

interface UseScrollSpyReturn {
  activeCategory: string;
  scrollToSection: (categoryId: string) => void;
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  setSectionRef: (categoryId: string, el: HTMLDivElement | null) => void;
}

export function useScrollSpy(categories: MenuCategory[]): UseScrollSpyReturn {
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [trackedCategory, setTrackedCategory] = useState<string>('');
  const [sectionRefVersion, setSectionRefVersion] = useState(0);

  useEffect(() => {
    sectionRefs.current = categories.reduce<{ [key: string]: HTMLDivElement | null }>(
      (refs, category) => {
        refs[category.id] = sectionRefs.current[category.id] ?? null;
        return refs;
      },
      {},
    );
  }, [categories]);

  const setSectionRef = useCallback((categoryId: string, el: HTMLDivElement | null) => {
    if (sectionRefs.current[categoryId] === el) {
      return;
    }

    sectionRefs.current[categoryId] = el;
    setSectionRefVersion((currentVersion) => currentVersion + 1);
  }, []);

  const scrollToSection = useCallback((categoryId: string) => {
    sectionRefs.current[categoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTrackedCategory(categoryId);
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    const sections = categories
      .map((category) => sectionRefs.current[category.id])
      .filter((section): section is HTMLDivElement => section !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryA.boundingClientRect.top - entryB.boundingClientRect.top);

        const nextCategoryId = visibleEntries[0]?.target.getAttribute('data-category-id');
        if (!nextCategoryId) return;

        setTrackedCategory((currentCategory) =>
          currentCategory === nextCategoryId ? currentCategory : nextCategoryId,
        );
      },
      {
        rootMargin: '-140px 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [categories, sectionRefVersion]);

  const activeCategory = categories.some((category) => category.id === trackedCategory)
    ? trackedCategory
    : (categories[0]?.id ?? '');

  return { activeCategory, scrollToSection, sectionRefs, setSectionRef };
}
