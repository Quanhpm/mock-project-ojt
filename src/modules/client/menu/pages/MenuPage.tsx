import { useRef, useState, useEffect, useMemo } from "react";
import { getAllFranchises, getAllCategoriesByFranchise, getMenuByFranchise } from "@/apis/endpointsCLIENT/client.api";
import type { FranchiseResponse, CategoryResponse, MenuByFranchise, MenuProduct, ProductSize } from "@/apis/endpointsCLIENT/client.api";
import ProductCard from "../components/ProductCard";

function MenuPage() {
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [franchiseId, setFranchiseId] = useState<string>('');

    const [franchises, setFranchises] = useState<FranchiseResponse[]>([]);
    const fetchFranchises = async () => {
        try {
            const response = await getAllFranchises();
            setFranchises(response || []);
            setFranchiseId(response && response.length > 0 ? response[0].id : '');
        } catch (error) {
            console.error("Failed to fetch franchises:", error);
        }
    };

    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const fetchCategories = async (franchiseId: string) => {
        try {
            const response = await getAllCategoriesByFranchise(franchiseId);
            setCategories(response || []);
        }
        catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }

    const [products, setProducts] = useState<MenuByFranchise[]>([]);
    const fetchAllProducts = async (franchiseId: string) => {
        try {
            const response = await getMenuByFranchise(franchiseId, "");
            setProducts(response || []);
        }
        catch (error) {
            console.error("Failed to fetch products:", error);
        }
    }
    const getProductByCategory = (categoryId: string): MenuProduct[] => {
        const category = products.find(item => item.category_id === categoryId);
        return category ? category.products : [];
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchFranchises();
            await fetchCategories(franchiseId);
            await fetchAllProducts(franchiseId);
            console.log("Fetched products:", products);
            console.log("Categories:", categories);
        };
        fetchData();
    }, [franchiseId]);

    // const getCategoryIcon = (code: string): string => {
    //     const iconMap: { [key: string]: string } = {
    //         'COFFEE': 'local_cafe',
    //         'TEA': 'emoji_food_beverage',
    //         'BAKERY': 'bakery_dining',
    //         'SMOOTHIE': 'blender',
    //         'JUICE': 'local_bar',
    //     };
    //     return iconMap[code] || 'restaurant_menu';
    // };

    const scrollToSection = (code: string) => {
        const element = sectionRefs.current[code];
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    // Thêm hiệu ứng active cho sidebar khi cuộn đến section tương ứng
    useEffect(() => {
        setActiveCategory('');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveCategory(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-100px 0px -60% 0px",
                threshold: 0.1,
            }
        );

        Object.values(sectionRefs.current).forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, [franchiseId]);

    // Filter search
    const filterProductsBySearch = (searchTerm: string): MenuProduct[] => {
        return products.flatMap((category) =>
            category.products.filter((product) =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
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
                        {(categories as CategoryResponse[]).map((item: CategoryResponse) => (
                            <button
                                key={item.category_code}
                                onClick={() => scrollToSection(item.category_code)}
                                className={`group relative flex items-center gap-5 px-7 py-5 rounded-xl text-left text-lg font-bold text-[var(--cf-dark)] hover:text-white bg-gradient-to-r from-transparent to-transparent hover:from-[var(--cf-primary)] hover:to-[var(--cf-dark)] transition-all duration-300 shadow-sm hover: shadow-lg hover:scale-105 active:scale-100 border border-transparent hover:border-[var(--cf-primary)]/20 overflow-hidden
                                    ${activeCategory === item.category_code
                                        ? 'bg-[var(--cf-primary)] !text-white'
                                        : ''
                                    }
                                `}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--cf-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-full"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--cf-accent-light)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                {/* <span className={`material-icons-outlined text-3xl relative z-10 text-[var(--cf-primary)] group-hover:text-white transition-colors`}>{getCategoryIcon(item.franchise_code)}</span> */}
                                <span className="relative z-10 tracking-wide">{item.category_name}</span>
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

                <div className="flex flex-col md:flex-row gap-6 items-stretch mb-5">
                    {/* Search Bar */}
                    <div className="md:w-1/3 w-full flex flex-col justify-center">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--cf-dark)] mb-2 tracking-wide">
                            <span className="material-icons-outlined text-[18px] text-[var(--cf-secondary)]">
                                search
                            </span>
                            <span>Tìm kiếm</span>
                        </h3>
                        <input
                            type="text"
                            placeholder="Nhập tên sản phẩm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-14 px-5 rounded-xl bg-white/70 backdrop-blur-sm border border-[var(--cf-secondary)]/30 
                       text-[var(--cf-dark)] placeholder:text-[var(--cf-secondary)] 
                       focus:outline-none focus:border-[var(--cf-primary)] 
                       focus:ring-2 focus:ring-[var(--cf-primary)]/20 
                       shadow-sm transition-all"
                        />
                    </div>

                    {/* Franchise Selection */}
                    <div className="md:w-2/3 w-full flex flex-col justify-center">
                        <h3 className="text-sm font-semibold text-[var(--cf-dark)] mb-2 tracking-wide">
                            Chọn chi nhánh
                        </h3>
                        <select
                            value={franchiseId}
                            onChange={(e) => setFranchiseId(e.target.value)}
                            className="h-14 px-5 rounded-xl bg-white/70 backdrop-blur-sm border border-[var(--cf-secondary)]/30 
                       text-[var(--cf-dark)] 
                       focus:outline-none focus:border-[var(--cf-primary)] 
                       focus:ring-2 focus:ring-[var(--cf-primary)]/20 
                       shadow-sm transition-all cursor-pointer"
                        >
                            {franchises.map((franchise: FranchiseResponse) => (
                                <option key={franchise.id} value={franchise.id}>
                                    {franchise.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Product Sections */}
                {search.length > 0 && (() => {
                    const searching = filterProductsBySearch(search);
                    return (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[var(--cf-dark)] mb-4">
                                Kết quả tìm kiếm cho "{search}"
                            </h2>

                            {searching.length === 0 ? (
                                <p className="text-[var(--cf-secondary)] text-base">
                                    Không tìm thấy sản phẩm phù hợp
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4"> {/* Đã sửa gaep-4 thành gap-4 */}
                                    {searching.map((product: MenuProduct) => (
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
                })()}

                {/* Category Sections */}
                {search.length === 0 &&
                    (categories as CategoryResponse[]).map((category: CategoryResponse) => {
                        const categoryProducts = getProductByCategory(category.category_id);
                        return (
                            <div
                                key={category.category_code}
                                id={category.category_code}
                                ref={(el) => {
                                    if (el) sectionRefs.current[category.category_code] = el;
                                }}
                                className="flex flex-col gap-6 scroll-mt-20"
                            >
                                {/* Category Header */}
                                <div className="border-b border-[var(--cf-secondary)]/20 pb-4">
                                    <h2 className="text-2xl font-bold text-[var(--cf-dark)]">{category.category_name}</h2>
                                    {/* <p className="text-[var(--cf-secondary)] text-sm">{category.description}</p> */}
                                </div>

                                {/* Product List */}
                                <div className="grid grid-cols-1 gap-4">
                                    {categoryProducts.length > 0 ? (
                                        categoryProducts.map((product: MenuProduct) => (
                                            <ProductCard
                                                key={product.product_id}
                                                product={product}
                                                franchiseId={franchiseId}
                                            />
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