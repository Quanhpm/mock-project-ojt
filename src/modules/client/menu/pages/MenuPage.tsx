import { useRef } from "react";
import Item from "../components/Item"
import categories from '@/mockdata/categories.json';
import products from '@/mockdata/products.json';

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
    min_price: number;
    max_price: number;
    is_active: boolean;
    is_deleted: boolean;
}

// Mapping product_id -> category_id (dựa vào dữ liệu hiện tại)
const PRODUCT_CATEGORY_MAP: { [key: number]: number } = {
    1: 1, // Espresso -> Cà phê
    2: 1, // Latte -> Cà phê
    3: 2, // Trà xanh -> Trà
    4: 3, // Bánh croissant -> Bánh ngọt
};

function MenuPage() {
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const scrollToSection = (code: string) => {
        const element = sectionRefs.current[code];
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    // Lọc product theo category_id dựa vào mapping
    const getProductsByCategory = (categoryId: number) => {
        return (products as any).products.filter(
            (product: Product) => {
                const productCategoryId = PRODUCT_CATEGORY_MAP[product.id];
                return productCategoryId === categoryId && product.is_active && !product.is_deleted;
            }
        );
    };

    return (
        <div className="min-h-screen bg-[var(--cf-bg)] flex w-screen">
            {/* Navigation - Sticky */}
            <nav className="fixed top-16 left-0 z-10 w-64 py-4">
                <div className="flex flex-col gap-4 px-4">
                    {(categories as any).categories.map((item: Category) => (
                        <button
                            key={item.code}
                            onClick={() => scrollToSection(item.code)}
                            className="px-4 py-2 rounded-lg whitespace-nowrap text-sm text-[var(--cf-primary)] font-medium transition-colors hover:bg-[var(--cf-secondary)] hover:text-white active:scale-95"
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Content Section - Right */}
            <div className="flex-1 ml-64 px-8 py-8 border-l border-gray-200">
                <div className="max-w-7xl mx-auto">
                    {(categories as any).categories.map((category: Category) => {
                        const categoryProducts = getProductsByCategory(category.id);
                        return (
                            <div
                                key={category.code}
                                ref={(el) => {
                                    if (el) sectionRefs.current[category.code] = el;
                                }}
                                className="mb-12 scroll-mt-20"
                            >
                                {/* Tiêu đề danh mục */}
                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold text-[var(--cf-primary)] mb-2">
                                        {category.name}
                                    </h2>
                                    <p className="text-gray-700">{category.description}</p>
                                </div>

                                {/* Lưới sản phẩm */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {categoryProducts.length > 0 ? (
                                        categoryProducts.map((product: Product) => (
                                            <Item
                                                key={product.id}
                                                id={product.id}
                                                name={product.name}
                                                price={product.min_price}
                                            />
                                        ))
                                    ) : (
                                        <p className="col-span-full text-center text-gray-500 py-8">
                                            None
                                        </p>
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