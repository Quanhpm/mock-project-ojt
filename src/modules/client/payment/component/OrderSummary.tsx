import type { OrderResponse } from "@/apis/endpointsCLIENT/payment.api"
import { formatCurrencyShort } from "@/utils"

type OrderItem = OrderResponse["order_items"][number];

interface OrderSummaryProps {
  order_items: OrderItem[];
}

interface OrderSummaryItemProps {
  item: OrderItem;
}

function OrderSummaryItem({ item }: OrderSummaryItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--cf-accent-light)] bg-[var(--cf-bg)] p-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--cf-primary)] text-xs font-bold text-white">
        {item.quantity}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight text-[var(--cf-primary)]">
          {item.product_name}
        </p>

        {item.options.length > 0 &&
          item.options.map((op) => (
            <p
              key={op.product_franchise_id}
              className="mt-0.5 truncate text-[11px] text-[var(--cf-secondary)]"
            >
              {op.product_name} - {formatCurrencyShort(op.final_price)}
            </p>
          ))}
      </div>

      <p className="flex-shrink-0 text-sm font-bold text-[var(--cf-dark)]">
        {formatCurrencyShort(item.price_snapshot * item.quantity)}
      </p>
    </div>
  );
}

export function OrderSummary({ order_items }: OrderSummaryProps) {
  return (
    <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-primary)]">
          Đơn hàng
        </p>

        <span className="rounded-full bg-[var(--cf-accent-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--cf-primary)]">
          {order_items.length} món
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {order_items.map((item) => (
          <OrderSummaryItem key={item.order_item_id} item={item} />
        ))}
      </div>
    </div>
  );
}