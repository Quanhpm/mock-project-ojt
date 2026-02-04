import React from 'react';
import type { ProductMetrics, DashboardFilters } from '../types/dashboard.types';

interface Props {
  filters: DashboardFilters;
}

export const ProductsInventory: React.FC<Props> = ({ filters: _filters }) => {
  // Mock data
  const data: ProductMetrics = {
    topSellers: [
      { id: '1', name: 'Espresso', category: 'Coffee', sales: 5420, revenue: 32520, priceChangeCount: 2 },
      { id: '2', name: 'Cappuccino', category: 'Coffee', sales: 4890, revenue: 29340, priceChangeCount: 1 },
      { id: '3', name: 'Americano', category: 'Coffee', sales: 4200, revenue: 21000, priceChangeCount: 3 },
    ],
    slowMovers: [
      { id: '4', name: 'Affogato', category: 'Coffee', sales: 320, revenue: 2560, priceChangeCount: 0 },
      { id: '5', name: 'Turkish Coffee', category: 'Coffee', sales: 210, revenue: 1680, priceChangeCount: 1 },
    ],
    priceChanges: 28,
    averagePriceByFranchise: 4.85,
    inactiveProducts: 12,
    deletedProducts: 5,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="space-y-6">
        {/* Top Sellers */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4">Top Sellers</h3>
          <div className="space-y-3">
            {data.topSellers.map((product) => (
              <div key={product.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-slate-700">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {product.sales.toLocaleString()} sold
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Revenue: {formatCurrency(product.revenue)}</span>
                  <span>Price changes: {product.priceChangeCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Total Price Changes
            </p>
            <p className="text-2xl font-black text-slate-900">{data.priceChanges}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Avg Price
            </p>
            <p className="text-2xl font-black text-slate-900">${data.averagePriceByFranchise.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Inactive
            </p>
            <p className="text-2xl font-black text-red-600">{data.inactiveProducts}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Deleted
            </p>
            <p className="text-2xl font-black text-red-600">{data.deletedProducts}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsInventory;
