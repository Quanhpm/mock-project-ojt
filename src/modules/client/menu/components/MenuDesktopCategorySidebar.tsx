import type { CategoryResponse } from '@/apis/endpointsCLIENT/client.api';
import { CategorySideBar } from './CategorySideBar';

interface MenuDesktopCategorySidebarProps {
  categories: CategoryResponse[];
  activeCategory: string;
  onSelectCategory: (categoryCode: string) => void;
}

function MenuDesktopCategorySidebar({
  categories,
  activeCategory,
  onSelectCategory,
}: MenuDesktopCategorySidebarProps) {
  return (
    <aside className="sticky top-[72px] hidden h-[calc(100vh-84px)] w-80 shrink-0 overflow-hidden rounded-[28px] border border-[var(--cf-primary)]/15 bg-[linear-gradient(160deg,var(--cf-surface),#ffffff)] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.08)] lg:flex lg:flex-col">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cf-secondary)]/80">
          Bộ sưu tập chọn lọc
        </p>
        <h3 className="text-3xl font-black leading-tight text-[var(--cf-dark)]">
          Danh mục
        </h3>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto">
        {categories.map((item) => (
          <CategorySideBar
            key={item.category_code}
            item={item}
            activeCategory={activeCategory === item.category_code}
            onClick={onSelectCategory}
          />
        ))}
      </div>
    </aside>
  );
}

export default MenuDesktopCategorySidebar;
