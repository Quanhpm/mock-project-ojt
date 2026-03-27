import { useOrderFranchiseContext } from "../hooks/use-order-franchise-context";
import { PosFranchiseSelectionGate } from "../partials/pos/PosFranchiseSelectionGate";
import OrderListPage from "./OrderListPage";

export const OrderManagementPage = () => {
  const {
    franchiseId,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    switchFranchise,
  } = useOrderFranchiseContext({ adminGlobalScopeKey: "orders" });

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
              : "Vui lòng chọn hoặc kiểm tra lại chi nhánh trước khi điều phối đơn hàng."}
          </p>
        </div>
      </div>
    );
  }

  return <OrderListPage />;
};

export default OrderManagementPage;
