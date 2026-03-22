import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Cake, Coffee, Plus, Star, UtensilsCrossed, Wine } from "lucide-react";
import type { PosCategory } from "../../models/menu.models";

interface PosCategoryTabsProps {
  categories: PosCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const PosCategoryTabs = memo(({
  categories,
  selectedCategory,
  onSelectCategory,
}: PosCategoryTabsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showMoreHint, setShowMoreHint] = useState(false);

  const updateScrollHint = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      setShowMoreHint(categories.length > 7);
      return;
    }

    const canScrollMore = container.scrollWidth - container.clientWidth - container.scrollLeft > 8;
    setShowMoreHint(canScrollMore);
  }, [categories.length]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      updateScrollHint();
    });

    const handleResize = () => {
      updateScrollHint();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateScrollHint]);

  const resolveIcon = (category: PosCategory) => {
    const code = category.category_code?.toLowerCase() || "";
    const name = category.category_name?.toLowerCase() || "";

    if (code.includes("coffee") || name.includes("coffee")) {
      return <Coffee size={20} />;
    }

    if (code.includes("tea") || name.includes("tea")) {
      return <Wine size={20} />;
    }

    if (code.includes("cake") || name.includes("cake") || name.includes("bánh")) {
      return <Cake size={20} />;
    }

    if (name.includes("food")) {
      return <UtensilsCrossed size={20} />;
    }

    return <Plus size={20} />;
  };

  return (
    <div className="flex min-w-0 max-w-full items-center overflow-hidden px-6 pb-3 pt-2">
      <div className="relative min-w-0 w-full max-w-[860px] overflow-hidden">
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollHint}
          className="hide-scroll flex min-w-0 max-w-full items-center gap-2 overflow-x-auto overflow-y-hidden pr-12 scrollbar-hide"
        >
          <button
            onClick={() => onSelectCategory("all")}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all active:scale-95 ${
              selectedCategory === "all"
                ? "bg-amber-700 text-white shadow-md shadow-amber-700/25 ring-1 ring-amber-700"
                : "bg-white text-gray-600 shadow-sm hover:text-amber-700 hover:shadow-md hover:ring-1 hover:ring-black/5"
            }`}
          >
            <Star size={18} />
            <span className="truncate">Tất cả món</span>
          </button>

          {categories.map((category) => {
            const isActive = selectedCategory === category.category_id;
            return (
              <button
                key={category.category_id}
                onClick={() => onSelectCategory(category.category_id)}
                title={category.category_name}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all active:scale-95 ${
                  isActive
                    ? "bg-amber-700 text-white shadow-md shadow-amber-700/25 ring-1 ring-amber-700"
                    : "bg-white text-gray-600 shadow-sm hover:text-amber-700 hover:shadow-md hover:ring-1 hover:ring-black/5"
                }`}
              >
                {resolveIcon(category)}
                <span className="max-w-[9.5rem] truncate">{category.category_name}</span>
              </button>
            );
          })}
        </div>

        {categories.length > 7 && showMoreHint ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-gray-50 via-gray-50/95 to-transparent pl-10 pr-1">
            <div className="rounded-full bg-white px-3 py-1 text-sm font-black tracking-[0.2em] text-gray-400 shadow-sm ring-1 ring-black/5">
              ...
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default PosCategoryTabs;
