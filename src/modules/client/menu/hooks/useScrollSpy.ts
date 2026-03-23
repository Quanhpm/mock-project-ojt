import { useRef, useState, useEffect, useCallback } from "react"
import type { CategoryResponse } from "@/apis/endpointsCLIENT/client.api";


export function useScrollSpy(categories: CategoryResponse[], validCount: number) {
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [refsReady, setRefsReady] = useState(false);

    useEffect(() => {
        if (categories.length > 0) {
            setActiveCategory(categories[0].category_code);
        }
        // Reset refs khi categories thay đổi
        sectionRefs.current = {};
        setRefsReady(false);
    }, [categories]);

    const setSectionRef = useCallback((code: string, el: HTMLDivElement | null) => {
        if (!el) return;
        sectionRefs.current[code] = el;

        // Khi số refs bằng số categories → DOM đã sẵn sàng
        if (Object.keys(sectionRefs.current).length === validCount) {
            setRefsReady(true);
        }
    }, [validCount]);

    const scrollToSection = (code: string) => {
        sectionRefs.current[code]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveCategory(code);
    };

    // Thêm hiệu ứng active cho sidebar khi cuộn đến section tương ứng
    useEffect(() => {
        if (!refsReady) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveCategory(entry.target.id);
                        // Đồng bộ hóa vị trí cuộn của sidebar với phần sản phẩm
                        const sidebar = document.querySelector('aside');
                        if (sidebar) {
                            const categoryElement = entry.target as HTMLElement;
                            const categoryOffset = categoryElement.offsetTop;
                            const sidebarHeight = sidebar.offsetHeight;
                            const categoryHeight = categoryElement.offsetHeight;

                            if (
                                categoryOffset < sidebar.scrollTop ||
                                categoryOffset + categoryHeight > sidebar.scrollTop + sidebarHeight
                            ) {
                                sidebar.scrollTop = categoryOffset - 1200;
                            }
                        }
                    }
                });
            },
            {
                rootMargin: "-120px 0px -60% 0px",
                threshold: 0.1,
            }
        );

        Object.values(sectionRefs.current).forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, [refsReady]);


    return { activeCategory, scrollToSection, sectionRefs, setSectionRef }
}