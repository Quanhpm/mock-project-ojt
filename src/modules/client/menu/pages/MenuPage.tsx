import { useMemo } from "react"
import { type FranchiseResponse, type CategoryResponse, type MenuProduct } from "@/apis/endpointsCLIENT/client.api";
import ProductCard from "../components/ProductCard";
import { CategorySideBar } from "../components/CategorySideBar";
import { useMenuData, useProductSearch, useScrollSpy, useStore } from "../hooks";

function MenuPage() {
    const { franchiseId, setFranchiseId } = useStore();
    const { franchises, categories, products, getProductByCategory } = useMenuData();
    const validCount = useMemo(() =>
        categories.filter(cat => getProductByCategory(cat.category_id).length > 0).length,
        [categories, products]);
    const { activeCategory, scrollToSection, sectionRefs, setSectionRef } = useScrollSpy(categories, validCount);
    const { search, filteredProducts, showSearchResults, handleSearchChange, handleKeyDown } = useProductSearch(products);

    return (
        <div className="min-h-screen bg-[var(--cf-bg)] flex gap-8">
            {/* Sidebar Navigation - Sticky & Prominent */}
            <aside className="w-80 shrink-0 hidden lg:block sticky top-[64px] h-[calc(100vh-60px)] overflow-y-auto scrollbar-hide">
                <div className="bg-[var(--cf-surface)] shadow-xl border border-[var(--cf-primary)]/10 p-8 backdrop-blur-sm">
                    <div className="flex flex-col gap-5">
                        <div className="mb-6">
                            <h3 className="text-3xl font-black uppercase tracking-wide text-[var(--cf-dark)] mb-3">Danh mục</h3>
                            <div className="h-1.5 w-20 bg-gradient-to-r from-[var(--cf-primary)] to-[var(--cf-accent-light)] rounded-full"></div>
                        </div>
                        <div className="flex flex-col overflow-y-auto h-full scrollbar-hide">
                            {(categories as CategoryResponse[]).map((item: CategoryResponse) => {
                                const categoryProducts = getProductByCategory(item.category_id); // category -> item

                                if (!categoryProducts || categoryProducts.length === 0) return null;

                                return (
                                    <CategorySideBar
                                        key={item.category_code}
                                        item={item}
                                        activeCategory={activeCategory === item.category_code}
                                        onClick={scrollToSection}
                                    />
                                );
                            })}
                        </div>
                    </div>


                </div>
            </aside >

            {/* Menu Content Area */}
            < section className="flex-1 flex flex-col gap-12 px-4 md:px-10 py-8" >
                {/* Hero Info */}
                <div className="flex flex-col gap-4 max-w-2xl" >
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--cf-dark)]">Thực đơn của chúng tôi</h1>
                    <p className="text-[var(--cf-secondary)] text-lg leading-relaxed">
                        Khám phá bộ sưu tập sản phẩm cao cấp của chúng tôi. Sự xuất sắc được chế tác thủ công trong từng món.
                    </p>
                </div >

                {/* category mobile */}
                <div className="lg:hidden sticky top-[64px] z-10 bg-[var(--cf-bg)] py-3 -mx-4 px-4 md:-mx-10 md:px-10 border-b border-[var(--cf-secondary)]/10">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {categories
                            .filter(cat => getProductByCategory(cat.category_id).length > 0)
                            .map(cat => (
                                <button
                                    key={cat.category_code}
                                    onClick={() => scrollToSection(cat.category_code)}
                                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all
                                        ${activeCategory === cat.category_code
                                            ? 'bg-[var(--cf-primary)] text-white shadow-md'
                                            : 'bg-white/70 text-[var(--cf-secondary)] border border-[var(--cf-secondary)]/20'
                                        }`}
                                >
                                    {cat.category_name}
                                </button>
                            ))}
                    </div>
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
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
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
                {
                    showSearchResults && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[var(--cf-dark)] mb-4">
                                Kết quả tìm kiếm cho "{search}"
                            </h2>

                            {filteredProducts.length === 0 ? (
                                <p className="text-[var(--cf-secondary)] text-base">
                                    Không tìm thấy sản phẩm phù hợp
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredProducts.map((product: MenuProduct) => (
                                        <ProductCard
                                            key={product.product_id}
                                            product={product}
                                            franchiseId={franchiseId}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Category Sections */}
                {
                    !showSearchResults && (
                        (categories as CategoryResponse[]).map((category: CategoryResponse) => {
                            const categoryProducts = getProductByCategory(category.category_id);

                            // Early return null nếu không có sản phẩm
                            if (!categoryProducts || categoryProducts.length === 0) return null;

                            return (
                                <div
                                    key={category.category_code}
                                    id={category.category_code}
                                    ref={(el) => setSectionRef(category.category_code, el)}
                                    className="flex flex-col gap-6 scroll-mt-20"
                                >
                                    {/* Category Header */}
                                    <div className="border-b border-[var(--cf-secondary)]/20 pb-4">
                                        <h2 className="text-2xl font-bold text-[var(--cf-dark)]">
                                            {category.category_name}
                                        </h2>
                                    </div>

                                    {/* Product List */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {categoryProducts.map((product: MenuProduct) => (
                                            <ProductCard
                                                key={product.product_id}
                                                product={product}
                                                franchiseId={franchiseId}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )
                }
            </section >

        </div >
    );
}

export default MenuPage