import { Truck } from "lucide-react";
import { PosFranchiseSelectionGate } from "@/modules/admin/order-management/partials/pos/PosFranchiseSelectionGate";
import { useDeliveryOrders } from "../hooks/use-delivery-orders";
import { DeliveryDetailPanel } from "../partials/delivery-layout/DeliveryDetailPanel";
import { DeliveryFiltersBar } from "../partials/delivery-layout/DeliveryFiltersBar";
import { DeliveryList } from "../partials/delivery-layout/DeliveryList";

export default function DeliveryManagementPage() {
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isLoadingFranchiseOptions,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    selectFranchise,
    deliveries,
    isLoading,
    statusFilter,
    setStatusFilter,
    selectedDeliveryId,
    selectedDelivery,
    selectedOrderDetail,
    isLoadingOrderDetail,
    didFailOrderDetail,
    isUpdatingPickup,
    isUpdatingComplete,
    selectDelivery,
    pickupSelectedDelivery,
    completeSelectedDelivery,
  } = useDeliveryOrders();

  if (requiresFranchiseSelection) {
    return (
      <main
        className="flex min-h-0 flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 shadow-sm"
        style={{ height: "calc(100vh - 48px)" }}
      >
        <PosFranchiseSelectionGate
          franchiseOptions={franchiseOptions}
          isLoading={isLoadingFranchiseOptions}
          onSelectFranchise={selectFranchise}
        />
      </main>
    );
  }

  if (!franchiseId) {
    return (
      <div
        className="flex min-h-0 flex-1 items-center justify-center rounded-[32px] border border-dashed border-gray-200 bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/5"
        style={{ height: "calc(100vh - 48px)" }}
      >
        <div className="max-w-lg">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-[#A3581E]">
            <Truck size={28} />
          </span>
          <p className="mt-5 text-2xl font-black tracking-tight text-gray-900">
            Chưa có chi nhánh giao hàng hợp lệ
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {hasInvalidFranchiseContext
              ? "Không xác định được franchise context hiện tại nên hệ thống sẽ không gọi Delivery API để tránh tải sai dữ liệu."
              : "Vui lòng chọn hoặc kiểm tra lại chi nhánh trước khi mở màn hình giao hàng."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 48px)" }}>
      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-[360px] xl:w-[400px]">
          <div className="flex-shrink-0">
            <DeliveryFiltersBar
              franchiseName={franchiseName}
              totalItems={deliveries.length}
              status={statusFilter}
              isLoading={isLoading}
              onStatusChange={setStatusFilter}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
            <DeliveryList
              deliveries={deliveries}
              isLoading={isLoading}
              selectedDeliveryId={selectedDeliveryId}
              onSelectDelivery={selectDelivery}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-[#EDE5D8] bg-[#FCFBF8] shadow-sm ring-1 ring-black/5">
          {selectedDelivery ? (
            <div className="h-full overflow-y-auto p-6 md:p-8 scrollbar-hide">
              <DeliveryDetailPanel
                delivery={selectedDelivery}
                orderDetail={selectedOrderDetail}
                isLoadingOrderDetail={isLoadingOrderDetail}
                didFailOrderDetail={didFailOrderDetail}
                isUpdatingPickup={isUpdatingPickup}
                isUpdatingComplete={isUpdatingComplete}
                onPickup={() => {
                  void pickupSelectedDelivery();
                }}
                onComplete={() => {
                  void completeSelectedDelivery();
                }}
              />
            </div>
          ) : (
            <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center bg-gradient-to-b from-white to-[#F9F8F5] px-6 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#EDE5D8_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
              <div className="relative z-10">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-orange-100/50 blur-2xl" />
                  <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-[#C85712] shadow-sm ring-1 ring-[#EDE5D8] transition-transform hover:scale-105">
                    <Truck strokeWidth={2.5} size={36} />
                  </span>
                </div>
                <p className="mt-8 text-3xl font-black tracking-tight text-gray-900">
                  Chi tiết delivery
                </p>
                <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-gray-500">
                  Chọn một delivery từ sidebar bên trái để xem timeline, thông tin khách hàng và cập nhật trạng thái giao hàng.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
