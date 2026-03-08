import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductFranchiseHeader, ProductFranchiseCard, CategoryFranchiseSidebar } from '../components/index.ts';
import { useProductFranchiseList } from '../hooks/useProductFranchiseList.hook.ts';
import { useCategoryFranchiseList } from '../hooks/useCategoryFranchiseList.hook.ts';
import type { EnrichedCategoryFranchiseItem } from '../hooks/useCategoryFranchiseList.hook.ts';
import { franchiseApi } from '@/apis/endpoints/franchise.api';
import { addProductToCategoryFranchise, searchProductCategoryFranchises } from '@/apis/endpoints/product-category-franchise.api';
import { useToast } from '@/hooks/use-toast.hook';
import CategoryCreateDrawer from '@/modules/admin/category-management/components/CategoryCreateDrawer';

export const ProductFranchisePage: React.FC = () => {
    const { franchiseId } = useParams<{ franchiseId: string }>();
    const { success: showSuccess, error: showError } = useToast();

    const [franchiseName, setFranchiseName] = useState('');
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

    // ── Fetch franchise name for header ──────────────────────────────
    useEffect(() => {
        if (!franchiseId) return;
        franchiseApi.getFranchiseById(franchiseId).then((franchise) => {
            if (franchise?.name) setFranchiseName(franchise.name);
        });
    }, [franchiseId]);

    // ── Data hooks ───────────────────────────────────────────────────
    const {
        products,
        isLoading: productsLoading,
        searchQuery,
        setSearchQuery,
        refetch: refetchProducts,
    } = useProductFranchiseList({ franchiseId: franchiseId || '' });

    const {
        categories,
        isLoading: categoriesLoading,
        refetch: refetchCategories,
    } = useCategoryFranchiseList({ franchiseId: franchiseId || '' });

    // ── Interaction state ─────────────────────────────────────────────
    const [selectedCategoryFranchise, setSelectedCategoryFranchise] =
        useState<EnrichedCategoryFranchiseItem | null>(null);

    const [selectedProductFranchiseId, setSelectedProductFranchiseId] =
        useState<string | null>(null);

    const [isAssigning, setIsAssigning] = useState(false);

    // ── Category Tab state + filtering ───────────────────────────────
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
    /**
     * When a category tab is selected, call searchProductCategoryFranchises
     * to get which product-franchise IDs belong to that category.
     * null = "All" tab (no filter), Set = filtered IDs.
     */
    const [categoryTabProductIds, setCategoryTabProductIds] = useState<Set<string> | null>(null);
    const [isCategoryTabLoading, setIsCategoryTabLoading] = useState(false);

    useEffect(() => {
        if (selectedCategoryTab === 'all') {
            setCategoryTabProductIds(null);
            return;
        }

        setIsCategoryTabLoading(true);
        searchProductCategoryFranchises({
            searchCondition: {
                franchise_id: franchiseId,
                category_id: selectedCategoryTab,
                is_deleted: false,
            },
            pageInfo: { pageNum: 1, pageSize: 200 },
        })
            .then((response) => {
                const ids = new Set(
                    (response?.data ?? []).map((item) => item.product_franchise_id)
                );
                setCategoryTabProductIds(ids);
            })
            .catch(() => setCategoryTabProductIds(new Set()))
            .finally(() => setIsCategoryTabLoading(false));
    }, [selectedCategoryTab, franchiseId]);

    // ── Derived flags ─────────────────────────────────────────────────
    const categorySelected = selectedCategoryFranchise !== null;
    const canAssign = categorySelected && selectedProductFranchiseId !== null;

    const handleSelectCategory = (cat: EnrichedCategoryFranchiseItem | null) => {
        setSelectedCategoryFranchise(cat);
        setSelectedProductFranchiseId(null);
    };

    const handleSelectProduct = (productFranchiseId: string) => {
        setSelectedProductFranchiseId((prev) =>
            prev === productFranchiseId ? null : productFranchiseId
        );
    };

    // ── Assign action ─────────────────────────────────────────────────
    const handleAssign = async () => {
        if (!canAssign || !selectedCategoryFranchise || !selectedProductFranchiseId) return;

        setIsAssigning(true);
        try {
            await addProductToCategoryFranchise({
                category_franchise_id: selectedCategoryFranchise.id,
                product_franchise_id: selectedProductFranchiseId,
                display_order: selectedCategoryFranchise.display_order,
            });
            showSuccess('Thành công', 'Đã gán product vào category.');
            setSelectedCategoryFranchise(null);
            setSelectedProductFranchiseId(null);
            // Re-trigger category tab filter to reflect new assignment
            if (selectedCategoryTab !== 'all') {
                setSelectedCategoryTab((prev) => prev); // triggers useEffect
            }
            refetchProducts();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Gán thất bại. Vui lòng thử lại.';
            showError('Lỗi', msg);
        } finally {
            setIsAssigning(false);
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────
    const filteredProducts = useMemo(() => {
        let result = products;

        // 1. Filter by category tab (from searchProductCategoryFranchises)
        if (categoryTabProductIds !== null) {
            result = result.filter((p) => categoryTabProductIds.has(p.id));
        }

        // 2. Filter by search query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    (p.product?.name ?? p.product_id).toLowerCase().includes(q) ||
                    p.size.toLowerCase().includes(q)
            );
        }

        return result;
    }, [products, categoryTabProductIds, searchQuery]);

    // ── Category tabs ─────────────────────────────────────────────────
    const categoryTabs = useMemo(() => {
        const allTab = { id: 'all', name: '🏷️ All' };
        const tabs = categories.map((cat) => ({
            id: cat.category_id,
            name: cat.category?.name ?? cat.category_id,
        }));
        return [allTab, ...tabs];
    }, [categories]);

    const isGridLoading = productsLoading || isCategoryTabLoading;

    return (
        <main className="flex-1 flex overflow-hidden bg-gray-50 rounded-2xl border border-gray-200 shadow-sm" style={{ height: 'calc(100vh - 48px)' }}>
            {/* ── Main Section ──────────────────────────────────────────── */}
            <section className="flex-1 flex flex-col overflow-hidden relative border-r border-gray-100">
                <ProductFranchiseHeader
                    franchiseName={franchiseName}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Category Tabs */}
                <div className="flex items-center gap-3 overflow-x-auto hide-scroll pb-2 pt-2 px-6">
                    {categoryTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedCategoryTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-md border text-sm font-bold whitespace-nowrap transition-transform active:scale-95 ${selectedCategoryTab === tab.id
                                ? 'bg-amber-700 text-white border-amber-700'
                                : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-amber-700 border-gray-200'
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid — overlay when no category selected on "all" tab */}
                <div className="flex-1 overflow-y-auto p-6 pt-2 relative">
                    {!categorySelected && selectedCategoryTab === 'all' && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-[1px]">
                            <div className="bg-white rounded-2xl px-8 py-6 shadow-lg border border-amber-200 text-center max-w-xs">

                                <p className="text-sm font-bold text-amber-800">Chọn một Category</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Vui lòng chọn category ở sidebar trước khi chọn product.
                                </p>
                            </div>
                        </div>
                    )}

                    {isGridLoading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                            <p>Loading products...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((item) => (
                                    <ProductFranchiseCard
                                        key={item.id}
                                        item={item}
                                        disabled={!categorySelected && selectedCategoryTab === 'all'}
                                        isSelected={selectedProductFranchiseId === item.id}
                                        isDimmed={
                                            selectedProductFranchiseId !== null &&
                                            selectedProductFranchiseId !== item.id
                                        }
                                        onSelect={handleSelectProduct}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full flex items-center justify-center py-12 text-gray-400">
                                    <p>
                                        {selectedCategoryTab === 'all'
                                            ? 'No products found'
                                            : 'No products in this category yet'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Category Franchise Sidebar ────────────────────────────── */}
            {selectedCategoryTab === 'all' && (
                <CategoryFranchiseSidebar
                    categories={categories}
                    isLoading={categoriesLoading}
                    selectedCategory={selectedCategoryFranchise}
                    onSelectCategory={handleSelectCategory}
                    canAssign={canAssign}
                    isAssigning={isAssigning}
                    onAssign={handleAssign}
                    onAddCategory={() => setIsAddCategoryOpen(true)}
                />
            )}

            {/* ── Add Category Drawer ───────────────────────────────────── */}
            <CategoryCreateDrawer
                isOpen={isAddCategoryOpen}
                onClose={() => setIsAddCategoryOpen(false)}
                onSuccess={() => {
                    setIsAddCategoryOpen(false);
                    refetchCategories();
                }}
                franchiseId={franchiseId}
            />
        </main>
    );
};

export default ProductFranchisePage;
