import { useState } from "react";
import { PosFranchiseSelectionGate } from "../partials/pos/PosFranchiseSelectionGate";
import { OrderReadyForPickupModal } from "../partials/orders/OrderReadyForPickupModal";
import { StaffOrderQueueDetailPanel } from "../partials/staff-queue/StaffOrderQueueDetailPanel";
import { StaffOrderQueueHeader } from "../partials/staff-queue/StaffOrderQueueHeader";
import { StaffOrderQueueList } from "../partials/staff-queue/StaffOrderQueueList";
import { useStaffOrderQueuePage } from "../hooks/use-staff-order-queue-page";

export const StaffOrderQueuePage = () => {
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    switchFranchise,
    orders,
    displayedOrders,
    sortMode,
    setSortMode,
    confirmedCount,
    readyToPickupCount,
    isLoading,
    updatingOrderId,
    isReadyForPickupModalOpen,
    deliveryAssignees,
    selectedDeliveryAssigneeId,
    isLoadingDeliveryAssignees,
    isSubmittingReadyForPickup,
    loadMoreTriggerIndex,
    queueScrollContainerRef,
    setLoadMoreTriggerElement,
    setSelectedDeliveryAssigneeId,
    markPreparing,
    openReadyForPickupModal,
    closeReadyForPickupModal,
    confirmReadyForPickup,
  } = useStaffOrderQueuePage();
  const [manuallySelectedOrderId, setManuallySelectedOrderId] = useState<string | undefined>();
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isDetailFocused, setIsDetailFocused] = useState(false);
  const selectedOrderId =
    manuallySelectedOrderId &&
    displayedOrders.some((order) => order._id === manuallySelectedOrderId)
      ? manuallySelectedOrderId
      : displayedOrders[0]?._id;
  const selectedOrder = displayedOrders.find((order) => order._id === selectedOrderId);
  const isShowingMobileDetail = Boolean(isMobileDetailOpen && selectedOrderId);
  const isSidebarCollapsed = Boolean(isDetailFocused && selectedOrderId);

  const emptyStateTitle =
    sortMode === "CONFIRMED"
      ? "Không có order Confirmed"
      : sortMode === "READY_TO_PICKUP"
        ? "Không có order Ready to pickup"
        : "Queue hiện đang trống";

  const emptyStateDescription =
    sortMode === "CONFIRMED"
      ? "Hiện không có order nào đang chờ staff bắt đầu chuẩn bị trong chi nhánh này."
      : sortMode === "READY_TO_PICKUP"
        ? "Hiện không có order nào đang ở bước staff cần chuyển sang ready to pickup."
        : "Chưa có order nào ở trạng thái chờ làm món hoặc đang chuẩn bị trong chi nhánh hiện tại.";

  if (requiresFranchiseSelection) {
    return (
      <main
        className="flex min-h-[calc(100dvh-48px)] flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 shadow-sm lg:h-[calc(100dvh-48px)]"
      >
        <PosFranchiseSelectionGate
          franchiseOptions={franchiseOptions}
          isLoading={isSwitchingFranchise}
          onSelectFranchise={switchFranchise}
        />
      </main>
    );
  }

  if (!franchiseId) {
    return (
      <div
        className="flex min-h-[calc(100dvh-48px)] flex-1 items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/5 lg:h-[calc(100dvh-48px)]"
      >
        <div className="max-w-md">
          <p className="text-xl font-bold tracking-tight text-gray-900">
            Chưa có chi nhánh làm việc hợp lệ
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {hasInvalidFranchiseContext
              ? "Không thể xác định franchise context hiện tại, nên hệ thống sẽ không gọi Order API để tránh tải sai dữ liệu."
              : "Vui lòng chọn hoặc kiểm tra lại chi nhánh trước khi xử lý hàng đợi order."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-[calc(100dvh-48px)] flex-col gap-6 overflow-visible lg:h-[calc(100dvh-48px)] lg:overflow-hidden">
        <StaffOrderQueueHeader
          franchiseName={franchiseName}
          totalOrders={orders.length}
          confirmedCount={confirmedCount}
          readyToPickupCount={readyToPickupCount}
          sortMode={sortMode}
          onSortChange={setSortMode}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
          <div
            className={`${
              isShowingMobileDetail ? "hidden lg:flex" : "flex"
            } w-full flex-shrink-0 flex-col gap-4 ${
              isSidebarCollapsed ? "lg:w-[300px] xl:w-[340px]" : "lg:w-[380px] xl:w-[440px]"
            }`}
          >
            <div
              ref={queueScrollContainerRef}
              className="min-h-0 flex-1 overflow-y-auto pb-2 scrollbar-hide"
            >
              <StaffOrderQueueList
                orders={displayedOrders}
                isLoading={isLoading}
                selectedOrderId={selectedOrderId}
                emptyStateTitle={emptyStateTitle}
                emptyStateDescription={emptyStateDescription}
                loadMoreTriggerIndex={loadMoreTriggerIndex}
                onLoadMoreTriggerRef={setLoadMoreTriggerElement}
                onSelectOrder={(orderId) => {
                  setManuallySelectedOrderId(orderId);
                  setIsMobileDetailOpen(true);
                  setIsDetailFocused(true);
                }}
              />
            </div>
          </div>

          <div
            className={`${
              isShowingMobileDetail ? "flex" : "hidden"
            } min-w-0 flex-1 flex-col overflow-visible rounded-[32px] border border-gray-200 bg-white shadow-sm ring-1 ring-black/5 lg:flex lg:overflow-hidden`}
          >
            <div className="h-full min-w-0 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-hide">
              <button
                type="button"
                onClick={() => setIsMobileDetailOpen(false)}
                className="mb-4 inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 lg:hidden"
              >
                ← Danh sách order queue
              </button>

              <StaffOrderQueueDetailPanel
                order={selectedOrder}
                isPageLoading={isLoading}
                isUpdating={Boolean(selectedOrder && updatingOrderId === selectedOrder._id)}
                onMarkPreparing={(order) => {
                  void markPreparing(order);
                }}
                onMarkReadyForPickup={(order) => {
                  void openReadyForPickupModal(order);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <OrderReadyForPickupModal
        open={isReadyForPickupModalOpen}
        staffOptions={deliveryAssignees}
        selectedStaffId={selectedDeliveryAssigneeId}
        isLoading={isLoadingDeliveryAssignees}
        isSubmitting={isSubmittingReadyForPickup}
        onClose={closeReadyForPickupModal}
        onSelectStaff={setSelectedDeliveryAssigneeId}
        onConfirm={() => {
          void confirmReadyForPickup();
        }}
      />
    </>
  );
};

export default StaffOrderQueuePage;
