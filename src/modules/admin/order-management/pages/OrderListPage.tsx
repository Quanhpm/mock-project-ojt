import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OrderFiltersBar } from "../partials/orders/OrderFiltersBar";
import { OrderList } from "../partials/orders/OrderList";
import { OrderDetailPage } from "./OrderDetailPage";
import { useOrderListPage } from "../hooks/use-order-list-page";

export const OrderListPage = () => {
  const [searchParams] = useSearchParams();
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
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(
    () => searchParams.get("openDetail") === "1",
  );
  const [isDetailFocused, setIsDetailFocused] = useState(false);
  const isShowingMobileDetail = Boolean(isMobileDetailOpen && selectedOrderId);
  const isSidebarCollapsed = Boolean(isDetailFocused && selectedOrderId);

  const handleSelectOrder = (orderId: string) => {
    selectOrder(orderId);
    setIsMobileDetailOpen(true);
    setIsDetailFocused(true);
  };

  return (
    <div className="flex min-h-[calc(100dvh-48px)] flex-col overflow-visible lg:h-[calc(100dvh-48px)] lg:overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Cột trái: Danh sách đơn hàng (Master) */}
        <div
          className={`${
            isShowingMobileDetail ? "hidden lg:flex" : "flex"
          } w-full flex-shrink-0 flex-col gap-4 ${
            isSidebarCollapsed ? "lg:w-[300px] xl:w-[340px]" : "lg:w-[380px] xl:w-[440px]"
          }`}
        >
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
              onSelectOrder={handleSelectOrder}
            />
          </div>
        </div>

        {/* Cột phải: Chi tiết đơn hàng (Detail) */}
        <div
          className={`${
            isShowingMobileDetail ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col overflow-visible rounded-[32px] border border-gray-200 bg-white shadow-sm ring-1 ring-black/5 lg:flex lg:overflow-hidden`}
        >
          {selectedOrderId ? (
            <div className="h-full min-w-0 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-hide">
              <button
                type="button"
                onClick={() => setIsMobileDetailOpen(false)}
                className="mb-4 inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 lg:hidden"
              >
                ← Danh sách đơn
              </button>
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
