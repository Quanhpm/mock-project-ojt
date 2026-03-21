import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDashboardInfo } from '@/apis/endpoints/dashboard.api';
import {
  getFranchiseId,
  getRoleCode,
  useAdminAuthStore,
} from '@/modules/admin/auth-admin/stores/admin-auth.store';
import type { DashboardInfoData, DistributionChartItem } from '../types/dashboard.types';
import {
  GlobalOverview,
  OrderSourceComparison,
} from '../components/index.ts';

export const DashboardPage = () => {
  const roleCode = useAdminAuthStore((state) => getRoleCode(state));
  const franchiseId = useAdminAuthStore((state) => getFranchiseId(state));
  const [dashboardData, setDashboardData] = useState<DashboardInfoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const shouldUseFranchiseId = roleCode !== 'ADMIN' && roleCode !== 'MANAGER';

  const fetchDashboardInfo = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await getDashboardInfo({
        franchiseId: shouldUseFranchiseId ? franchiseId || undefined : undefined,
      });
      setDashboardData(response);
    } catch (error) {
      console.error('Failed to fetch dashboard info:', error);
      setLoadError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [franchiseId, shouldUseFranchiseId]);

  useEffect(() => {
    fetchDashboardInfo();
  }, [fetchDashboardInfo]);

  const mapStatusData = useCallback((statusMap?: Record<string, number>): DistributionChartItem[] => {
    if (!statusMap) return [];

    return Object.entries(statusMap)
      .map(([name, count]) => ({
        name: name.replaceAll('_', ' '),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const orderStatusData = useMemo(
    () => mapStatusData(dashboardData?.countOrders),
    [dashboardData?.countOrders, mapStatusData],
  );

  const paymentStatusData = useMemo(
    () => mapStatusData(dashboardData?.countPayments),
    [dashboardData?.countPayments, mapStatusData],
  );

  const deliveryStatusData = useMemo(
    () => mapStatusData(dashboardData?.countDeliveries),
    [dashboardData?.countDeliveries, mapStatusData],
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-100 flex items-center px-8 shrink-0">
        <h2 className="text-4xl font-bold text-slate-900">Dashboard Overview</h2>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Global Overview Stats */}
        <GlobalOverview metrics={dashboardData} isLoading={isLoading} />

        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* Status Distribution Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <OrderSourceComparison
            title="Order Status Distribution"
            description="Số lượng đơn theo trạng thái"
            data={orderStatusData}
            isLoading={isLoading}
          />

          <OrderSourceComparison
            title="Payment Status Distribution"
            description="Số lượng thanh toán theo trạng thái"
            data={paymentStatusData}
            isLoading={isLoading}
          />

          <OrderSourceComparison
            title="Delivery Status Distribution"
            description="Số lượng giao hàng theo trạng thái"
            data={deliveryStatusData}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
