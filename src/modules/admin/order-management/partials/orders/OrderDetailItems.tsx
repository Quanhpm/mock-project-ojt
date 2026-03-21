import type { OrderItem } from "../../models/order.models";

const currency = new Intl.NumberFormat("vi-VN");

interface OrderDetailItemsProps {
  items: OrderItem[];
}

export const OrderDetailItems = ({ items }: OrderDetailItemsProps) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Danh sách món</h2>
        <p className="mt-1 text-sm text-gray-500">Snapshot item của order sau checkout</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.order_item_id}
            className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{item.product_name}</p>
                <p className="text-sm text-gray-500">
                  SL: {item.quantity} | Giá snapshot: {currency.format(item.price_snapshot)}đ
                </p>
                {item.options.length > 0 && (
                  <div className="pt-2 text-sm text-gray-500">
                    <p className="font-medium text-gray-700">Topping / options</p>
                    <ul className="mt-2 space-y-1">
                      {item.options.map((option) => (
                        <li key={`${item.order_item_id}-${option.product_franchise_id}`}>
                          {option.product_name} x{option.quantity} ({currency.format(option.final_price)}đ)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Line total</p>
                <p className="text-lg font-bold text-amber-800">
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
