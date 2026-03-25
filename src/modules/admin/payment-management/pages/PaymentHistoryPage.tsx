import { PosFranchiseSelectionGate } from "@/modules/admin/order-management/partials/pos/PosFranchiseSelectionGate";
import { usePaymentHistory } from "../hooks/use-payment-history";
import { PaymentHistoryHeader } from "../partials/payment-history/PaymentHistoryHeader";
import { PaymentHistoryTable } from "../partials/payment-history/PaymentHistoryTable";

export default function PaymentHistoryPage() {
  const {
    franchiseId,
    franchiseName,
    isAdminUser,
    franchiseOptions,
    isLoadingFranchiseOptions,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    selectFranchise,
    clearSelectedFranchise,
    paginatedPayments,
    isLoading,
    errorMessage,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    pageSize,
    hasActiveFilters,
  } = usePaymentHistory();

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
        <div className="max-w-md">
          <p className="text-xl font-black tracking-tight text-gray-900">
            Chưa có chi nhánh làm việc hợp lệ
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {hasInvalidFranchiseContext
              ? "Không thể xác định franchise context hiện tại, nên hệ thống sẽ không gọi Payment API để tránh tải sai dữ liệu."
              : "Vui lòng chọn hoặc kiểm tra lại chi nhánh trước khi xem lịch sử payment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PaymentHistoryHeader
        franchiseName={franchiseName}
        totalItems={totalItems}
        canChangeFranchise={isAdminUser}
        onChangeFranchise={clearSelectedFranchise}
      />

      <PaymentHistoryTable
        payments={paginatedPayments}
        isLoading={isLoading}
        errorMessage={errorMessage}
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={setStatusFilter}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onResetFilters={resetFilters}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
