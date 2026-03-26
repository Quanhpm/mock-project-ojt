import { AlertTriangle, CreditCard, SearchX } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format.util";
import {
  PAYMENT_HISTORY_STATUS_BADGES,
  PAYMENT_HISTORY_STATUS_LABELS,
} from "../../config/payment-history.config";
import type {
  PaymentHistoryItem,
  PaymentHistoryStatus,
} from "../../models/payment-history.models";
import { PaymentHistoryFilters } from "./PaymentHistoryFilters";
import { PaymentHistoryPagination } from "./PaymentHistoryPagination";

interface PaymentHistoryTableProps {
  payments: PaymentHistoryItem[];
  isLoading: boolean;
  errorMessage: string | null;
  statusFilter: PaymentHistoryStatus | "";
  dateFrom: string;
  dateTo: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasActiveFilters: boolean;
  onStatusChange: (status: PaymentHistoryStatus | "") => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
}

const formatPaymentDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
};

const getPaymentMethodLabel = (method: string) => {
  const normalizedMethod = method.trim();
  return normalizedMethod || "Chưa xác định";
};

const PaymentHistoryMobileCard = ({
  payment,
}: {
  payment: PaymentHistoryItem;
}) => {
  return (
    <article className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
            Payment Code
          </p>
          <p className="mt-1 break-all text-lg font-black tracking-tight text-gray-900">
            {payment.code}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Order: {payment.order_id?.code || "-"}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ring-1",
            PAYMENT_HISTORY_STATUS_BADGES[payment.status],
          )}
        >
          {PAYMENT_HISTORY_STATUS_LABELS[payment.status]}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
          <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
            Customer
          </dt>
          <dd className="mt-1 text-sm font-semibold text-gray-900">
            {payment.customer_id?.name || "Khách vãng lai"}
          </dd>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
          <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
            Method
          </dt>
          <dd className="mt-1 text-sm font-semibold text-gray-900">
            {getPaymentMethodLabel(payment.method)}
          </dd>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
          <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
            Created At
          </dt>
          <dd className="mt-1 text-sm font-semibold text-gray-900">
            {formatPaymentDateTime(payment.created_at)}
          </dd>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
          <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
            Amount
          </dt>
          <dd className="mt-1 text-lg font-black text-gray-900">
            {formatCurrency(payment.amount)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
        <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
            Paid At
          </p>
          <p className="mt-1 font-semibold text-gray-900">
            {formatPaymentDateTime(payment.paid_at)}
          </p>
        </div>
      </div>
    </article>
  );
};

