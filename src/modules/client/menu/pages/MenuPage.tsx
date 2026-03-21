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
        [categories, getProductByCategory]);
    const { activeCategory, scrollToSection, setSectionRef } = useScrollSpy(categories, validCount);
    const { search, filteredProducts, showSearchResults, handleSearchChange, handleKeyDown } = useProductSearch(products);

    return (
        <div className="min-h-screen bg-[var(--cf-bg)]">
            <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 pb-10 pt-6 md:px-8 lg:gap-10 lg:px-10">
                <aside className="sticky top-[72px] hidden h-[calc(100vh-84px)] w-80 shrink-0 overflow-hidden rounded-[28px] border border-[var(--cf-primary)]/15 bg-[linear-gradient(160deg,var(--cf-surface),#ffffff)] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.08)] lg:flex lg:flex-col">
                    <div className="mb-6 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cf-secondary)]/80">
                            Bộ sưu tập chọn lọc
                        </p>
                        <h3 className="text-3xl font-black leading-tight text-[var(--cf-dark)]">
                            Danh mục
                        </h3>
                    </div>

                    {/* <div className="mb-6 rounded-2xl border border-[var(--cf-primary)]/10 bg-[var(--cf-bg)]/80 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--cf-secondary)]">Tổng số danh mục</p>
                        <p className="mt-1 text-2xl font-black text-[var(--cf-primary)]">{validCount}</p>
                    </div> */}

                    <div className="scrollbar-hide flex-1 overflow-y-auto">
                        {(categories as CategoryResponse[]).map((item: CategoryResponse) => {
                            const categoryProducts = getProductByCategory(item.category_id);

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
                </aside>

                <section className="flex min-w-0 flex-1 flex-col gap-8">
                    <div className="relative overflow-hidden rounded-[32px] border border-[var(--cf-primary)]/15 bg-[linear-gradient(145deg,#fdf8f1_0%,#f7efe3_58%,#f3e7d8_100%)] p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)] md:p-10">
                        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--cf-accent-light)]/35 blur-3xl"></div>
                        <div className="pointer-events-none absolute -bottom-24 left-24 h-72 w-72 rounded-full bg-[var(--cf-primary)]/10 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col gap-8">
                            <div className="flex flex-col gap-5 md:max-w-3xl">
                                <p className="w-fit rounded-full border border-[var(--cf-primary)]/20 bg-white/65 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cf-primary)]">
                                    Không gian thưởng thức hiện đại
                                </p>
                                <h1 className="text-4xl font-black leading-[1.35] text-[var(--cf-dark)] md:text-6xl"> 
                                    Thực đơn tuyển chọn
                                    
                                    <span className="block text-2xl font-semibold italic text-[var(--cf-secondary)] md:text-4xl">
                                        Tinh túy cho mọi cảm hứng
                                    </span>
                                </h1>
                                <p className="max-w-2xl text-base leading-relaxed text-[var(--cf-secondary)] md:text-lg">
                                    Khám phá bộ sưu tập đồ uống và món ăn được chọn lọc kỹ, nơi mỗi sản phẩm đều
                                    được thiết kế để tạo ra trải nghiệm vị giác cao cấp và đồng nhất.
                                </p>
                            </div>

                            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/50 bg-white/70 px-5 py-4 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--cf-secondary)]">Danh mục</p>
                                    <p className="mt-2 text-3xl font-black text-[var(--cf-primary)]">{validCount}</p>
                                </div>
                                <div className="rounded-2xl border border-white/50 bg-white/70 px-5 py-4 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--cf-secondary)]">Tổng sản phẩm</p>
                                    <p className="mt-2 text-3xl font-black text-[var(--cf-primary)]">{products.length}</p>
                                </div>
                                <div className="rounded-2xl border border-white/50 bg-white/70 px-5 py-4 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--cf-secondary)]">Chi nhánh</p>
                                    <p className="mt-2 truncate text-xl font-black text-[var(--cf-primary)]">
                                        {franchises.find((franchise) => franchise.id === franchiseId)?.name || "--"}
                                    </p>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    <div className="lg:hidden sticky top-[64px] z-20 -mx-4 border-y border-[var(--cf-secondary)]/10 bg-[var(--cf-bg)]/90 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
                        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
                            {categories
                                .filter(cat => getProductByCategory(cat.category_id).length > 0)
                                .map(cat => (
                                    <button
                                        key={cat.category_code}
                                        onClick={() => scrollToSection(cat.category_code)}
                                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all
                                        ${activeCategory === cat.category_code
                                                ? "bg-[var(--cf-primary)] text-white shadow-md"
                                                : "border border-[var(--cf-secondary)]/20 bg-white/80 text-[var(--cf-secondary)]"
                                            }`}
                                    >
                                        {cat.category_name}
                                    </button>
                                ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-[28px] border border-[var(--cf-secondary)]/15 bg-white/70 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur-sm md:grid-cols-[1fr_1.2fr] md:gap-6 md:p-6">
                        <div className="flex flex-col justify-center gap-2">
                            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cf-secondary)]">
                                <span className="material-icons-outlined text-base text-[var(--cf-primary)]">search</span>
                                Tìm kiếm sản phẩm
                            </label>
                            <input
                                type="text"
                                placeholder="Nhập tên sản phẩm..."
                                value={search}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                className="h-14 w-full rounded-2xl border border-[var(--cf-secondary)]/25 bg-white px-5 text-[var(--cf-dark)] shadow-sm transition-all placeholder:text-[var(--cf-secondary)]/80 focus:border-[var(--cf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/20"
                            />
                        </div>

                        <div className="flex flex-col justify-center gap-2">
                            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cf-secondary)]">
                                <span className="material-icons-outlined text-base text-[var(--cf-primary)]">storefront</span>
                                Chọn chi nhánh
                            </label>
                            <select
                                value={franchiseId}
                                onChange={(e) => setFranchiseId(e.target.value)}
                                className="h-14 cursor-pointer rounded-2xl border border-[var(--cf-secondary)]/25 bg-white px-5 text-[var(--cf-dark)] shadow-sm transition-all focus:border-[var(--cf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/20"
                            >
                                {franchises.map((franchise: FranchiseResponse) => (
                                    <option key={franchise.id} value={franchise.id}>
                                        {franchise.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {showSearchResults && (
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
                    )}

                    {!showSearchResults && (
                        (categories as CategoryResponse[]).map((category: CategoryResponse) => {
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
                    )}
                </section>
            </div>
        </div>
    );
}

export default MenuPage