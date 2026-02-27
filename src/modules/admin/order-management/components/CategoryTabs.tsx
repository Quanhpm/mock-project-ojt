import React from 'react';
import { Star, Coffee, UtensilsCrossed, Cake, Wine, Plus } from 'lucide-react';
import type { MenuCategory } from '../types/order.types.ts';

interface CategoryTabsProps {
  categories: MenuCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Star: <Star size={20} />,
  Coffee: <Coffee size={20} />,
  UtensilsCrossed: <UtensilsCrossed size={20} />,
  Cake: <Cake size={20} />,
  Wine: <Wine size={20} />,
  Plus: <Plus size={20} />,
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto hide-scroll pb-2 pt-2 px-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-md border text-sm font-bold whitespace-nowrap transition-transform active:scale-95 ${
            selectedCategory === category.id
              ? 'bg-amber-700 text-white border-amber-700'
              : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-amber-700 border-gray-200'
          }`}
        >
          {category.icon && iconMap[category.icon]}
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
