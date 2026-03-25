import { formatCurrency } from '@/utils';
import { Circle } from 'lucide-react';
import fallbackProductImage from '@/assets/img/logo2.png';
import type { OrderItemData } from '../../order.types';

interface OrderItemsListProps {
  items: OrderItemData[];
}

function OrderItemsList({ items }: OrderItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-slate-50/50 border border-slate-100">
        <p className="text-sm font-medium text-slate-500">
          Chưa có sản phẩm trong đơn hàng này.
        </p>
      </div>
    );
  }

  return (
    <section className="p-5 rounded-xl bg-slate-50/50 border border-slate-100 space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
        Danh sách sản phẩm
      </h3>

      <div className="space-y-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="group flex items-start gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:bg-white hover:border-slate-200"
          >
            <img
              src={item.productImageUrl || fallbackProductImage}
              alt={item.productName || 'Boutique Brews'}
              className="size-14 rounded-lg object-cover border border-slate-200 shrink-0"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = fallbackProductImage;
              }}
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1a130c] truncate">{item.productName}</p>
              <p className="text-xs text-slate-700">
                Đơn giá: {formatCurrency(item.priceSnapshot)}
              </p>

              {item.options.length > 0 ? (
                <ul className="mt-1 space-y-0.5">
                  {item.options.map((option) => (
                    <li
                      key={option.id}
                      className="flex items-center gap-1 text-xs text-slate-700"
                    >
                      <Circle className="size-2 fill-current text-slate-500" />
                      <span className="truncate">
                        {option.name} x{option.quantity} ({formatCurrency(option.finalLineTotal)})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-slate-600">x{item.quantity}</p>
              <p className="text-sm font-bold text-[#1a130c]">
                {formatCurrency(item.finalLineTotal)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OrderItemsList;