const PaymentHistoryLoadingRows = () => {
  return (
    <tbody className="divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          {Array.from({ length: 8 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-6 py-4">
              <div className="h-4 rounded-full bg-gray-100" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

const PaymentHistoryEmptyState = ({
  hasActiveFilters,
}: {
  hasActiveFilters: boolean;
}) => {
  return (
    <tbody>
      <tr>
        <td colSpan={8} className="px-6 py-10">
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[28px] border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
            <SearchX size={36} className="text-gray-400" />
            <p className="mt-4 text-lg font-black tracking-tight text-gray-900">
              {hasActiveFilters
                ? "Không có giao dịch phù hợp với bộ lọc hiện tại"
                : "Chưa có giao dịch payment nào cho chi nhánh này"}
            </p>
            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
              {hasActiveFilters
                ? "Thử nới rộng khoảng ngày hoặc bỏ chọn trạng thái để xem thêm giao dịch."
                : "Khi chi nhánh phát sinh giao dịch thanh toán, lịch sử sẽ hiện tại đây."}
            </p>
          </div>
        </td>
      </tr>
    </tbody>
  );
};

const PaymentHistoryErrorState = ({ message }: { message: string }) => {
  return (
    <tbody>
      <tr>
        <td colSpan={8} className="px-6 py-10">
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center">
            <AlertTriangle size={36} className="text-red-500" />
            <p className="mt-4 text-lg font-black tracking-tight text-red-900">
              Không thể tải dữ liệu payment
            </p>
            <p className="mt-2 max-w-lg text-sm leading-6 text-red-700">
              {message}
            </p>
          </div>
        </td>
      </tr>
    </tbody>
  );
};

export const PaymentHistoryTable = ({
  payments,
  isLoading,
  errorMessage,
  statusFilter,
  dateFrom,
  dateTo,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  hasActiveFilters,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onResetFilters,
  onPageChange,
}: PaymentHistoryTableProps) => {
  const renderMobileContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 md:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-[28px] bg-gray-100" />
          ))}
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-10 text-center md:hidden">
          <AlertTriangle size={32} className="mx-auto text-red-500" />
          <p className="mt-3 text-lg font-black tracking-tight text-red-900">
            Không thể tải dữ liệu payment
          </p>
          <p className="mt-2 text-sm leading-6 text-red-700">{errorMessage}</p>
        </div>
      );
    }

    if (payments.length === 0) {
      return (
        <div className="rounded-[28px] border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center md:hidden">
          <SearchX size={32} className="mx-auto text-gray-400" />
          <p className="mt-3 text-lg font-black tracking-tight text-gray-900">
            {hasActiveFilters
              ? "Không có giao dịch phù hợp với bộ lọc hiện tại"
              : "Chưa có giao dịch payment nào cho chi nhánh này"}
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {hasActiveFilters
              ? "Thử nới rộng khoảng ngày hoặc bỏ chọn trạng thái để xem thêm giao dịch."
              : "Khi chi nhánh phát sinh giao dịch thanh toán, lịch sử sẽ hiện tại đây."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 md:hidden">
        {payments.map((payment) => (
          <PaymentHistoryMobileCard key={payment._id} payment={payment} />
        ))}
      </div>
    );
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
      <div className="border-b border-gray-100 px-6 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
              <CreditCard size={20} />
            </span>

            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900">
                Bảng lịch sử thanh toán
              </h2>
              <p className="text-sm text-gray-500">
                Theo dõi giao dịch payment theo chi nhánh và bộ lọc hiện tại.
              </p>
            </div>
          </div>

          <PaymentHistoryFilters
            statusFilter={statusFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            isLoading={isLoading}
            onStatusChange={onStatusChange}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            onResetFilters={onResetFilters}
          />
        </div>
      </div>

      <div className="px-4 py-4 md:hidden">
        {renderMobileContent()}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs font-black uppercase tracking-[0.18em] text-gray-500">
            <tr>
              <th className="px-6 py-4">Payment Code</th>
              <th className="px-6 py-4">Order Code</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4">Paid At</th>
            </tr>
          </thead>

          {isLoading ? (
            <PaymentHistoryLoadingRows />
          ) : errorMessage ? (
            <PaymentHistoryErrorState message={errorMessage} />
          ) : payments.length === 0 ? (
            <PaymentHistoryEmptyState hasActiveFilters={hasActiveFilters} />
          ) : (
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr
                  key={payment._id}
                  className="transition-colors hover:bg-amber-50/40"
                >
                  <td className="px-6 py-4 align-top">
                    <div className="font-semibold text-gray-900">
                      {payment.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-700">
                      {payment.order_id?.code || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-700">
                      {payment.customer_id?.name || "Khách vãng lai"}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-700">
                      {getPaymentMethodLabel(payment.method)}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ring-1",
                        PAYMENT_HISTORY_STATUS_BADGES[payment.status],
                      )}
                    >
                      {PAYMENT_HISTORY_STATUS_LABELS[payment.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 align-top whitespace-nowrap font-medium text-gray-700">
                    {formatPaymentDateTime(payment.created_at)}
                  </td>
                  <td className="px-6 py-4 align-top whitespace-nowrap font-medium text-gray-700">
                    {formatPaymentDateTime(payment.paid_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <PaymentHistoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </section>
  );
};

export default PaymentHistoryTable;
