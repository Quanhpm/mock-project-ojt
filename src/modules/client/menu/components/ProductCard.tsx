import type { Product } from "@/types/product.type";
import { useCartStore } from '@/stores/cart.store';
import { slugify } from "@/utils/slugify.util";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast.hook';

function ProductCard({ product }: { product: Product }) {
    const navigate = useNavigate();
    const addItem = useCartStore((state) => state.addItem);
    const { success } = useToast();

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();

        addItem({
            productId: product.id,
            name: product.name,
            price: product.min_price,
            image_url: product.image_url,
            SKU: product.SKU
        });

        success('Đã thêm vào giỏ hàng', `${product.name} đã được thêm vào giỏ hàng`);
    };

    return (
        <div
            key={product.id}
            onClick={() => navigate(`/product/${slugify(product.name)}`)}
            className="group flex items-center justify-between gap-6 p-4 rounded-xl bg-[var(--cf-surface)] border border-[var(--cf-secondary)]/20 cursor-pointer hover:shadow-xl hover:shadow-[var(--cf-primary)]/5 transition-all"
        >
            {/* Product Info */}
            <div className="flex items-center gap-6 flex-1">
                {/* Image */}
                <div className="relative overflow-hidden rounded-lg size-24 shrink-0 bg-[var(--cf-bg)]">
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
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-[var(--cf-primary)]">{product.name}</h3>
                    <span className="text-xs font-mono text-[var(--cf-secondary)] mb-1">#{product.SKU}</span>
                    <p className="text-sm text-[var(--cf-secondary)] line-clamp-2 max-w-md">
                        {product.description}
                    </p>
                </div>
            </div>

            {/* Price and Action */}
            <div className="flex flex-col items-end gap-3 min-w-[120px]">
                <div className="text-right">
                    <span className="text-xl font-bold text-[var(--cf-dark)]">
                        {product.min_price.toLocaleString('vi-VN')} ₫
                    </span>
                    {product.min_price !== product.max_price && (
                        <div className="text-xs text-[var(--cf-secondary)] mt-0.5">
                            đến {product.max_price.toLocaleString('vi-VN')} ₫
                        </div>
                    )}
                </div>
                <button
                    onClick={(e) => handleAddToCart(product, e)}
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