import type { OrderItem } from "../../models/order.models";

const currency = new Intl.NumberFormat("vi-VN");

interface OrderDetailItemsProps {
  items: OrderItem[];
}

export const OrderDetailItems = ({ items }: OrderDetailItemsProps) => {
  return (
    <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-gray-900">Danh sách món</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Items Snapshot</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-sm font-black text-gray-400">
          {items.length}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.order_item_id}
            className="group rounded-[24px] bg-gray-50/50 p-5 ring-1 ring-black/5 transition hover:bg-white hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="text-base font-black tracking-tight text-gray-900">{item.product_name}</p>
                  <p className="mt-0.5 text-xs font-bold text-gray-400">
                    SL: <span className="text-gray-900">{item.quantity}</span> • Đơn giá: <span className="text-gray-900">{currency.format(item.price_snapshot)}đ</span>
                  </p>
                </div>

                {item.options.length > 0 && (
                  <div className="rounded-xl bg-white/50 p-3 ring-1 ring-black/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tùy chọn thêm</p>
                    <ul className="mt-2 space-y-1.5">
                      {item.options.map((option) => (
                        <li key={`${item.order_item_id}-${option.product_franchise_id}`} className="flex items-center justify-between text-xs font-medium text-gray-600">
                          <span>• {option.product_name} <span className="text-[10px] text-gray-400">x{option.quantity}</span></span>
                          <span className="font-bold text-gray-900">{currency.format(option.final_price)}đ</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="text-right sm:shrink-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Line total</p>
                <p className="mt-0.5 text-xl font-black text-amber-800">
                  {currency.format(item.final_line_total)}đ
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetailItems;
