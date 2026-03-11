import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductFranchiseHeader, ProductFranchiseCard, CategoryFranchiseSidebar } from '../components/index.ts';
import { useProductFranchiseList } from '../hooks/useProductFranchiseList.hook.ts';
import { useCategoryFranchiseList } from '../hooks/useCategoryFranchiseList.hook.ts';
import type { EnrichedCategoryFranchiseItem } from '../hooks/useCategoryFranchiseList.hook.ts';
import { franchiseApi } from '@/apis/endpoints/franchise.api';
import {
    addProductToCategoryFranchise,
    searchProductCategoryFranchises,
    deleteProductCategoryFranchise,
    restoreProductCategoryFranchise,
    type ProductCategoryFranchiseItem
} from '@/apis/endpoints/product-category-franchise.api';
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
        appliedSearchQuery,
        setAppliedSearchQuery,
        refetch: refetchProducts,
    } = useProductFranchiseList({ franchiseId: franchiseId || '' });

    const [selectedSize, setSelectedSize] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const {
        categories,
        isLoading: categoriesLoading,
        refetch: refetchCategories,
    } = useCategoryFranchiseList({ franchiseId: franchiseId || '' });

    // ── Delete / Restore Action ───────────────────────────────────────
    const handleDeleteProductCategory = async (itemId: string) => {
        try {
            await deleteProductCategoryFranchise(itemId);
            showSuccess('Thành công', 'Đã xoá sản phẩm khỏi danh mục.');
            refetchCategoryProducts();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể xoá sản phẩm khỏi danh mục.';
            showError('Lỗi', msg);
        }
    };

    const handleRestoreProductCategory = async (itemId: string) => {
        try {
            await restoreProductCategoryFranchise(itemId);
            showSuccess('Thành công', 'Đã khôi phục sản phẩm vào danh mục.');
            refetchCategoryProducts();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể khôi phục sản phẩm.';
            showError('Lỗi', msg);
        }
    };

    // ── Interaction state ─────────────────────────────────────────────
    const [selectedCategoryFranchise, setSelectedCategoryFranchise] =
        useState<EnrichedCategoryFranchiseItem | null>(null);

    const [selectedProductFranchiseId, setSelectedProductFranchiseId] =
        useState<string | null>(null);

    const [isAssigning, setIsAssigning] = useState(false);

    // ── Category Tab state + filtering ───────────────────────────────
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
    /**
     * null = "All" tab (no filter), Map = filtered items keyed by product_franchise_id.
     */
    const [categoryTabItems, setCategoryTabItems] = useState<Map<string, ProductCategoryFranchiseItem> | null>(null);
    const [isCategoryTabLoading, setIsCategoryTabLoading] = useState(false);
    const [showDeletedInCategory, setShowDeletedInCategory] = useState(false);
    const [categoryDataRefreshKey, setCategoryDataRefreshKey] = useState(0);

    const refetchCategoryProducts = () => setCategoryDataRefreshKey((k) => k + 1);

    useEffect(() => {
        if (selectedCategoryTab === 'all') {
            setCategoryTabItems(null);
            setShowDeletedInCategory(false);
            return;
        }

        setIsCategoryTabLoading(true);
        searchProductCategoryFranchises({
            searchCondition: {
                franchise_id: franchiseId,
                category_id: selectedCategoryTab,
                is_deleted: showDeletedInCategory,
            },
            pageInfo: { pageNum: 1, pageSize: 200 },
        })
            .then((response) => {
                const map = new Map<string, ProductCategoryFranchiseItem>();
                (response?.data ?? []).forEach((item) => {
                    map.set(item.product_franchise_id, item);
                });
                setCategoryTabItems(map);
            })
            .catch(() => setCategoryTabItems(new Map()))
            .finally(() => setIsCategoryTabLoading(false));
    }, [selectedCategoryTab, franchiseId, showDeletedInCategory, categoryDataRefreshKey]);

    // ── Sidebar "Already Assigned" tracking (only for 'all' tab) ──────
    const [assignedSidebarProductIds, setAssignedSidebarProductIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (selectedCategoryTab !== 'all' || !selectedCategoryFranchise) {
            setAssignedSidebarProductIds(new Set());
            return;
        }

        searchProductCategoryFranchises({
            searchCondition: {
                franchise_id: franchiseId,
                category_id: selectedCategoryFranchise.category_id,
                is_deleted: false,
            },
            pageInfo: { pageNum: 1, pageSize: 200 },
        })
            .then((response) => {
                const ids = new Set(
                    (response?.data ?? []).map((item) => item.product_franchise_id)
                );
                setAssignedSidebarProductIds(ids);
            })
            .catch(() => setAssignedSidebarProductIds(new Set()));
    }, [selectedCategoryTab, selectedCategoryFranchise, franchiseId, categoryDataRefreshKey]);

    // ── Category Item Counts tracking ─────────────────────────────────
    const [categoryItemCounts, setCategoryItemCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!franchiseId) return;

        searchProductCategoryFranchises({
            searchCondition: {
                franchise_id: franchiseId,
                is_deleted: false,
            },
            pageInfo: { pageNum: 1, pageSize: 5000 },
        })
            .then((response) => {
                const counts: Record<string, number> = {};
                (response?.data ?? []).forEach((item) => {
                    const catId = item.category_franchise_id;
                    counts[catId] = (counts[catId] || 0) + 1;
                });
                setCategoryItemCounts(counts);
            })
            .catch(() => setCategoryItemCounts({}));
    }, [franchiseId, categoryDataRefreshKey]);

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
            } else {
                // If we are on 'all' tab, we want to refresh the assigned highlights
                refetchCategoryProducts();
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
        if (categoryTabItems !== null) {
            result = result.filter((p) => categoryTabItems.has(p.id));
        }

        // 2. Filter by applied search query
        if (appliedSearchQuery) {
            const q = appliedSearchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    (p.product?.name ?? p.product_id).toLowerCase().includes(q) ||
                    p.size.toLowerCase().includes(q)
            );
        }

        // 3. Filter by size
        if (selectedSize !== 'all') {
            result = result.filter((p) => p.size.toLowerCase() === selectedSize.toLowerCase());
        }

        // 4. Filter by status (is_active)
        if (selectedStatus !== 'all') {
            const isActive = selectedStatus === 'active';
            result = result.filter((p) => p.is_active === isActive);
        }

        return result;
    }, [products, categoryTabItems, appliedSearchQuery, selectedSize, selectedStatus]);

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
                    onSearchSubmit={() => setAppliedSearchQuery(searchQuery)}
                    selectedSize={selectedSize}
                    onSizeChange={setSelectedSize}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                />

                {/* Category Tabs */}
                <div className="flex items-center justify-between px-6 pt-2 pb-2">
                    <div className="flex items-center gap-3 overflow-x-auto hide-scroll pr-4">
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
                    {selectedCategoryTab !== 'all' && (
                        <div className="shrink-0 flex items-center">
                            <button
                                onClick={() => setShowDeletedInCategory(!showDeletedInCategory)}
                                className={`px-4 py-2 text-sm font-bold rounded-lg border flex items-center gap-2 transition-colors ${showDeletedInCategory
                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }`}
                                title="Lọc sản phẩm bị xoá khỏi danh mục"
                            >
                                {showDeletedInCategory ? 'Đang xem: Đã xoá' : 'Xem sản phẩm đã xoá'}
                            </button>
                        </div>
                    )}
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
                                filteredProducts.map((item) => {
                                    const categoryFranchiseItem = categoryTabItems?.get(item.id);
                                    const isAlreadyAssigned = selectedCategoryTab === 'all' && assignedSidebarProductIds.has(item.id);

                                    return (
                                        <ProductFranchiseCard
                                            key={item.id}
                                            item={item}
                                            disabled={!categorySelected && selectedCategoryTab === 'all'}
                                            isSelected={selectedProductFranchiseId === item.id}
                                            isDimmed={
                                                selectedProductFranchiseId !== null &&
                                                selectedProductFranchiseId !== item.id
                                            }
                                            isAlreadyAssigned={isAlreadyAssigned}
                                            onSelect={handleSelectProduct}
                                            showDelete={selectedCategoryTab !== 'all'}
                                            isDeleted={categoryFranchiseItem?.is_deleted}
                                            onDelete={categoryFranchiseItem ? () => handleDeleteProductCategory(categoryFranchiseItem.id) : undefined}
                                            onRestore={categoryFranchiseItem ? () => handleRestoreProductCategory(categoryFranchiseItem.id) : undefined}
                                        />
                                    );
                                })
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
                    categoryItemCounts={categoryItemCounts}
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
