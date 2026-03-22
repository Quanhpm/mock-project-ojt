import React, { useEffect, useMemo, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { useParams } from 'react-router-dom';
import {
    CategoryFranchiseSidebar,
    ProductFranchiseCategoryTabs,
    ProductFranchiseDragOverlay,
    ProductFranchiseHeader,
    ProductFranchiseTable,
} from '../components/index.ts';
import { useProductFranchiseList } from '../hooks/useProductFranchiseList.hook.ts';
import { useCategoryFranchiseList } from '../hooks/useCategoryFranchiseList.hook.ts';
import { useProductCategoryAssignments } from '../hooks/useProductCategoryAssignments.hook.ts';
import type { EnrichedProductFranchiseItem } from '../hooks/useProductFranchiseList.hook.ts';
import type { EnrichedCategoryFranchiseItem } from '../hooks/useCategoryFranchiseList.hook.ts';
import {
    ALL_CATEGORY_TAB_ID,
    buildCategoryItemCounts,
    buildCategoryTabs,
    filterProductFranchises,
    getCategoryLabel,
} from '../utils/productFranchise.utils.ts';
import { franchiseApi } from '@/apis/endpoints/franchise.api';
import { getProductFranchiseStatuses } from '@/apis/endpoints/product-franchise.api';
import {
    addProductToCategoryFranchise,
    deleteProductCategoryFranchise,
    restoreProductCategoryFranchise,
} from '@/apis/endpoints/product-category-franchise.api';
import { useToast } from '@/hooks/use-toast.hook';
import CategoryCreateDrawer from '@/modules/admin/category-management/components/CategoryCreateDrawer';

interface AssignmentCelebrationState {
    key: number;
    categoryId: string;
    productFranchiseId: string;
}

const DEFAULT_STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang hoạt động (Active)' },
    { value: 'inactive', label: 'Ngừng bán (Inactive)' },
];

const normalizeStatusOption = (raw: string | Record<string, unknown>): { value: string; label: string } | null => {
    if (typeof raw === 'string') {
        const normalized = raw.trim().toLowerCase();
        if (!normalized) return null;

        if (normalized.includes('active') || normalized === 'true') {
            return { value: 'active', label: 'Đang hoạt động (Active)' };
        }

        if (normalized.includes('inactive') || normalized === 'false') {
            return { value: 'inactive', label: 'Ngừng bán (Inactive)' };
        }

        return { value: normalized, label: raw };
    }

    const code = String(raw.code ?? raw.value ?? raw.status ?? '').trim();
    const label = String(raw.label ?? raw.name ?? raw.display_name ?? code).trim();
    const isActive = raw.is_active;

    if (typeof isActive === 'boolean') {
        return isActive
            ? { value: 'active', label: 'Đang hoạt động (Active)' }
            : { value: 'inactive', label: 'Ngừng bán (Inactive)' };
    }

    if (!code && !label) return null;

    const normalized = (code || label).toLowerCase();
    if (normalized.includes('active')) {
        return { value: 'active', label: 'Đang hoạt động (Active)' };
    }
    if (normalized.includes('inactive')) {
        return { value: 'inactive', label: 'Ngừng bán (Inactive)' };
    }

    return {
        value: normalized,
        label: label || code,
    };
};

