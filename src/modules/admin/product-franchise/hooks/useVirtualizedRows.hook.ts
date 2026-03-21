import { useCallback, useEffect, useRef, useState, type UIEventHandler } from 'react';

interface UseVirtualizedRowsParams {
    itemCount: number;
    rowHeight: number;
    overscan?: number;
}

export function useVirtualizedRows({
    itemCount,
    rowHeight,
    overscan = 6,
}: UseVirtualizedRowsParams) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    const onScroll = useCallback<UIEventHandler<HTMLDivElement>>((event) => {
        setScrollTop(event.currentTarget.scrollTop);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const updateHeight = () => {
            setContainerHeight(container.clientHeight);
        };

        updateHeight();

        const observer = new ResizeObserver(() => {
            updateHeight();
        });

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    const visibleCount = Math.max(1, Math.ceil(containerHeight / rowHeight) + overscan * 2);
    const maxStartIndex = Math.max(0, itemCount - visibleCount);
    const startIndex = Math.min(
        maxStartIndex,
        Math.max(0, Math.floor(scrollTop / rowHeight) - overscan),
    );
    const endIndex = Math.min(itemCount, startIndex + visibleCount);
    const paddingTop = startIndex * rowHeight;
    const paddingBottom = Math.max(0, (itemCount - endIndex) * rowHeight);

    return {
        containerRef,
        onScroll,
        startIndex,
        endIndex,
        paddingTop,
        paddingBottom,
    };
}
