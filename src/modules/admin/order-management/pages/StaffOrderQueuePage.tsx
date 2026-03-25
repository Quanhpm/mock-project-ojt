import { PosFranchiseSelectionGate } from "../partials/pos/PosFranchiseSelectionGate";
import { OrderReadyForPickupModal } from "../partials/orders/OrderReadyForPickupModal";
import { StaffOrderQueueHeader } from "../partials/staff-queue/StaffOrderQueueHeader";
import { StaffOrderQueueGrid } from "../partials/staff-queue/StaffOrderQueueGrid";
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
        className="flex min-h-0 flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 shadow-sm"
        style={{ height: "calc(100vh - 48px)" }}
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
        className="flex min-h-0 flex-1 items-center justify-center rounded-[32px] border border-dashed border-gray-200 bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/5"
        style={{ height: "calc(100vh - 48px)" }}
      >
        <div className="max-w-md">
          <p className="text-xl font-black tracking-tight text-gray-900">
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
      <div className="flex flex-col gap-6 overflow-hidden" style={{ height: "calc(100vh - 48px)" }}>
        <StaffOrderQueueHeader
          franchiseName={franchiseName}
          totalOrders={orders.length}
          confirmedCount={confirmedCount}
          readyToPickupCount={readyToPickupCount}
          sortMode={sortMode}
          onSortChange={setSortMode}
        />

        <div
          ref={queueScrollContainerRef}
          className="min-h-0 flex-1 overflow-y-auto pb-2 scrollbar-hide"
        >
          <StaffOrderQueueGrid
            orders={displayedOrders}
            isLoading={isLoading}
            emptyStateTitle={emptyStateTitle}
            emptyStateDescription={emptyStateDescription}
            updatingOrderId={updatingOrderId}
            loadMoreTriggerIndex={loadMoreTriggerIndex}
            onLoadMoreTriggerRef={setLoadMoreTriggerElement}
            onMarkPreparing={(order) => {
              void markPreparing(order);
            }}
            onMarkReadyForPickup={(order) => {
              void openReadyForPickupModal(order);
            }}
          />
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
