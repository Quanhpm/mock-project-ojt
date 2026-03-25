import { memo } from 'react';
import type { MenuSectionData } from '../services/menu-page.service';
import ProductCard from './ProductCard';

interface MenuSectionProps {
  section: MenuSectionData;
  franchiseId: string;
  setSectionRef: (categoryId: string, el: HTMLDivElement | null) => void;
}

function MenuSectionComponent({
  section,
  franchiseId,
  setSectionRef,
}: MenuSectionProps) {
  return (
    <div
      id={section.domId}
      data-category-id={section.id}
      ref={(el) => setSectionRef(section.id, el)}
      className="scroll-mt-28 rounded-[28px] border border-[var(--cf-secondary)]/15 bg-white/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)] md:p-8"
    >
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-2xl font-black text-[var(--cf-dark)] md:text-3xl">
          {section.name}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--cf-primary)]/40 to-transparent"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
        {section.products.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            franchiseId={franchiseId}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(MenuSectionComponent);
