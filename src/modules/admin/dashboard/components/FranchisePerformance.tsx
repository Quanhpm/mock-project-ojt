import React from 'react';
import type { DashboardFilters } from '../types/dashboard.types';

interface FranchiseRevenueItem {
  id: string;
  name: string;
  revenue: number;
  percentage: number;
}

interface Props {
  filters: DashboardFilters;
  data?: FranchiseRevenueItem[];
}

export const FranchisePerformance: React.FC<Props> = ({ filters: _filters, data = [] }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Revenue by Franchise</h3>
        </div>
        <button className="text-sm font-bold text-amber-700 flex items-center gap-1 hover:underline">
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {data.map((franchise) => (
          <div key={franchise.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-slate-700">{franchise.name}</span>
              <span className="text-gray-500 font-medium">{formatCurrency(franchise.revenue)}</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-700 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${franchise.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FranchisePerformance;
