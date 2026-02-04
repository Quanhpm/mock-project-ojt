import React from 'react';
import { LoyaltyTier } from '../types/dashboard.types';
import type { LoyaltyMetrics, DashboardFilters } from '../types/dashboard.types';

interface Props {
  filters: DashboardFilters;
}

export const CustomersLoyalty: React.FC<Props> = ({ filters: _filters }) => {
  // Mock data
  const data: LoyaltyMetrics = {
    totalPointsInCirculation: 2456789,
    customersByTier: {
      [LoyaltyTier.SILVER]: 8245,
      [LoyaltyTier.GOLD]: 3120,
      [LoyaltyTier.PLATINUM]: 475,
    },
    earnVsRedeem: {
      earned: 580000,
      redeemed: 245000,
    },
    mostReturnedCustomers: [
      {
        customerId: '1',
        name: 'John Smith',
        visitCount: 156,
        totalSpent: 5420,
      },
      {
        customerId: '2',
        name: 'Sarah Johnson',
        visitCount: 142,
        totalSpent: 4890,
      },
      {
        customerId: '3',
        name: 'Michael Chen',
        visitCount: 128,
        totalSpent: 4320,
      },
    ],
  };

  const getTierColor = (tier: LoyaltyTier): string => {
    switch (tier) {
      case LoyaltyTier.SILVER:
        return 'bg-gray-100 text-gray-700';
      case LoyaltyTier.GOLD:
        return 'bg-yellow-100 text-yellow-700';
      case LoyaltyTier.PLATINUM:
        return 'bg-purple-100 text-purple-700';
    }
  };

  const getTierIcon = (tier: LoyaltyTier): string => {
    switch (tier) {
      case LoyaltyTier.SILVER:
        return '◯';
      case LoyaltyTier.GOLD:
        return '★';
      case LoyaltyTier.PLATINUM:
        return '◆';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalCustomers = Object.values(data.customersByTier).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Loyalty Points Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Loyalty Points</h3>
        <div className="text-center py-4">
          <p className="text-4xl font-black text-amber-600">
            {(data.totalPointsInCirculation / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-500 mt-1">Points in circulation</p>
        </div>
      </div>

      {/* Customers by Tier */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Customers by Tier</h3>
        <div className="space-y-3">
          {Object.entries(data.customersByTier).map(([tier, count]) => {
            const percentage = ((count / totalCustomers) * 100).toFixed(1);
            return (
              <div key={tier}>
                <div className="flex justify-between items-center mb-2">
                  <div className={`text-xs font-bold px-2 py-1 rounded ${getTierColor(tier as LoyaltyTier)}`}>
                    {getTierIcon(tier as LoyaltyTier)} {tier}
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {count.toLocaleString()} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      tier === LoyaltyTier.PLATINUM
                        ? 'bg-purple-600'
                        : tier === LoyaltyTier.GOLD
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Earn vs Redeem */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Earn vs Redeem</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">
              Earned
            </p>
            <p className="text-2xl font-black text-green-600">
              {(data.earnVsRedeem.earned / 1000).toFixed(0)}k
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
              Redeemed
            </p>
            <p className="text-2xl font-black text-blue-600">
              {(data.earnVsRedeem.redeemed / 1000).toFixed(0)}k
            </p>
          </div>
        </div>
      </div>

      {/* Most Returned Customers */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Top Loyal Customers</h3>
        <div className="space-y-3">
          {data.mostReturnedCustomers.map((customer, index) => (
            <div key={customer.customerId} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-800 flex-shrink-0">
                #{index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-700">{customer.name}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>{customer.visitCount} visits</span>
                  <span>Spent: {formatCurrency(customer.totalSpent)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomersLoyalty;
