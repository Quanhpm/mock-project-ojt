import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrderData } from '../order.types';
import { filterOptions } from '../order.config';
import { useOrders } from '../hooks/useOrders';
import {
  OrderDetailModal,
  OrderHero,
  OrderStatsCards,
  OrderListContainer,
  OrderPagination,
} from '../components';

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
      <main className="flex-1 px-4 md:px-20 py-10 max-w-[1280px] mx-auto w-full space-y-8 animate-pulse">
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
      <main className="flex-1 px-4 md:px-20 py-10 max-w-[1280px] mx-auto w-full">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-rose-500">error</span>
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
    <main className="flex-1 px-4 md:px-20 py-10 max-w-[1280px] mx-auto w-full space-y-12">
      <OrderHero onContinueShopping={() => navigate('/menu')} />

      <OrderStatsCards stats={stats} />

      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="inline-flex h-12 items-center gap-1 rounded-xl bg-[#f5f1ed] p-1.5 shadow-inner">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => actions.handleFilterChange(option.value)}
                className={`h-full rounded-lg px-6 text-sm font-semibold transition-all cursor-pointer active:scale-95 ${selectedFilter === option.value
                  ? 'bg-white shadow-md text-zinc-800 border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-800 hover:bg-white/50'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 self-end">
            <p className="text-sm text-zinc-500">
              Hiển thị <span className="font-bold text-zinc-900">{filteredOrders.length}</span> trên{' '}
              <span className="font-bold text-zinc-900">{orders.length}</span> đơn hàng
            </p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-primary/20">
            <div className="size-24 rounded-full bg-background-light flex items-center justify-center mb-4 text-primary">
              <span className="material-symbols-outlined text-5xl">history</span>
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
