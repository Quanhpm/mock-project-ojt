import React from 'react';
import type { InventoryMetrics, DashboardFilters } from '../types/dashboard.types';

interface Props {
  filters: DashboardFilters;
}

export const InventoryWarnings: React.FC<Props> = ({ filters: _filters }) => {
  // Mock data
  const data: InventoryMetrics = {
    lowStockProducts: [
      {
        productId: '1',
        productName: 'Espresso Beans Premium',
        franchiseId: '1',
        franchiseName: 'Downtown Seattle',
        currentStock: 45,
        threshold: 100,
        severity: 'warning',
      },
      {
        productId: '2',
        productName: 'Milk (1L)',
        franchiseId: '2',
        franchiseName: 'Portland Arts District',
        currentStock: 10,
        threshold: 50,
        severity: 'critical',
      },
      {
        productId: '3',
        productName: 'Sugar (1kg)',
        franchiseId: '1',
        franchiseName: 'Downtown Seattle',
        currentStock: 25,
        threshold: 75,
        severity: 'warning',
      },
    ],
    outOfStockByFranchise: [
      { franchiseName: 'Downtown Seattle', outOfStockCount: 3 },
      { franchiseName: 'Portland Arts District', outOfStockCount: 5 },
      { franchiseName: 'San Francisco Wharf', outOfStockCount: 1 },
    ],
    totalAlerts: 12,
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getSeverityLabel = (current: number, threshold: number): string => {
    const percentage = (current / threshold) * 100;
    if (percentage < 20) return 'critical';
    if (percentage < 50) return 'warning';
    return 'info';
  };

  return (
    <div className="space-y-6">
      {/* Inventory Alerts Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Inventory Alerts</h3>
            <p className="text-sm text-gray-500">Products below threshold</p>
          </div>
          <div className="text-3xl font-black text-red-600">{data.totalAlerts}</div>
        </div>

        <div className="space-y-2">
          {data.lowStockProducts.slice(0, 3).map((alert) => {
            const severity = getSeverityLabel(alert.currentStock, alert.threshold);
            const percentage = ((alert.currentStock / alert.threshold) * 100).toFixed(0);

            return (
              <div
                key={alert.productId}
                className={`p-3 rounded-lg border ${getSeverityColor(severity)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{alert.productName}</p>
                    <p className="text-xs opacity-75">{alert.franchiseName}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-white rounded">
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-30 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-current h-full rounded-full opacity-75"
                    style={{ width: `${Math.min(parseInt(percentage), 100)}%` }}
                  />
                </div>
                <p className="text-xs mt-1 opacity-75">
                  {alert.currentStock} / {alert.threshold} units
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Out of Stock by Franchise */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Out of Stock by Franchise
        </h3>
        <div className="space-y-3">
          {data.outOfStockByFranchise.map((item) => (
            <div key={item.franchiseName} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-700">{item.franchiseName}</span>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-black text-red-600">{item.outOfStockCount}</p>
                  <p className="text-xs text-gray-500">products</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryWarnings;
