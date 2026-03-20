import React from 'react';
import type { ProductCategoryFranchiseItem } from '@/apis/endpoints/product-category-franchise.api';
import type { EnrichedProductFranchiseItem } from '../hooks/useProductFranchiseList.hook.ts';
import { useVirtualizedRows } from '../hooks/useVirtualizedRows.hook.ts';
import { ProductFranchiseTableRow } from './ProductFranchiseTableRow.tsx';

interface ProductFranchiseTableProps {
    items: EnrichedProductFranchiseItem[];
    isLoading: boolean;
    selectedProductFranchiseId: string | null;
    selectionDisabled: boolean;
    dragEnabled?: boolean;
    selectedCategoryId?: string | null;
    selectedCategoryName?: string | null;
    showDeleteActions: boolean;
    showDeletedInCategory: boolean;
    assignmentLookup?: Map<string, ProductCategoryFranchiseItem> | null;
    categoryAssignmentLookup?: Map<string, ProductCategoryFranchiseItem> | null;
    highlightedProductFranchiseId?: string | null;
    successAnimationKey?: number;
    onSelect: (productFranchiseId: string) => void;
    onRemoveCategory?: (itemId: string) => void;
    onDelete?: (itemId: string) => void;
    onRestore?: (itemId: string) => void;
}

const TABLE_GRID_TEMPLATE =
    'minmax(320px, 2.8fr) minmax(120px, 1fr) minmax(110px, 0.75fr) minmax(140px, 0.9fr) minmax(240px, 1.6fr) minmax(120px, 0.8fr) minmax(150px, 1fr)';
const TABLE_MIN_WIDTH_CLASS = 'min-w-[1240px]';
const ROW_HEIGHT = 112;
const OVERSCAN = 8;

const tableHeaders = [
    'Product',
    'SKU',
    'Size',
    'Price',
    'Categories',
    'Status',
    'Action',
];

const LoadingRows = () =>
    Array.from({ length: 6 }).map((_, index) => (
        <div
            key={index}
            style={{ height: ROW_HEIGHT, gridTemplateColumns: TABLE_GRID_TEMPLATE }}
            className="grid border-b border-gray-100"
        >
            <div className="col-span-7 flex items-center gap-4 px-4 py-4">
                <div className="h-14 w-14 animate-pulse rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-gray-100" />
                </div>
            </div>
        </div>
    ));

export const ProductFranchiseTable: React.FC<ProductFranchiseTableProps> = ({
    items,
    isLoading,
    selectedProductFranchiseId,
    selectionDisabled,
    dragEnabled = false,
    selectedCategoryId,
    selectedCategoryName,
    showDeleteActions,
    showDeletedInCategory,
    assignmentLookup,
    categoryAssignmentLookup,
    highlightedProductFranchiseId,
    successAnimationKey = 0,
    onSelect,
    onRemoveCategory,
    onDelete,
    onRestore,
}) => {
    const {
        containerRef,
        onScroll,
        startIndex,
        endIndex,
        paddingTop,
        paddingBottom,
    } = useVirtualizedRows({
        itemCount: items.length,
        rowHeight: ROW_HEIGHT,
        overscan: OVERSCAN,
    });

    const visibleItems = items.slice(startIndex, endIndex);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div
                ref={containerRef}
                onScroll={onScroll}
                className="flex-1 overflow-auto"
            >
                <div className={TABLE_MIN_WIDTH_CLASS}>
                    <div
                        role="row"
                        style={{ gridTemplateColumns: TABLE_GRID_TEMPLATE }}
                        className="sticky top-0 z-10 grid border-b border-gray-200 bg-gray-50"
                    >
                        {tableHeaders.map((header, index) => (
                            <div
                                key={header}
                                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${index === tableHeaders.length - 1 ? 'text-center' : ''}`}
                            >
                                {header}
                            </div>
                        ))}
                    </div>

                    {isLoading ? (
                        <LoadingRows />
                    ) : items.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <div className="mx-auto max-w-sm text-sm text-gray-500">
                                {showDeleteActions
                                    ? showDeletedInCategory
                                        ? 'Không có sản phẩm đã xoá trong danh mục này.'
                                        : 'Danh mục này chưa có sản phẩm nào.'
                                    : 'Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.'}
                            </div>
                        </div>
                    ) : (
                        <div role="rowgroup">
                            {paddingTop > 0 && <div style={{ height: paddingTop }} />}

                            {visibleItems.map((item) => (
                                <ProductFranchiseTableRow
                                    key={item.product_franchise_id || item.id}
                                    item={item}
                                    selectedProductFranchiseId={selectedProductFranchiseId}
                                    selectionDisabled={selectionDisabled}
                                    dragEnabled={dragEnabled}
                                    selectedCategoryId={selectedCategoryId}
                                    selectedCategoryName={selectedCategoryName}
                                    showDeleteActions={showDeleteActions}
                                    showDeletedInCategory={showDeletedInCategory}
                                    assignmentLookup={assignmentLookup}
                                    categoryAssignmentLookup={categoryAssignmentLookup}
                                    highlightedProductFranchiseId={highlightedProductFranchiseId}
                                    successAnimationKey={successAnimationKey}
                                    gridTemplateColumns={TABLE_GRID_TEMPLATE}
                                    rowHeight={ROW_HEIGHT}
                                    onSelect={onSelect}
                                    onRemoveCategory={onRemoveCategory}
                                    onDelete={onDelete}
                                    onRestore={onRestore}
                                />
                            ))}

                            {paddingBottom > 0 && <div style={{ height: paddingBottom }} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductFranchiseTable;
