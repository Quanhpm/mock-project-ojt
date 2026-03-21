import React from 'react';
import { OrderStatus } from '../types/dashboard.types';
import type { OrderOperationalMetrics, DashboardFilters } from '../types/dashboard.types';

interface Props {
  filters: DashboardFilters;
}

export const OrdersOperations: React.FC<Props> = ({ filters: _filters }) => {
  // Mock data
  const data: OrderOperationalMetrics = {
    byStatus: {
      [OrderStatus.DRAFT]: 1250,
      [OrderStatus.CONFIRMED]: 8432,
      [OrderStatus.COMPLETED]: 36821,
      [OrderStatus.CANCELLED]: 1706,
    },
    cancellationRate: 3.5,
    averageProcessingTime: 45,
    posVsOnlineRatio: {
      pos: 65,
      online: 35,
    },
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.DRAFT:
        return 'bg-gray-100 text-gray-700';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-700';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-700';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-700';
    }
  };

  const totalOrders = Object.values(data.byStatus).reduce((a, b) => a + b, 0);

  const statuses: OrderStatus[] = [
    OrderStatus.DRAFT,
    OrderStatus.CONFIRMED,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ];

  return (
    <div className="space-y-6">
      {/* Order Status Distribution */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 gap-4">
          {statuses.map((status) => {
            const count = data.byStatus[status];
            const percentage = ((count / totalOrders) * 100).toFixed(1);

            return (
              <div key={status} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(status)}`}>
                    {status}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{percentage}%</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{count.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Metrics */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Operational Metrics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Cancellation Rate
              </span>
              <span className="text-sm font-bold text-red-600">{data.cancellationRate}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full"
                style={{ width: `${Math.min(data.cancellationRate * 5, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Avg. Processing Time
              </span>
              <span className="text-sm font-bold text-amber-600">{data.averageProcessingTime} min</span>
            </div>
            <p className="text-xs text-gray-500">Time from confirmed to completed</p>
          </div>
        </div>
      </div>

      {/* POS vs Online */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Order Source</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">POS Terminal</span>
              <span className="text-sm font-bold text-slate-900">{data.posVsOnlineRatio.pos}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full"
                style={{ width: `${data.posVsOnlineRatio.pos}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">In-store transactions</p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Online / App</span>
              <span className="text-sm font-bold text-slate-900">{data.posVsOnlineRatio.online}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full"
                style={{ width: `${data.posVsOnlineRatio.online}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Web and mobile orders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersOperations;
