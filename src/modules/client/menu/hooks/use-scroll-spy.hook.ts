import { useRef, useState, useEffect, useCallback } from 'react';
import type { CategoryResponse } from '@/apis/endpointsCLIENT/client.api';

interface UseScrollSpyReturn {
  activeCategory: string;
  scrollToSection: (code: string) => void;
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  setSectionRef: (code: string, el: HTMLDivElement | null) => void;
}

export function useScrollSpy(
  categories: CategoryResponse[],
  validCount: number,
): UseScrollSpyReturn {
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [refsReady, setRefsReady] = useState(false);

  // Initialize active category and reset refs when categories change
  useEffect(() => {
    if (categories.length > 0) {
      setActiveCategory(categories[0].category_code);
    }
    sectionRefs.current = {};
    setRefsReady(false);
  }, [categories]);

  // Register section references
  const setSectionRef = useCallback(
    (code: string, el: HTMLDivElement | null) => {
      if (!el) return;
      sectionRefs.current[code] = el;

      // When all refs are registered, mark as ready
      if (Object.keys(sectionRefs.current).length === validCount) {
        setRefsReady(true);
      }
    },
    [validCount],
  );

  // Scroll to specific section smoothly
  const scrollToSection = (code: string) => {
    sectionRefs.current[code]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveCategory(code);
  };

  // Observe section visibility and sync sidebar scroll
  useEffect(() => {
    if (!refsReady) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);

            // Sync sidebar scroll position with visible section
            const sidebar = document.querySelector('aside');
            if (sidebar) {
              const categoryElement = entry.target as HTMLElement;
              const categoryOffset = categoryElement.offsetTop;
              const sidebarHeight = sidebar.offsetHeight;
              const categoryHeight = categoryElement.offsetHeight;

              const isOutOfView =
                categoryOffset < sidebar.scrollTop ||
                categoryOffset + categoryHeight > sidebar.scrollTop + sidebarHeight;

              if (isOutOfView) {
                sidebar.scrollTop = categoryOffset - 1200;
              }
            }
          }
        });
      },
      {
        rootMargin: '-120px 0px -60% 0px',
        threshold: 0.1,
      },
    );

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [refsReady]);

  return { activeCategory, scrollToSection, sectionRefs, setSectionRef };
}