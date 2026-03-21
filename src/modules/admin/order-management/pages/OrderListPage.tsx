import { OrderFiltersBar } from "../partials/orders/OrderFiltersBar";
import { OrderSummaryCards } from "../partials/orders/OrderSummaryCards";
import { OrderList } from "../partials/orders/OrderList";
import { OrderDetailPage } from "./OrderDetailPage";
import { useOrderListPage } from "../hooks/use-order-list-page";

export const OrderListPage = () => {
  const {
    isLoading,
    orders,
    statusFilter,
    searchQuery,
    summary,
    selectedOrderId,
    setStatusFilter,
    setSearchQuery,
    selectOrder,
    reload,
  } = useOrderListPage();

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col space-y-4">
      <div className="flex-shrink-0">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
          Orders
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
      </div>

      <div className="flex-shrink-0">
        <OrderSummaryCards {...summary} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Cột trái: Danh sách đơn hàng dạng thẻ */}
        <div className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-[400px] xl:w-[480px]">
          <OrderFiltersBar
            status={statusFilter}
            searchQuery={searchQuery}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearchQuery}
            onRefresh={() => {
              void reload();
            }}
          />
          <div className="min-h-0 flex-1 overflow-y-auto pb-4 scrollbar-hide">
            <OrderList
              orders={orders}
              isLoading={isLoading}
              selectedOrderId={selectedOrderId}
              onSelectOrder={selectOrder}
            />
          </div>
        </div>

        {/* Cột phải: Chi tiết đơn hàng */}
        <div className="flex w-full flex-1 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-gray-50/50 shadow-sm">
          {selectedOrderId ? (
            <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
              <OrderDetailPage providedOrderId={selectedOrderId} isEmbedded />
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-gray-400">
              <p className="text-lg">Tất cả thông tin chi tiết sẽ hiển thị tại đây</p>
              <p className="mt-2 text-sm">Vui lòng chọn 1 đơn hàng từ danh sách bên trái</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderListPage;
