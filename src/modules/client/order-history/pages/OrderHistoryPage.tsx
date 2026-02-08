import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ordersData from '@/mockdata/orders.json';
import { formatDate, formatCurrency, formatCurrencyShort } from '@/utils';
import type { OrdersResponse, FilterOption, OrderData } from '../order.types';
import { statusConfig, filterOptions, PAGE_SIZE } from '../order.config';
import { OrderDetailModal } from '../components';
import LOGO from '@/assets/img/logobb.png';

function OrderHistoryPage() {
  const navigate = useNavigate();
  const response = ordersData as OrdersResponse;
  const { summary } = response.data;
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState<{ x: number; y: number } | null>(null);

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

  const filteredOrders = useMemo(() => {
    let filtered = [...response.data.orders];

    if (selectedFilter === 'completed') {
      filtered = filtered.filter((order) => order.status.code === 'COMPLETED');
    } else if (selectedFilter === 'pending') {
      filtered = filtered.filter(
        (order) => order.status.code === 'PREPARING' || order.status.code === 'CONFIRMED'
      );
    } else if (selectedFilter === 'cancelled') {
      filtered = filtered.filter((order) => order.status.code === 'CANCELLED');
    }

    return filtered.sort(
      (a, b) => new Date(b.meta.created_at).getTime() - new Date(a.meta.created_at).getTime()
    );
  }, [response.data.orders, selectedFilter]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage]);

  const handleFilterChange = (filter: FilterOption) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const currentFilterLabel = filterOptions.find((f) => f.value === selectedFilter)?.label || 'Gần nhất';

  return (
    <main className="flex-1 px-4 md:px-20 py-10 max-w-[1280px] mx-auto w-full space-y-12">
      <section className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
              Tài khoản của tôi
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-[#161413] dark:text-white">
              Lịch Sử <span className="text-primary">Đơn Hàng</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto lg:mx-0">
              Theo dõi những hương vị bạn đã khám phá cùng Boutique Brews. Xem lại các sản phẩm yêu thích và quản lý việc vận chuyển.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={() => navigate('/menu')}
              className="flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-white shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer border-2 border-primary"
            >
              Tiếp tục mua sắm
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <div className="relative group">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-primary/30 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <img
                alt="BOUTIQUE BREWS Logo"
                className="h-full w-full object-contain p-8"
                src={LOGO}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 p-6 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tổng đơn hàng</p>
            <p className="text-2xl font-black text-[#161413] dark:text-white">{summary.total_orders}</p>
          </div>
        </div>
        <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 p-6 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Hoàn thành</p>
            <p className="text-2xl font-black text-[#161413] dark:text-white">{summary.completed_orders}</p>
          </div>
        </div>
        <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 p-6 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
            <span className="material-symbols-outlined text-3xl">pending</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Đang xử lý</p>
            <p className="text-2xl font-black text-[#161413] dark:text-white">{summary.preparing_orders}</p>
          </div>
        </div>
        <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 p-6 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shrink-0">
            <span className="material-symbols-outlined text-3xl">payments</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tổng chi tiêu</p>
            <p className="text-2xl font-black text-[#161413] dark:text-white">
              {formatCurrencyShort(summary.total_revenue.value)}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="inline-flex h-12 items-center gap-1 rounded-xl bg-[#f5f1ed] dark:bg-zinc-800/50 p-1.5 shadow-inner">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`h-full rounded-lg px-6 text-sm font-semibold transition-all cursor-pointer ${
                  selectedFilter === option.value
                    ? 'bg-white dark:bg-zinc-900 shadow-md text-zinc-800 dark:text-white border border-zinc-200 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-700/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 self-end">
            <p className="text-sm text-zinc-500">
              Hiển thị <span className="font-bold text-zinc-900 dark:text-white">{filteredOrders.length}</span> trên{' '}
              <span className="font-bold text-zinc-900 dark:text-white">{response.data.orders.length}</span> đơn hàng
            </p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-primary/20">
            <div className="size-24 rounded-full bg-background-light flex items-center justify-center mb-4 text-primary">
              <span className="material-symbols-outlined text-5xl">history</span>
            </div>
            <h3 className="text-xl font-bold text-[#161413] dark:text-white mb-2">Không có đơn hàng</h3>
            <p className="text-[#7f736c] dark:text-gray-400 mb-6 text-center max-w-xs">
              Không tìm thấy đơn hàng nào phù hợp với bộ lọc "{currentFilterLabel}".
            </p>
            <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/30 border-2 border-primary">
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Mã đơn hàng
                      </th>
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Ngày đặt
                      </th>
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Cửa hàng
                      </th>
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Trạng thái
                      </th>
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {paginatedOrders.map((order) => {
                      const config = statusConfig[order.status.code];
                      return (
                        <tr
                          key={order.id}
                          className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="px-6 py-6 font-bold text-zinc-900 dark:text-white">#{order.code}</td>
                          <td className="px-6 py-6 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                            {formatDate(order.meta.created_at)}
                          </td>
                          <td className="px-6 py-6 text-sm text-zinc-500 dark:text-zinc-400">
                            {order.store.name}
                          </td>
                          <td className="px-6 py-6 font-bold text-zinc-900 dark:text-white">
                            {formatCurrency(order.pricing.total)}
                          </td>
                          <td className="px-6 py-6">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                order.status.code === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : order.status.code === 'CANCELLED'
                                  ? 'bg-rose-500/10 text-rose-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  order.status.code === 'COMPLETED'
                                    ? 'bg-emerald-500'
                                    : order.status.code === 'CANCELLED'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500 animate-pulse'
                                }`}
                              />
                              {config.label}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <button
                              onClick={(e) => handleViewDetail(order, e)}
                              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-primary transition-all cursor-pointer border-2 border-zinc-200 dark:border-zinc-700 hover:border-primary shadow-sm hover:shadow-md"
                            >
                              Xem chi tiết
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
              <div className="text-sm text-[#5e544e] dark:text-gray-400">
                Hiển thị{' '}
                <span className="font-semibold text-[#161413] dark:text-white">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>{' '}
                đến{' '}
                <span className="font-semibold text-[#161413] dark:text-white">
                  {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}
                </span>{' '}
                trong tổng số{' '}
                <span className="font-semibold text-[#161413] dark:text-white">{filteredOrders.length}</span> đơn
                hàng
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 text-[#161413] dark:text-white text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:border-primary hover:text-white hover:shadow-lg transition-all duration-200"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200 border-2 ${
                      currentPage === page
                        ? 'bg-primary text-white shadow-lg border-primary'
                        : 'bg-white dark:bg-zinc-800 text-[#161413] dark:text-white border-zinc-300 dark:border-zinc-600 hover:bg-primary hover:border-primary hover:text-white hover:shadow-lg'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 text-[#161413] dark:text-white text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:border-primary hover:text-white hover:shadow-lg transition-all duration-200"
                >
                  Sau
                </button>
              </div>
            </div>
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