export const ProductFranchisePage: React.FC = () => {
    const { franchiseId } = useParams<{ franchiseId: string }>();
    const { success: showSuccess, error: showError, warning: showWarning } = useToast();

    const [franchiseName, setFranchiseName] = useState('');
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedCategoryFranchise, setSelectedCategoryFranchise] =
        useState<EnrichedCategoryFranchiseItem | null>(null);
    const [selectedProductFranchiseId, setSelectedProductFranchiseId] =
        useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedCategoryTab, setSelectedCategoryTab] = useState(ALL_CATEGORY_TAB_ID);
    const [showDeletedInCategory, setShowDeletedInCategory] = useState(false);
    const [activeDraggedProduct, setActiveDraggedProduct] = useState<EnrichedProductFranchiseItem | null>(null);
    const [assignmentCelebration, setAssignmentCelebration] = useState<AssignmentCelebrationState | null>(null);
    const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string }>>(DEFAULT_STATUS_OPTIONS);
    const [isStatusLoading, setIsStatusLoading] = useState(false);
    const [statusLoadError, setStatusLoadError] = useState<string | null>(null);

    const {
        products,
        isLoading: productsLoading,
        searchQuery,
        setSearchQuery,
        appliedSearchQuery,
        setAppliedSearchQuery,
        sizeOptions,
        refetch: refetchProducts,
    } = useProductFranchiseList({ franchiseId: franchiseId || '' });

    const {
        categories,
        isLoading: categoriesLoading,
        refetch: refetchCategories,
    } = useCategoryFranchiseList({ franchiseId: franchiseId || '' });
    const {
        categoryTabItems,
        categoryAssignmentLookup,
        isCategoryTabLoading,
        refetch: refetchCategoryAssignments,
    } = useProductCategoryAssignments({
        franchiseId: franchiseId || '',
        selectedCategoryTab,
        showDeletedInCategory,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    useEffect(() => {
        if (!franchiseId) return;

        franchiseApi.getFranchiseById(franchiseId).then((franchise) => {
            if (franchise?.name) setFranchiseName(franchise.name);
        });
    }, [franchiseId]);

    useEffect(() => {
        let isMounted = true;

        const loadStatuses = async () => {
            setIsStatusLoading(true);
            setStatusLoadError(null);

            try {
                const statuses = await getProductFranchiseStatuses();
                if (!isMounted) return;

                const normalized = (statuses ?? [])
                    .map(normalizeStatusOption)
                    .filter((item): item is { value: string; label: string } => item !== null);

                const uniqueByValue = Array.from(new Map(normalized.map((item) => [item.value, item])).values());
                setStatusOptions([{ value: 'all', label: 'Tất cả trạng thái' }, ...uniqueByValue]);
            } catch (error) {
                if (!isMounted) return;
                console.error('Failed to load product-franchise statuses:', error);
                setStatusLoadError('Failed to load statuses');
                setStatusOptions(DEFAULT_STATUS_OPTIONS);
            } finally {
                if (isMounted) {
                    setIsStatusLoading(false);
                }
            }
        };

        void loadStatuses();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setAppliedSearchQuery(searchQuery.trim());
        }, 400);

        return () => {
            window.clearTimeout(timer);
        };
    }, [searchQuery, setAppliedSearchQuery]);

    useEffect(() => {
        setSelectedProductFranchiseId(null);
    }, [selectedCategoryTab]);

    useEffect(() => {
        if (selectedCategoryTab === ALL_CATEGORY_TAB_ID) {
            setShowDeletedInCategory(false);
        }
    }, [selectedCategoryTab]);

    useEffect(() => {
        if (!assignmentCelebration) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setAssignmentCelebration((current) =>
                current?.key === assignmentCelebration.key ? null : current,
            );
        }, 1400);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [assignmentCelebration]);

    const categoryItemCounts = useMemo(() => buildCategoryItemCounts(products), [products]);

    const categorySelected = selectedCategoryFranchise !== null;
    const canAssign =
        selectedCategoryTab === ALL_CATEGORY_TAB_ID &&
        categorySelected &&
        selectedProductFranchiseId !== null;
    const dragEnabled = selectedCategoryTab === ALL_CATEGORY_TAB_ID && !isAssigning;
    const selectedCategoryLabel = selectedCategoryFranchise
        ? getCategoryLabel(selectedCategoryFranchise)
        : null;

    const assignProductToCategory = async (
        productFranchiseId: string,
        category: EnrichedCategoryFranchiseItem,
        source: 'button' | 'drag',
    ) => {
        const targetProduct = products.find((product) => product.product_franchise_id === productFranchiseId);
        const categoryLabel = getCategoryLabel(category);

        if (!targetProduct) {
            showError('Lỗi', 'Không tìm thấy product để gán.');
            return false;
        }

        if (targetProduct.categories.some((item) => item.category_id === category.category_id)) {
            showWarning(
                'Sản phẩm đã thuộc category này.',
                `${targetProduct.product_name} đã có trong ${categoryLabel}.`,
            );
            return false;
        }

        setIsAssigning(true);
        try {
            await addProductToCategoryFranchise({
                category_franchise_id: category.id,
                product_franchise_id: productFranchiseId,
                display_order: category.display_order,
            });

            await refetchProducts();
            refetchCategoryAssignments();
            setAssignmentCelebration({
                key: Date.now(),
                categoryId: category.category_id,
                productFranchiseId,
            });
            setSelectedCategoryFranchise(category);
            setSelectedProductFranchiseId(null);
            showSuccess(
                'Thành công',
                source === 'drag'
                    ? `Đã kéo ${targetProduct.product_name} vào ${categoryLabel}.`
                    : 'Đã gán product vào category.',
            );
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Gán thất bại. Vui lòng thử lại.';
            showError('Lỗi', msg);
            return false;
        } finally {
            setIsAssigning(false);
        }
    };

    const handleDeleteProductCategory = async (itemId: string) => {
        try {
            await deleteProductCategoryFranchise(itemId);
            await refetchProducts();
            refetchCategoryAssignments();
            showSuccess('Thành công', 'Đã xoá sản phẩm khỏi danh mục.');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể xoá sản phẩm khỏi danh mục.';
            showError('Lỗi', msg);
        }
    };

    const handleRestoreProductCategory = async (itemId: string) => {
        try {
            await restoreProductCategoryFranchise(itemId);
            await refetchProducts();
            refetchCategoryAssignments();
            showSuccess('Thành công', 'Đã khôi phục sản phẩm vào danh mục.');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể khôi phục sản phẩm.';
            showError('Lỗi', msg);
        }
    };

    const handleSelectCategory = (category: EnrichedCategoryFranchiseItem | null) => {
        setSelectedCategoryFranchise(category);
        setSelectedProductFranchiseId(null);
    };

    const handleSelectProduct = (productFranchiseId: string) => {
        setSelectedProductFranchiseId((previous) =>
            previous === productFranchiseId ? null : productFranchiseId,
        );
    };

    const handleAssign = async () => {
        if (!canAssign || !selectedCategoryFranchise || !selectedProductFranchiseId) return;

        await assignProductToCategory(
            selectedProductFranchiseId,
            selectedCategoryFranchise,
            'button',
        );
    };

    const handleDragStart = (event: DragStartEvent) => {
        const dragData = event.active.data.current;

        if (dragData?.type === 'product-franchise') {
            setActiveDraggedProduct(dragData.product as EnrichedProductFranchiseItem);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const dragData = event.active.data.current;
        const dropData = event.over?.data.current;

        setActiveDraggedProduct(null);

        if (!dragEnabled) return;
        if (dragData?.type !== 'product-franchise' || dropData?.type !== 'category-franchise') return;

        const droppedProduct = dragData.product as EnrichedProductFranchiseItem;
        const targetCategory = dropData.category as EnrichedCategoryFranchiseItem;

        void assignProductToCategory(droppedProduct.product_franchise_id, targetCategory, 'drag');
    };

    const filteredProducts = useMemo(() => {
        return filterProductFranchises({
            products,
            selectedCategoryTab,
            showDeletedInCategory,
            categoryTabItems,
            appliedSearchQuery,
            selectedSize,
            selectedStatus,
        });
    }, [
        appliedSearchQuery,
        categoryTabItems,
        products,
        selectedCategoryTab,
        selectedSize,
        selectedStatus,
        showDeletedInCategory,
    ]);

    const categoryTabs = useMemo(() => buildCategoryTabs(categories), [categories]);

    const selectedCategoryTabName = useMemo(
        () => categoryTabs.find((tab) => tab.id === selectedCategoryTab)?.name ?? null,
        [categoryTabs, selectedCategoryTab],
    );

    const isTableLoading =
        productsLoading || (selectedCategoryTab !== ALL_CATEGORY_TAB_ID && showDeletedInCategory && isCategoryTabLoading);

    return (
        <DndContext
            autoScroll={false}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDraggedProduct(null)}
        >
            <main
                className="flex flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm"
                style={{ height: 'calc(100vh - 48px)' }}
            >
                <section className="relative flex flex-1 flex-col overflow-hidden border-r border-gray-100">
                    <ProductFranchiseHeader
                        franchiseName={franchiseName}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSearchSubmit={() => setAppliedSearchQuery(searchQuery)}
                        selectedSize={selectedSize}
                        sizeOptions={sizeOptions}
                        onSizeChange={setSelectedSize}
                        selectedStatus={selectedStatus}
                        onStatusChange={setSelectedStatus}
                        statusOptions={statusOptions}
                        isStatusLoading={isStatusLoading}
                        statusLoadError={statusLoadError}
                    />

                    <ProductFranchiseCategoryTabs
                        tabs={categoryTabs}
                        selectedCategoryTab={selectedCategoryTab}
                        showDeletedInCategory={showDeletedInCategory}
                        onSelectCategoryTab={setSelectedCategoryTab}
                        onToggleShowDeleted={() => setShowDeletedInCategory((previous) => !previous)}
                    />

                    {selectedCategoryTab === ALL_CATEGORY_TAB_ID && !categorySelected && (
                        <div className="px-6 pt-2">
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                Chọn category để assign bằng click, hoặc kéo product và thả trực tiếp vào sidebar.
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden p-6 pt-2">
                        <ProductFranchiseTable
                            items={filteredProducts}
                            isLoading={isTableLoading}
                            selectedProductFranchiseId={selectedProductFranchiseId}
                            selectionDisabled={!categorySelected && selectedCategoryTab === ALL_CATEGORY_TAB_ID}
                            dragEnabled={dragEnabled}
                            selectedCategoryId={selectedCategoryFranchise?.category_id ?? null}
                            selectedCategoryName={
                                selectedCategoryTab === ALL_CATEGORY_TAB_ID
                                    ? selectedCategoryLabel
                                    : selectedCategoryTabName
                            }
                            showDeleteActions={selectedCategoryTab !== ALL_CATEGORY_TAB_ID}
                            showDeletedInCategory={showDeletedInCategory}
                            assignmentLookup={categoryTabItems}
                            categoryAssignmentLookup={categoryAssignmentLookup}
                            highlightedProductFranchiseId={assignmentCelebration?.productFranchiseId ?? null}
                            successAnimationKey={assignmentCelebration?.key ?? 0}
                            onSelect={handleSelectProduct}
                            onRemoveCategory={(itemId) => {
                                void handleDeleteProductCategory(itemId);
                            }}
                            onDelete={(itemId) => {
                                void handleDeleteProductCategory(itemId);
                            }}
                            onRestore={(itemId) => {
                                void handleRestoreProductCategory(itemId);
                            }}
                        />
                    </div>
                </section>

                <CategoryFranchiseSidebar
                    categories={categories}
                    categoryItemCounts={categoryItemCounts}
                    isLoading={categoriesLoading}
                    selectedCategory={selectedCategoryFranchise}
                    onSelectCategory={handleSelectCategory}
                    assignmentEnabled={dragEnabled}
                    activeDraggedProductName={activeDraggedProduct?.product_name ?? activeDraggedProduct?.product?.name ?? null}
                    highlightedCategoryId={assignmentCelebration?.categoryId ?? null}
                    successAnimationKey={assignmentCelebration?.key ?? 0}
                    canAssign={canAssign}
                    isAssigning={isAssigning}
                    onAssign={handleAssign}
                    onAddCategory={() => setIsAddCategoryOpen(true)}
                />

                <CategoryCreateDrawer
                    isOpen={isAddCategoryOpen}
                    onClose={() => setIsAddCategoryOpen(false)}
                    onSuccess={() => {
                        setIsAddCategoryOpen(false);
                        void refetchCategories();
                    }}
                    franchiseId={franchiseId}
                />
            </main>

            <DragOverlay>
                <ProductFranchiseDragOverlay product={activeDraggedProduct} />
            </DragOverlay>
        </DndContext>
    );
};

export default ProductFranchisePage;
