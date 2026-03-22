import type { CategoryResponse, MenuProduct } from '@/apis/endpointsCLIENT/client.api';
import ProductCard from './ProductCard';

interface MenuCategorySectionsProps {
  categories: CategoryResponse[];
  franchiseId: string;
  getProductByCategory: (categoryId: string) => MenuProduct[];
  setSectionRef: (code: string, el: HTMLDivElement | null) => void;
}

function MenuCategorySections({
  categories,
  franchiseId,
  getProductByCategory,
  setSectionRef,
}: MenuCategorySectionsProps) {
  return (
    <>
      {categories.map((category) => {
        const categoryProducts = getProductByCategory(category.category_id);

        if (!categoryProducts || categoryProducts.length === 0) return null;

        return (
          <div
            key={category.category_code}
            id={category.category_code}
            ref={(el) => setSectionRef(category.category_code, el)}
            className="scroll-mt-28 rounded-[28px] border border-[var(--cf-secondary)]/15 bg-white/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)] md:p-8"
          >
            <div className="mb-6 flex items-center gap-4 border-b border-[var(--cf-secondary)]/20 pb-5">
              <h2 className="text-2xl font-black text-[var(--cf-dark)] md:text-3xl">
                {category.category_name}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[var(--cf-primary)]/40 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  franchiseId={franchiseId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default MenuCategorySections;
