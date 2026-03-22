import React from 'react';
import type { DashboardInfoData } from '../types/dashboard.types';

interface Props {
  metrics: DashboardInfoData | null;
  isLoading?: boolean;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-slate-50 text-amber-700 rounded-xl border border-slate-100">
          {icon}
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
};

export const GlobalOverview: React.FC<Props> = ({ metrics, isLoading = false }) => {
  const overviewItems: StatItem[] = [
    {
      label: 'Users',
      value: metrics?.countUsers ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a4 4 0 00-5.356-3.77M9 20H4v-2a4 4 0 015.356-3.77M9 20h6M12 10a4 4 0 100-8 4 4 0 000 8zm6 3a3 3 0 100-6 3 3 0 000 6zM6 13a3 3 0 100-6 3 3 0 000 6z"
          />
        </svg>
      ),
    },
    {
      label: 'User-Franchise Links',
      value: metrics?.countUserFranchises ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      label: 'Customers',
      value: metrics?.countCustomers ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6H6a4 4 0 01-4-4v-1a4 4 0 014-4h8a4 4 0 014 4v1a4 4 0 01-4 4zm1-11a3 3 0 100-6 3 3 0 000 6z"
          />
        </svg>
      ),
    },
    {
      label: 'Customer-Franchise Links',
      value: metrics?.countCustomerFranchises ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10m-9 4h6m5 5H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      label: 'Products',
      value: metrics?.countProducts ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
          />
        </svg>
      ),
    },
    {
      label: 'Product-Franchise Links',
      value: metrics?.countProductFranchises ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 4H6a2 2 0 00-2 2v5m0 2v5a2 2 0 002 2h5m2 0h5a2 2 0 002-2v-5m0-2V6a2 2 0 00-2-2h-5"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {overviewItems.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={isLoading ? '...' : formatNumber(item.value)}
          icon={item.icon}
        />
      ))}
    </div>
  );
};

export default GlobalOverview;
