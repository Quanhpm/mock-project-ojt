import { httpClient } from "@/apis/httpClient";

export interface DashboardInfoData {
  countUsers: number;
  countUserFranchises: number;
  countCustomers: number;
  countCustomerFranchises: number;
  countProducts: number;
  countProductFranchises: number;
  countOrders: Record<string, number>;
  countPayments: Record<string, number>;
  countDeliveries: Record<string, number>;
}

export interface GetDashboardInfoParams {
  franchiseId?: string;
  [key: string]: unknown;
}

export const getDashboardInfo = (
  params?: GetDashboardInfoParams,
): Promise<DashboardInfoData | null> => {
  return httpClient.get<DashboardInfoData, GetDashboardInfoParams>({
    url: "/dashboards",
    params,
  });
};

export const dashboardApi = {
  getDashboardInfo,
};
