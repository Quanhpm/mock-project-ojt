import React, { useState } from 'react';
import { Search, ArrowLeft, Filter, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductFranchiseHeaderProps {
    franchiseName: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSearchSubmit: () => void;
    selectedSize: string;
    sizeOptions: string[];
    onSizeChange: (size: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
}

export const ProductFranchiseHeader: React.FC<ProductFranchiseHeaderProps> = ({
    franchiseName,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    selectedSize,
    sizeOptions,
    onSizeChange,
    selectedStatus,
    onStatusChange,
}) => {
    const navigate = useNavigate();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const availableSizes = Array.from(new Set(['all', ...sizeOptions]));

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearchSubmit();
            setIsFilterOpen(false);
        }
    };

    return (
        <div className="px-6 pt-6 pb-2 shrink-0 flex flex-col gap-4 bg-white">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/admin/franchises')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg border border-amber-700 transition-colors text-amber-800 font-semibold"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>

                    {/* Franchise Name */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 font-semibold text-sm">
                        <span>{franchiseName || 'Loading...'}</span>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-2 max-w-lg w-full relative">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all shadow-sm focus:bg-white"
                                placeholder="Nhập tên sản phẩm để tìm kiếm..."
                                type="text"
                            />
                        </div>
                        <button
                            onClick={() => {
                                onSearchSubmit();
                                setIsFilterOpen(false);
                            }}
                            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap active:bg-amber-900"
                        >
                            <span className="hidden sm:inline">Tìm kiếm</span>
                            <span className="sm:hidden"><Search size={18} /></span>
                        </button>
                        <div className="relative">
                            <button
                                title="Lọc nâng cao"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`p-2 border rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:ring-offset-1 ${isFilterOpen || selectedSize !== 'all' || selectedStatus !== 'all'
                                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-amber-700'
                                    }`}
                            >
                                <Filter size={20} />
                                {(selectedSize !== 'all' || selectedStatus !== 'all') && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {/* Filter Dropdown Popover */}
                            {isFilterOpen && (
                                <>
                                    {/* Backdrop to close when clicking outside */}
                                    <div
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={() => setIsFilterOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-800">Bộ lọc nâng cao</h3>
                                            <button
                                                onClick={() => setIsFilterOpen(false)}
                                                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Size Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                                    Kích cỡ (Size)
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableSizes.map((size) => (
                                                        <button
                                                            key={size}
                                                            onClick={() => onSizeChange(size)}
                                                            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${selectedSize === size
                                                                ? 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm'
                                                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {size === 'all' ? 'Tất cả' : size}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Status Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                                    Trạng thái hiển thị
                                                </label>
                                                <div className="flex flex-col gap-1.5">
                                                    {[
                                                        { id: 'all', label: 'Tất cả trạng thái' },
                                                        { id: 'active', label: 'Đang hoạt động (Active)' },
                                                        { id: 'inactive', label: 'Ngừng bán (Inactive)' },
                                                    ].map((status) => (
                                                        <button
                                                            key={status.id}
                                                            onClick={() => onStatusChange(status.id)}
                                                            className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${selectedStatus === status.id
                                                                ? 'bg-amber-50 text-amber-800 font-medium'
                                                                : 'hover:bg-gray-50 text-gray-700'
                                                                }`}
                                                        >
                                                            {status.label}
                                                            {selectedStatus === status.id && (
                                                                <Check size={16} className="text-amber-600" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    onSizeChange('all');
                                                    onStatusChange('all');
                                                }}
                                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Xóa bộ lọc
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onSearchSubmit();
                                                    setIsFilterOpen(false);
                                                }}
                                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-colors"
                                            >
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFranchiseHeader;
