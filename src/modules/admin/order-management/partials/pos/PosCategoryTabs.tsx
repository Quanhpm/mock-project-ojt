import { memo } from "react";
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
    <div className="hide-scroll flex items-center gap-3 overflow-x-auto bg-white px-6 pb-2 pt-2">
      <button
        onClick={() => onSelectCategory("all")}
        className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-5 py-2.5 text-sm font-bold shadow-md transition-transform active:scale-95 ${
          selectedCategory === "all"
            ? "border-amber-700 bg-amber-700 text-white"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-amber-700"
        }`}
      >
        <Star size={20} />
        Tất cả
      </button>
      {categories.map((category) => (
        <button
          key={category.category_id}
          onClick={() => onSelectCategory(category.category_id)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-5 py-2.5 text-sm font-bold shadow-md transition-transform active:scale-95 ${
            selectedCategory === category.category_id
              ? "border-amber-700 bg-amber-700 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-amber-700"
          }`}
        >
          {resolveIcon(category)}
          {category.category_name}
        </button>
      ))}
    </div>
  );
});

export default PosCategoryTabs;
