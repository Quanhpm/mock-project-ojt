import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import categories from '@/mockdata/categories.json';
import products from '@/mockdata/products.json';
import { useCartStore } from '@/stores/cart.store';
import { useToast } from '@/hooks/use-toast.hook';
import { slugify } from "@/utils/slugify.util";

interface Category {
    id: number;
    code: string;
    name: string;
    description: string;
    is_active: boolean;
    is_deleted: boolean;
}

interface Product {
    id: number;
    SKU: string;
    name: string;
    description: string;
    content: string;
    image_url: string;
    category_id: number;
    min_price: number;
    max_price: number;
    is_active: boolean;
    is_deleted: boolean;
}

function MenuPage() {
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const addItem = useCartStore((state) => state.addItem);
    const { success } = useToast();
    const navigate = useNavigate();

    const getCategoryIcon = (code: string): string => {
        const iconMap: { [key: string]: string } = {
            'COFFEE': 'local_cafe',
            'TEA': 'emoji_food_beverage',
            'BAKERY': 'bakery_dining',
            'SMOOTHIE': 'blender',
            'JUICE': 'local_bar',
        };
        return iconMap[code] || 'restaurant_menu';
    };

    const scrollToSection = (code: string) => {
        const element = sectionRefs.current[code];
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    const getProductsByCategory = (categoryId: number) => {
        return (products as Product[]).filter(
            (product: Product) => 
                product.category_id === categoryId && 
                product.is_active && 
                !product.is_deleted
        );
    };

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
        <div className="min-h-screen bg-[var(--cf-bg)] flex gap-8">
            {/* Sidebar Navigation - Sticky & Prominent */}
            <aside className="w-80 shrink-0 hidden lg:block sticky top-[100px] h-fit">
                <div className="bg-[var(--cf-surface)] rounded-2xl shadow-xl border border-[var(--cf-primary)]/10 p-8 backdrop-blur-sm">
                    <div className="flex flex-col gap-5">
                        <div className="mb-6">
                            <h3 className="text-3xl font-black uppercase tracking-wide text-[var(--cf-dark)] mb-3">Danh mục</h3>
                            <div className="h-1.5 w-20 bg-gradient-to-r from-[var(--cf-primary)] to-[var(--cf-accent-light)] rounded-full"></div>
                        </div>
                        {(categories as Category[]).map((item: Category) => (
                            <button
                                key={item.code}
                                onClick={() => scrollToSection(item.code)}
                                className="group relative flex items-center gap-5 px-7 py-5 rounded-xl text-left text-lg font-bold text-[var(--cf-dark)] hover:text-white bg-gradient-to-r from-transparent to-transparent hover:from-[var(--cf-primary)] hover:to-[var(--cf-dark)] transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-100 border border-transparent hover:border-[var(--cf-primary)]/20 overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--cf-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-full"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--cf-accent-light)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="material-icons-outlined text-3xl relative z-10 text-[var(--cf-primary)] group-hover:text-white transition-colors">{getCategoryIcon(item.code)}</span>
                                <span className="relative z-10 tracking-wide">{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Menu Content Area */}
            <section className="flex-1 flex flex-col gap-12 px-4 md:px-10 py-8">
                {/* Hero Info */}
                <div className="flex flex-col gap-4 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--cf-dark)]">Thực đơn của chúng tôi</h1>
                    <p className="text-[var(--cf-secondary)] text-lg leading-relaxed">
                        Khám phá bộ sưu tập sản phẩm cao cấp của chúng tôi. Sự xuất sắc được chế tác thủ công trong từng món.
                    </p>
                </div>

                {/* Category Sections */}
                {(categories as Category[]).map((category: Category) => {
                    const categoryProducts = getProductsByCategory(category.id);
                    return (
                        <div
                            key={category.code}
                            id={category.code}
                            ref={(el) => {
                                if (el) sectionRefs.current[category.code] = el;
                            }}
                            className="flex flex-col gap-6 scroll-mt-20"
                        >
                            {/* Category Header */}
                            <div className="border-b border-[var(--cf-secondary)]/20 pb-4">
                                <h2 className="text-2xl font-bold text-[var(--cf-dark)]">{category.name}</h2>
                                <p className="text-[var(--cf-secondary)] text-sm">{category.description}</p>
                            </div>

                            {/* Product List */}
                            <div className="grid grid-cols-1 gap-4">
                                {categoryProducts.length > 0 ? (
                                    categoryProducts.map((product: Product) => (
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
                                    ))
                                ) : (
                                    <div className="px-6 py-10 text-center bg-[var(--cf-surface)] rounded-xl">
                                        <span className="material-icons-outlined text-4xl text-[var(--cf-secondary)]/30 mb-2">inventory_2</span>
                                        <p className="text-[var(--cf-secondary)] text-base">
                                            Chưa có sản phẩm trong danh mục này
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}

export default MenuPage