import type { MenuProduct } from '@/apis/endpointsCLIENT/client.api';
import ProductCard from './ProductCard';

interface MenuSearchResultSectionProps {
  search: string;
  filteredProducts: MenuProduct[];
  franchiseId: string;
}

function MenuSearchResultSection({
  search,
  filteredProducts,
  franchiseId,
}: MenuSearchResultSectionProps) {
  return (
    <div className="space-y-4 rounded-[28px] border border-[var(--cf-primary)]/10 bg-white/70 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.06)] md:p-8">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--cf-secondary)]/15 pb-4">
        <h2 className="text-2xl font-black text-[var(--cf-dark)] md:text-3xl">
          Kết quả tìm kiếm
        </h2>
        <span className="rounded-full bg-[var(--cf-primary)]/10 px-4 py-1 text-sm font-semibold text-[var(--cf-primary)]">
          {filteredProducts.length} sản phẩm
        </span>
      </div>

      <p className="text-sm text-[var(--cf-secondary)]">
        Từ khóa: <span className="font-semibold text-[var(--cf-dark)]">"{search}"</span>
      </p>

      {filteredProducts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--cf-secondary)]/30 bg-[var(--cf-bg)] px-5 py-8 text-center text-base text-[var(--cf-secondary)]">
          Không tìm thấy sản phẩm phù hợp
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              franchiseId={franchiseId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuSearchResultSection;
