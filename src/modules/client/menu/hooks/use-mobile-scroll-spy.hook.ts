import { useEffect, useRef } from "react"

export function useMobileScrollSpy(activeCategory: string) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const container = scrollContainerRef.current;
        const activeBtn = activeButtonRef.current;
        if (!container || !activeBtn) return;

        // Tính toán vị trí để căn giữa pill active trong container
        const containerWidth = container.offsetWidth;
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;

        container.scrollTo({
            left: btnLeft - containerWidth / 2 + btnWidth / 2,
            behavior: 'smooth',
        });
    }, [activeCategory]);

    return { scrollContainerRef, activeButtonRef }
}