import { MapPin, Phone, UserRound } from "lucide-react";

interface DeliveryInfoProps {
  franchiseName: string;
  address: string;
  customerName?: string;
  phone?: string;
  message?: string;
}

export function DeliveryInfo({
  franchiseName,
  address,
  customerName,
  phone,
  message,
}: DeliveryInfoProps) {
  return (
    <section className="rounded-[24px] border border-[var(--cf-primary)]/10 bg-white/85 p-4 shadow-[0_16px_36px_rgba(127,85,57,0.06)] backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--cf-primary)] text-white shadow-[0_10px_20px_rgba(127,85,57,0.14)]">
          <MapPin className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--cf-secondary)]">
                Giao hàng tới
              </p>
              <h2 className="mt-1 text-base font-bold text-[var(--cf-primary)]">
                {franchiseName || "Đang cập nhật chi nhánh"}
              </h2>
            </div>

            {(customerName || phone) && (
              <div className="mt-1 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
                {customerName && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cf-bg)] px-2.5 py-1 text-xs font-medium text-[var(--cf-primary)]">
                    <UserRound className="h-3 w-3" />
                    {customerName}
                  </span>
                )}
                {phone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cf-bg)] px-2.5 py-1 text-xs font-medium text-[var(--cf-primary)]">
                    <Phone className="h-3 w-3" />
                    {phone}
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--cf-dark)]">
            Địa chỉ giao: {address || "Chưa có địa chỉ giao hàng cho đơn này."}
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--cf-dark)]">
            Ghi chú: {message || "Không có ghi chú."}
          </p>
        </div>
      </div>
    </section>
  );
}
