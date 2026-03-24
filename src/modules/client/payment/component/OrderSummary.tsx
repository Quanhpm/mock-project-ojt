import type { OrderResponse } from "@/apis/endpointsCLIENT/payment.api";
import { formatCurrency } from "@/utils";
import { ImageOff, ReceiptText } from "lucide-react";

type OrderItem = OrderResponse["order_items"][number];

interface OrderSummaryProps {
  order_items: OrderItem[];
  orderCode?: string;
}

interface OrderSummaryItemProps {
  item: OrderItem;
}

function ProductImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--cf-surface)] text-[var(--cf-primary)]/50">
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }

  return <img alt={alt} className="h-full w-full object-cover" src={src} />;
}

function OrderSummaryItem({ item }: OrderSummaryItemProps) {
  return (
    <article className="rounded-[20px] border border-[var(--cf-primary)]/8 bg-[var(--cf-bg)]/72 p-3 shadow-[0_8px_24px_rgba(127,85,57,0.04)]">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] bg-[var(--cf-surface)]">
          <ProductImage alt={item.product_name} src={item.product_image_url} />
          <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--cf-primary)] px-1.5 py-0.5 text-[10px] font-bold text-white">
            x{item.quantity}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[var(--cf-primary)]">
                {item.product_name}
              </h3>
              <p className="mt-1 text-xs text-[var(--cf-secondary)]">
                Đơn giá {formatCurrency(item.price_snapshot)}
              </p>
            </div>

            <p className="shrink-0 text-sm font-bold text-[var(--cf-primary)]">
              {formatCurrency(item.final_line_total)}
            </p>
          </div>

          {item.options.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.options.map((option) => (
                <span
                  className="rounded-full bg-white px-2 py-1 text-[11px] text-[var(--cf-dark)]"
                  key={`${item.order_item_id}-${option.product_franchise_id}-${option.product_name}`}
                >
                  {option.product_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-[var(--cf-secondary)]">
              Không có tuỳ chọn thêm
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function OrderSummary({ order_items }: OrderSummaryProps) {
  const totalQuantity = order_items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="rounded-[24px] border border-[var(--cf-primary)]/10 bg-white/85 p-4 shadow-[0_16px_36px_rgba(127,85,57,0.06)] backdrop-blur-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--cf-primary)]/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--cf-surface)] text-[var(--cf-primary)]">
            <ReceiptText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--cf-secondary)]">
              Đơn hàng
            </p>
            <h2 className="mt-1 text-base font-bold text-[var(--cf-primary)]">
              {totalQuantity} sản phẩm
            </h2>
          </div>
        </div>

        {/* <div className="flex flex-wrap items-center gap-2">
          {orderCode && (
            <span className="rounded-full border border-[var(--cf-primary)]/10 bg-[var(--cf-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--cf-primary)]">
              {orderCode}
            </span>
          )}
        </div> */}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {order_items.map((item) => (
          <OrderSummaryItem item={item} key={item.order_item_id} />
        ))}
      </div>
    </section>
  );
}
