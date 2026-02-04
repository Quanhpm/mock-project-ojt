// Dashboard Mock Data
export const dashboardMockData = {
  globalMetrics: {
    totalFranchises: 142,
    totalFranchisesActive: 135,
    totalFranchisesTrend: 12,
    totalRevenue: 1240000,
    totalRevenueTrend: 8.4,
    totalOrders: 48209,
    totalOrdersTrend: -2.1,
    totalCustomers: 12840,
    totalCustomersTrend: 15.2,
    totalStaff: 1024,
    activeStaff: 1018,
  },

  revenueData: [
    { date: 'Oct 01', revenue: 42000, formatted: 'Oct 01' },
    { date: 'Oct 03', revenue: 48000, formatted: 'Oct 03' },
    { date: 'Oct 05', revenue: 51000, formatted: 'Oct 05' },
    { date: 'Oct 08', revenue: 62000, formatted: 'Oct 08' },
    { date: 'Oct 10', revenue: 55000, formatted: 'Oct 10' },
    { date: 'Oct 15', revenue: 68000, formatted: 'Oct 15' },
    { date: 'Oct 18', revenue: 84200, formatted: 'Oct 18' },
    { date: 'Oct 22', revenue: 72000, formatted: 'Oct 22' },
    { date: 'Oct 25', revenue: 78000, formatted: 'Oct 25' },
    { date: 'Oct 30', revenue: 91000, formatted: 'Oct 30' },
  ],

  franchiseRevenue: [
    {
      id: '1',
      name: 'Downtown Seattle',
      revenue: 245000,
      percentage: 85,
    },
    {
      id: '2',
      name: 'Portland Arts District',
      revenue: 182400,
      percentage: 65,
    },
    {
      id: '3',
      name: 'San Francisco Wharf',
      revenue: 156000,
      percentage: 55,
    },
    {
      id: '4',
      name: 'Chicago Loop',
      revenue: 128900,
      percentage: 45,
    },
  ],

  orderSourceData: [
    {
      name: 'POS Terminal',
      value: 65,
      orders: 31200,
    },
    {
      name: 'Online / App',
      value: 35,
      orders: 16870,
    },
  ],
};
