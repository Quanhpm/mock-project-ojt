import type { CategoryResponse } from '@/apis/endpointsCLIENT/client.api';

interface MenuMobileCategoryTabsProps {
  categories: CategoryResponse[];
  activeCategory: string;
  onSelectCategory: (categoryCode: string) => void;
}

function MenuMobileCategoryTabs({
  categories,
  activeCategory,
  onSelectCategory,
}: MenuMobileCategoryTabsProps) {
  return (
    <div className="lg:hidden sticky top-[64px] z-20 -mx-4 border-y border-[var(--cf-secondary)]/10 bg-[var(--cf-bg)]/90 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
      <div className="scrollbar-hide flex gap-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.category_code}
            onClick={() => onSelectCategory(category.category_code)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeCategory === category.category_code
              ? 'bg-[var(--cf-primary)] text-white shadow-md'
              : 'border border-[var(--cf-secondary)]/20 bg-white/80 text-[var(--cf-secondary)]'
              }`}
            type="button"
          >
            {category.category_name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenuMobileCategoryTabs;
