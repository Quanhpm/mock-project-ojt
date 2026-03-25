import { useState } from 'react';
import { Clock3, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { OrderData } from '../order.types';
import type { FilterOption } from '../order.types';
import { filterOptions, statusConfig } from '../order.config';
import { useOrders } from '../hooks/useOrders';
import {
  OrderDetailModal,
  OrderHero,
  OrderStatsCards,
  OrderListContainer,
  OrderPagination,
} from '../components';

const FILTER_ACTIVE_BASE_CLASS = 'bg-white border border-zinc-200 shadow-md';

const FILTER_ACTIVE_TEXT_CLASS_MAP: Record<FilterOption, string> = {
  all: 'text-primary',
  completed: statusConfig.COMPLETED.textColor,
  pending: statusConfig.PREPARING.textColor,
  cancelled: statusConfig.CANCELLED.textColor,
};

const FILTER_ACTIVE_HOVER_CLASS_MAP: Record<FilterOption, string> = {
  all: 'hover:text-primary hover:bg-primary/10',
  completed: 'hover:text-emerald-700 hover:bg-emerald-50',
  pending: 'hover:text-blue-700 hover:bg-blue-50',
  cancelled: 'hover:text-rose-700 hover:bg-rose-50',
};

const FILTER_INACTIVE_CLASS =
  'text-zinc-600 border border-transparent';

const FILTER_INACTIVE_HOVER_CLASS_MAP: Record<FilterOption, string> = {
  all: 'hover:text-primary hover:bg-primary/10',
  completed: 'hover:text-emerald-600 hover:bg-emerald-50',
  pending: 'hover:text-blue-600 hover:bg-blue-50',
  cancelled: 'hover:text-rose-600 hover:bg-rose-50',
};

function OrderHistoryPage() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState<{ x: number; y: number } | null>(null);

  const {
    orders,
    isLoading,
    errorMessage,
    stats,
    selectedFilter,
    currentPage,
    filteredOrders,
    paginatedOrders,
    totalPages,
    actions,
  } = useOrders();

  const handleViewDetail = (order: OrderData, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setTriggerPosition({ x, y });
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setTriggerPosition(null);
  };

  const currentFilterLabel = filterOptions.find((f) => f.value === selectedFilter)?.label || 'Gần nhất';

  if (isLoading) {
    return (
      <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-20 py-8 md:py-10 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
        <div className="h-40 rounded-2xl bg-zinc-200/70" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl bg-zinc-200/70" />
          ))}
        </div>
        <div className="h-14 w-80 rounded-xl bg-zinc-200/70" />
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-3">
          <div className="h-10 rounded-lg bg-zinc-200/70" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 rounded-lg bg-zinc-100" />
          ))}
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-20 py-8 md:py-10 max-w-7xl mx-auto w-full">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center space-y-4">
          <TriangleAlert className="size-12 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-rose-700">Đã xảy ra lỗi</h2>
          <p className="text-rose-600">{errorMessage}</p>
          <button
            onClick={actions.fetchOrders}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 hover:bg-primary/90"
          >
            Tải lại trang
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-20 py-8 md:py-10 max-w-7xl mx-auto w-full space-y-10 md:space-y-12">
      <OrderHero onContinueShopping={() => navigate('/menu')} />
    
      <OrderStatsCards stats={stats} />

      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="w-full md:w-auto overflow-x-auto scrollbar-hide">
            <div className="inline-flex h-12 min-w-max items-center gap-1 rounded-xl bg-[#f5f1ed] p-1.5 shadow-inner">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => actions.handleFilterChange(option.value)}
                  className={`h-full w-fit whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-all cursor-pointer active:scale-95 ${
                    selectedFilter === option.value
                      ? `${FILTER_ACTIVE_BASE_CLASS} ${FILTER_ACTIVE_TEXT_CLASS_MAP[option.value]} ${FILTER_ACTIVE_HOVER_CLASS_MAP[option.value]}`
                      : `${FILTER_INACTIVE_CLASS} ${FILTER_INACTIVE_HOVER_CLASS_MAP[option.value]}`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 self-start md:self-end">
            <p className="text-sm text-zinc-500">
              Hiển thị <span className="font-bold text-zinc-900">{filteredOrders.length}</span> trên{' '}
              <span className="font-bold text-zinc-900">{orders.length}</span> đơn hàng
            </p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-primary/20">
            <div className="size-24 rounded-full bg-background-light flex items-center justify-center mb-4 text-primary">
              <Clock3 className="size-12" />
            </div>
            <h3 className="text-xl font-bold text-[#161413] mb-2">Không có đơn hàng</h3>
            <p className="text-[#7f736c] mb-6 text-center max-w-xs">
              Không tìm thấy đơn hàng nào phù hợp với bộ lọc "{currentFilterLabel}".
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/30 border-2 border-primary"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <>
            <OrderListContainer orders={paginatedOrders} onViewDetail={handleViewDetail} />
            <OrderPagination
              currentPage={currentPage}
              totalPages={totalPages}
              filteredCount={filteredOrders.length}
              onPageChange={actions.setCurrentPage}
            />
          </>
        )}
      </section>

      <OrderDetailModal
        open={isModalOpen}
        order={selectedOrder}
        onClose={handleCloseModal}
        triggerPosition={triggerPosition}
      />
    </main>
  );
}

export default OrderHistoryPage;
