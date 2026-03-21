import { formatCurrency, formatDate } from '@/utils';
import { statusConfig } from '../order.config';
import type { OrderData } from '../order.types';

const getStatusBadgeClass = (statusCode: OrderData['status']['code']) => {
  if (statusCode === 'COMPLETED') {
    return 'bg-emerald-500/10 text-emerald-500';
  }

  if (statusCode === 'CANCELLED') {
    return 'bg-rose-500/10 text-rose-500';
  }

  if (statusCode === 'READY_FOR_PICKUP') {
    return 'bg-blue-600/10 text-blue-600';
  }

  if (statusCode === 'CONFIRMED') {
    return 'bg-cyan-500/10 text-cyan-500';
  }

  return 'bg-amber-500/10 text-amber-500';
};

const getStatusDotClass = (statusCode: OrderData['status']['code']) => {
  if (statusCode === 'COMPLETED') {
    return 'bg-emerald-500';
  }

  if (statusCode === 'CANCELLED') {
    return 'bg-rose-500';
  }

  if (statusCode === 'READY_FOR_PICKUP') {
    return 'bg-blue-600';
  }

  if (statusCode === 'CONFIRMED') {
    return 'bg-cyan-500';
  }

  return 'bg-amber-500 animate-pulse';
};

interface OrderListContainerProps {
  orders: OrderData[];
  onViewDetail: (order: OrderData, event: React.MouseEvent<HTMLButtonElement>) => void;
}

function OrderListContainer({ orders, onViewDetail }: OrderListContainerProps) {
  return (
    <>
      <div className="sm:hidden space-y-4">
        {orders.map((order) => {
          const config = statusConfig[order.status.code];
          return (
            <div key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-bold text-zinc-900">#{order.code}</p>
                <span
                  className={`inline-flex w-fit whitespace-nowrap items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(order.status.code)}`}
                >
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-zinc-500">Ngày đặt: {formatDate(order.meta.created_at)}</p>
              <p className="text-sm text-zinc-500">Tổng tiền: {formatCurrency(order.pricing.total)}</p>
              <button
                onClick={(event) => onViewDetail(order, event)}
                className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-bold text-zinc-500 hover:text-white hover:bg-primary transition-all cursor-pointer border-2 border-zinc-200 hover:border-primary active:scale-95"
              >
                Xem chi tiết
                <span className="material-symbols-outlined text-base">visibility</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">Mã đơn hàng</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">Ngày đặt</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">Cửa hàng</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">Tổng tiền</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400">Trạng thái</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((order) => {
                const config = statusConfig[order.status.code];
                return (
                  <tr key={order.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-6 font-bold text-zinc-900">#{order.code}</td>
                    <td className="px-6 py-6 text-sm text-zinc-500 font-medium">{formatDate(order.meta.created_at)}</td>
                    <td className="px-6 py-6 text-sm text-zinc-500">{order.store.name}</td>
                    <td className="px-6 py-6 font-bold text-zinc-900">{formatCurrency(order.pricing.total)}</td>
                    <td className="px-6 py-6">
                      <span
                        className={`inline-flex w-fit whitespace-nowrap items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(order.status.code)}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(order.status.code)}`}
                        />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button
                        onClick={(event) => onViewDetail(order, event)}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-primary transition-all cursor-pointer border-2 border-zinc-200 hover:border-primary shadow-sm hover:shadow-md active:scale-95"
                      >
                        Xem chi tiết
                        <span className="material-symbols-outlined text-base">visibility</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default OrderListContainer;
