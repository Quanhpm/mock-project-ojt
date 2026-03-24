import type { MenuCategory } from '../services/menu-page.service';

interface MenuMobileCategoryTabsProps {
  categories: MenuCategory[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

function MenuMobileCategoryTabs({
  categories,
  activeCategory,
  onSelectCategory,
}: MenuMobileCategoryTabsProps) {
  return (
    <div className="sticky top-0 md:top-16 z-20 border-y border-[var(--cf-secondary)]/10 bg-[var(--cf-bg)]/90 px-4 py-3 backdrop-blur-sm lg:hidden md:px-8">
      <div className="scrollbar-hide flex gap-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeCategory === category.id
              ? 'bg-[var(--cf-primary)] text-white shadow-md'
              : 'border border-[var(--cf-secondary)]/20 bg-white/80 text-[var(--cf-secondary)]'
              }`}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenuMobileCategoryTabs;
