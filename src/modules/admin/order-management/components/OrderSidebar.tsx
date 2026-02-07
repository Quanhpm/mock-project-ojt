import React from 'react';
import { ShoppingCart, Minus, Plus, Trash2, User } from 'lucide-react';
import type { OrderItem, Order } from '../types/order.types';

interface OrderSidebarProps {
  order: Order;
  onAddItem?: (item: OrderItem) => void;
  onRemoveItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onOrderTypeChange?: (type: 'dine-in' | 'takeaway' | 'delivery') => void;
  onNotesChange?: (notes: string) => void;
}

export const OrderSidebar: React.FC<OrderSidebarProps> = ({
  order,
  onUpdateQuantity,
  onRemoveItem,
  onOrderTypeChange,
  onNotesChange,
}) => {
  const TAX_RATE = 0.05;

  return (
    <aside className="w-96 shrink-0 bg-white flex flex-col z-10 shadow-xl border-l border-gray-100">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-amber-800">Order #{order.orderNumber}</h2>
          <select
            defaultValue={order.orderType}
            onChange={(e) => onOrderTypeChange?.(e.target.value as any)}
            className="appearance-none bg-gray-50 text-gray-800 text-sm font-bold py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 cursor-pointer border border-gray-200"
          >
            <option value="dine-in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-amber-800 flex items-center justify-center group-hover:border-amber-800">
            <User size={18} />
          </div>
          <span className="text-sm font-bold text-gray-800">Add Customer</span>
          <span className="ml-auto text-gray-400">→</span>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <ShoppingCart size={40} className="mb-3 opacity-50" />
            <p className="text-sm">No items added yet</p>
          </div>
        ) : (
          <>
            {order.items.map((item, idx) => (
              <React.Fragment key={item.id}>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                      {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
                    </div>
                    <p className="font-bold text-gray-800 text-sm">VND {(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateQuantity?.(item.id, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 rounded-md bg-white hover:bg-gray-50 border border-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-bold text-gray-800 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-md bg-amber-700 text-white hover:bg-amber-800 flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem?.(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {idx < order.items.length - 1 && <div className="h-px bg-gray-100 w-full" />}
              </React.Fragment>
            ))}
          </>
        )}

        {/* Notes */}
        {order.items.length > 0 && (
          <div className="mt-4">
            <textarea
              defaultValue={order.notes}
              onChange={(e) => onNotesChange?.(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 placeholder-gray-400 text-gray-800 focus:ring-1 focus:ring-amber-700 focus:border-amber-700 resize-none h-20"
              placeholder="Add order note..."
            />
          </div>
        )}
      </div>

      {/* Summary */}
      {order.items.length > 0 && (
        <div className="mt-auto bg-white p-5 border-t border-gray-100 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Subtotal</span>
            <span className="font-bold text-gray-800">VND {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
            <span className="font-bold text-gray-800">VND {order.tax.toFixed(2)}</span>
          </div>
          <div className="h-px bg-gray-100 w-full my-1" />
          <div className="flex justify-between items-center text-base font-bold text-amber-800 mb-2">
            <span>Total</span>
            <span>VND {order.total.toFixed(2)}</span>
          </div>
          <button className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-700/20 flex items-center justify-between px-6 transition-all active:scale-[0.99] ring-offset-2 ring-offset-white focus:ring-2 focus:ring-amber-700">
            <span className="text-lg">Pay</span>
            <span className="text-lg">VND {order.total.toFixed(2)}</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default OrderSidebar;
