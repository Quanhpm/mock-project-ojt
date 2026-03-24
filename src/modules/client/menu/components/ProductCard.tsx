import type { MenuProduct } from "@/apis/endpointsCLIENT/client.api";
import { slugify } from "@/utils/slugify.util";
import { useNavigate } from "react-router-dom";

function ProductCard({ product, franchiseId }: { product: MenuProduct; franchiseId: string }) {
    const navigate = useNavigate();

    return (
        <div
            key={product.product_id}
            onClick={() => navigate(`/product/${slugify(product.name)}`, { state: { franchiseId, productId: product.product_id } })}
            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 p-4 rounded-xl bg-[var(--cf-surface)] border border-[var(--cf-secondary)]/20 cursor-pointer hover:shadow-xl hover:shadow-[var(--cf-primary)]/5 transition-all"
        >
            {/* Product Info */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 flex-1 min-w-0">
                {/* Image */}
                <div className="relative overflow-hidden rounded-lg size-20 md:size-24 shrink-0 bg-[var(--cf-bg)] self-center md:self-auto">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-[var(--cf-secondary)] ${product.image_url ? 'hidden' : ''}`}>
                        <span className="material-icons-outlined text-xl">image</span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0 text-center md:text-left">
                    <h3 className="text-lg font-bold text-[var(--cf-primary)] truncate">{product.name}</h3>
                    {/* <span className="text-xs font-mono text-[var(--cf-secondary)] mb-1">#{product.SKU}</span> */}
                    <p className="text-sm text-[var(--cf-secondary)] line-clamp-2">
                        {product.description}
                    </p>
                </div>
            </div>

            {/* Price and Action */}
            <div className="flex flex-col md:flex-row md:items-center items-center md:items-end gap-3 md:gap-3 shrink-0">
                <div className="text-center md:text-right">
                    <span className="text-xl font-bold text-[var(--cf-dark)]">
                        {product.sizes[0].price.toLocaleString('vi-VN')} ₫
                    </span>
                    {/* {product.sizes[0].price !== product.max_price && (
                        <div className="text-xs text-[var(--cf-secondary)] mt-0.5">
                            đến {product.max_price.toLocaleString('vi-VN')} ₫
                        </div>
                    )} */}
                </div>
                <button
                    className="bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] text-white px-5 py-2 rounded-lg text-sm font-bold transition-all transform active:scale-95 flex items-center gap-2"
                >
                    <span className="material-icons-outlined text-[18px]">add</span>
                    Thêm
                </button>
            </div>
        </div>
    )
}

export default ProductCard;