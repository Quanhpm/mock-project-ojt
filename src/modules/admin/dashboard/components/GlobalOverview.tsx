import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardFilters, GlobalOverviewMetrics } from '../types/dashboard.types';

interface Props {
  filters: DashboardFilters;
}

export const GlobalOverview: React.FC<Props> = ({ filters: _filters }) => {
  // Mock data - replace with API call
  const metrics: GlobalOverviewMetrics = {
    totalFranchises: {
      value: 142,
      active: 135,
      inactive: 7,
      trend: 12,
    },
    totalRevenue: {
      value: 1240000,
      trend: 8.4,
    },
    totalOrders: {
      value: 48209,
      trend: -2.1,
    },
    totalCustomers: {
      value: 12840,
      trend: 15.2,
    },
    totalStaff: {
      value: 1024,
      activeCount: 1018,
    },
  };

  const StatCard: React.FC<{
    label: string;
    value: string | number;
    trend?: number;
    icon: React.ReactNode;
  }> = ({ label, value, trend, icon }) => {
    const isPositive = trend !== undefined && trend >= 0;

    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-slate-50 text-amber-700 rounded-xl border border-slate-100">
            {icon}
          </div>
          {trend !== undefined && (
            <span
              className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                isPositive
                  ? 'text-green-600 bg-green-50'
                  : 'text-red-600 bg-red-50'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="grid grid-cols-5 gap-6">
      <StatCard
        label="Total Franchises"
        value={metrics.totalFranchises.value}
        trend={metrics.totalFranchises.trend}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        }
      />

      <StatCard
        label="Total Revenue"
        value={formatCurrency(metrics.totalRevenue.value)}
        trend={metrics.totalRevenue.trend}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />

      <StatCard
        label="Total Orders"
        value={formatNumber(metrics.totalOrders.value)}
        trend={metrics.totalOrders.trend}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      />

      <StatCard
        label="Total Customers"
        value={formatNumber(metrics.totalCustomers.value)}
        trend={metrics.totalCustomers.trend}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0H9m6 0a1 1 0 01-1 1H8a1 1 0 01-1-1m0-4a1 1 0 011-1h8a1 1 0 011 1m-12 4a5 5 0 0110 0"
            />
          </svg>
        }
      />

      <StatCard
        label="Active Staff"
        value={`${metrics.totalStaff.activeCount}/${metrics.totalStaff.value}`}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        }
      />
    </div>
  );
};

export default GlobalOverview;
