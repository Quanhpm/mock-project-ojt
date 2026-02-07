import { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { DashboardFilters } from '../types/dashboard.types';
import {
  GlobalOverview,
  RevenueChart,
  FranchisePerformance,
  OrderSourceComparison,
} from '../components/index.ts';
import { dashboardMockData } from '../mock/dashboard.mock';

export const DashboardPage = () => {
  const [filters] = useState<DashboardFilters>({
    dateRange: 'month',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExportReport = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Report exported successfully');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateRange = (start: Date, end: Date): string => {
    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900">Global Analytics Overview</h2>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-700">
            <Calendar className="w-3 h-3" />
            <span>{formatDateRange(filters.startDate, filters.endDate)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm w-64 focus:ring-2 focus:ring-amber-600 outline-none transition-all"
              placeholder="Search data points..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleExportReport}
            disabled={isLoading}
            className="bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Exporting...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export Report
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Global Overview Stats */}
        <GlobalOverview filters={filters} />

        {/* Revenue Performance Chart */}
        <RevenueChart filters={filters} data={dashboardMockData.revenueData} />

        {/* Two Column Layout: Revenue by Franchise + Order Source */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue by Franchise */}
          <FranchisePerformance filters={filters} data={dashboardMockData.franchiseRevenue} />

          {/* Order Source Comparison */}
          <OrderSourceComparison filters={filters} data={dashboardMockData.orderSourceData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
