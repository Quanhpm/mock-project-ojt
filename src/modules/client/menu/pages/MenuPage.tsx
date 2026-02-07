import { useRef } from "react";
import Item from "../components/Item"
import categories from '@/mockdata/categories.json';
import products from '@/mockdata/products.json';
import { useCartStore } from '@/stores/cart.store';
import { useToast } from '@/hooks/use-toast.hook';

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

    const scrollToSection = (code: string) => {
        const element = sectionRefs.current[code];
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    // Lọc product theo category_id từ dữ liệu
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
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.min_price,
            image_url: product.image_url,
            SKU: product.SKU
        });

        success('Đã thêm vào giỏ hàng', `${product.name} đã được thêm vào giỏ hàng`);
    };

    return (
        <div className="min-h-screen bg-[var(--cf-bg)] flex">
            {/* Navigation - Sticky */}
            <nav className="sticky top-16 w-64 h-fit max-h-[calc(100vh-4rem)] bg-white backdrop-blur-sm shadow-sm py-4 px-3 overflow-y-auto overscroll-contain">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-1 px-3">Danh mục</h3>
                    {(categories as Category[]).map((item: Category) => (
                        <button
                            key={item.code}
                            onClick={() => scrollToSection(item.code)}
                            className="px-3 py-2 rounded-lg text-left text-sm text-primary font-semibold transition-all hover:bg-primary hover:text-white hover:shadow-sm hover:translate-x-0.5 active:scale-95"
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Content Section - Right */}
            <div className="flex-1 px-6 py-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {(categories as Category[]).map((category: Category) => {
                        const categoryProducts = getProductsByCategory(category.id);
                        return (
                            <div
                                key={category.code}
                                id={category.code}
                                ref={(el) => {
                                    if (el) sectionRefs.current[category.code] = el;
                                }}
                                className="bg-white rounded-xl shadow-md overflow-hidden border border-secondary/20 scroll-mt-20"
                            >
                                {/* Tiêu đề danh mục */}
                                <div className="bg-[var(--cf-dark)] px-5 py-4 shadow-sm">
                                    <h2 className="text-2xl font-black text-white mb-1 drop-shadow-sm">
                                        {category.name}
                                    </h2>
                                    <p className="text-white/95 font-medium text-sm">{category.description}</p>
                                </div>

                                {/* Bảng sản phẩm */}
                                <div className="overflow-hidden">
                                    {categoryProducts.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-secondary sticky top-0 z-10 shadow-sm">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider w-20">
                                                            Hình ảnh
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                                                            Tên sản phẩm
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                                                            Mô tả
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider w-32">
                                                            Giá
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-xs font-black text-white uppercase tracking-wider w-28">
                                                            Mua
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-secondary/10">
                                                    {categoryProducts.map((product: Product, index: number) => (
                                                        <tr
                                                            key={product.id}
                                                            className="hover:bg-background-light/60 transition-colors cursor-pointer group"
                                                        >
                                                            {/* Hình ảnh */}
                                                            <td className="px-4 py-3">
                                                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-background-light shadow-sm group-hover:shadow-md transition-shadow">
                                                                    {product.image_url ? (
                                                                        <img
                                                                            src={product.image_url}
                                                                            alt={product.name}
                                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-secondary">
                                                                            <span className="material-icons-outlined text-xl">image</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* Tên sản phẩm */}
                                                            <td className="px-4 py-3">
                                                                <div className="font-bold text-primary text-sm group-hover:text-[var(--cf-dark)] transition-colors">
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-xs text-primary/50 mt-0.5">
                                                                    SKU: {product.SKU}
                                                                </div>
                                                            </td>

                                                            {/* Mô tả */}
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm text-primary/80 line-clamp-2 max-w-md leading-relaxed">
                                                                    {product.description}
                                                                </p>
                                                            </td>

                                                            {/* Giá */}
                                                            <td className="px-4 py-3">
                                                                <div className="font-bold text-primary text-sm">
                                                                    {product.min_price.toLocaleString('vi-VN')} ₫
                                                                </div>
                                                                {product.min_price !== product.max_price && (
                                                                    <div className="text-xs text-primary/60 mt-0.5">
                                                                        đến {product.max_price.toLocaleString('vi-VN')} ₫
                                                                    </div>
                                                                )}
                                                            </td>

                                                            {/* Hành động */}
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        onClick={(e) => handleAddToCart(product, e)}
                                                                        className="group/btn relative px-4 py-2.5 bg-gradient-to-r from-[var(--cf-accent-light)] to-[var(--cf-secondary)] text-[var(--cf-dark)] text-xs font-bold rounded-lg hover:from-[var(--cf-secondary)] hover:to-[var(--cf-dark)] hover:text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95 overflow-hidden"
                                                                        title="Thêm vào giỏ hàng"
                                                                    >
                                                                        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                                                                        <span className="relative z-10">Thêm vào giỏ hàng</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="px-6 py-10 text-center">
                                            <span className="material-icons-outlined text-4xl text-secondary/30 mb-2">KHO</span>
                                            <p className="text-primary/50 text-base">
                                                Chưa có sản phẩm trong danh mục này
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default MenuPage