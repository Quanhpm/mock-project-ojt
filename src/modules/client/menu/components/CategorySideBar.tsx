import { memo } from 'react';
import type { MenuCategory } from '../services/menu-page.service';

interface CategorySidebarProps {
  category: MenuCategory;
  isActive: boolean;
  onClick: (categoryId: string) => void;
}

function CategorySidebarComponent({
  category,
  isActive,
  onClick,
}: CategorySidebarProps) {
  return (
    <button
      onClick={() => onClick(category.id)}
      className={`group relative mb-3 flex h-14 w-full items-center overflow-hidden rounded-xl border border-transparent px-5 text-left text-lg font-bold text-[var(--cf-dark)] shadow-sm transition-all duration-300 hover:border-[var(--cf-primary)]/20 hover:bg-gradient-to-r hover:from-[var(--cf-primary)] hover:to-[var(--cf-dark)] hover:text-white hover:shadow-lg active:scale-[0.99] ${
        isActive ? 'bg-[var(--cf-primary)] text-white shadow-lg' : ''
      }`}
      type="button"
    >
      <div className="absolute bottom-0 left-0 top-0 w-1.5 rounded-r-full bg-[var(--cf-primary)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--cf-accent-light)]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <span className="relative z-10 tracking-wide">{category.name}</span>
    </button>
  );
}

export const CategorySidebar = memo(CategorySidebarComponent);
