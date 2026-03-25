import { ArrowRightLeft, CreditCard, Store } from "lucide-react";

interface PaymentHistoryHeaderProps {
  franchiseName: string;
  totalItems: number;
  canChangeFranchise?: boolean;
  onChangeFranchise?: () => void;
}

export const PaymentHistoryHeader = ({
  franchiseName,
  totalItems,
  canChangeFranchise = false,
  onChangeFranchise,
}: PaymentHistoryHeaderProps) => {
  return (
    <section className="rounded-[32px] border border-gray-200 bg-white px-6 py-6 shadow-sm ring-1 ring-black/5 md:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            <CreditCard size={14} />
            Payment History
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900">
            Lịch sử Payment
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Theo dõi lịch sử giao dịch thanh toán của chi nhánh hiện tại. Danh
            sách được sắp xếp theo thời gian tạo mới nhất trước.
          </p>

          {canChangeFranchise && onChangeFranchise ? (
            <button
              type="button"
              onClick={onChangeFranchise}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-100"
            >
              <ArrowRightLeft size={16} />
              Chọn chi nhánh khác
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 px-5 py-4 ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-gray-400">
              <Store size={14} />
              Chi nhánh
            </div>
            <p className="mt-2 text-lg font-black text-gray-900">
              {franchiseName || "Chưa xác định"}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 px-5 py-4 ring-1 ring-black/5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">
              Tổng giao dịch hiển thị
            </p>
            <p className="mt-2 text-lg font-black text-gray-900">{totalItems}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentHistoryHeader;
