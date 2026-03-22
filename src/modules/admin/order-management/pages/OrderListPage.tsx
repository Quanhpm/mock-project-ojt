import { OrderFiltersBar } from "../partials/orders/OrderFiltersBar";
import { OrderList } from "../partials/orders/OrderList";
import { OrderDetailPage } from "./OrderDetailPage";
import { useOrderListPage } from "../hooks/use-order-list-page";

export const OrderListPage = () => {
  const {
    isLoading,
    orders,
    statusFilter,
    searchQuery,
    selectedOrderId,
    setStatusFilter,
    setSearchQuery,
    selectOrder,
    reload,
  } = useOrderListPage();

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 48px)" }}>
      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Cột trái: Danh sách đơn hàng (Master) */}
        <div className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-[380px] xl:w-[440px]">
          <div className="flex-shrink-0">
            <OrderFiltersBar
              status={statusFilter}
              searchQuery={searchQuery}
              onStatusChange={setStatusFilter}
              onSearchChange={setSearchQuery}
              onRefresh={() => {
                void reload();
              }}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
            <OrderList
              orders={orders}
              isLoading={isLoading}
              selectedOrderId={selectedOrderId}
              onSelectOrder={selectOrder}
            />
          </div>
        </div>

        {/* Cột phải: Chi tiết đơn hàng (Detail) */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
          {selectedOrderId ? (
            <div className="h-full overflow-y-auto p-6 md:p-8 scrollbar-hide">
              <OrderDetailPage
                providedOrderId={selectedOrderId}
                isEmbedded
                onOrderStatusUpdated={() => reload()}
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                <p className="text-3xl">☕</p>
              </div>
              <p className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</p>
              <p className="mt-2 max-w-[280px] text-sm text-gray-500">
                Chọn một đơn hàng từ danh sách bên trái để xem đầy đủ thông tin và xử lý.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderListPage;
