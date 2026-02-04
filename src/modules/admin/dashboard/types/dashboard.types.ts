// Global Overview Types
export interface GlobalOverviewMetrics {
  totalFranchises: {
    value: number;
    active: number;
    inactive: number;
    trend: number; // percentage
  };
  totalRevenue: {
    value: number;
    trend: number;
  };
  totalOrders: {
    value: number;
    trend: number;
  };
  totalCustomers: {
    value: number;
    trend: number;
  };
  totalStaff: {
    value: number;
    activeCount: number;
  };
}

// Franchise Performance Types
export interface FranchiseMetric {
  id: string;
  name: string;
  revenue: number;
  orderCount: number;
  loyalCustomers: number;
  growth: number; // percentage compared to previous period
}

export interface FranchisePerformanceData {
  topPerformers: FranchiseMetric[];
  bottomPerformers: FranchiseMetric[];
  mostLoyalCustomerFranchises: FranchiseMetric[];
}

// Orders & Operations Types
export const OrderStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderOperationalMetrics {
  byStatus: {
    [key in OrderStatus]: number;
  };
  cancellationRate: number; // percentage
  averageProcessingTime: number; // in minutes
  posVsOnlineRatio: {
    pos: number; // percentage
    online: number; // percentage
  };
}

// Products Types
export interface ProductMetric {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  priceChangeCount: number;
}

export interface ProductMetrics {
  topSellers: ProductMetric[];
  slowMovers: ProductMetric[];
  priceChanges: number;
  averagePriceByFranchise: number;
  inactiveProducts: number;
  deletedProducts: number;
}

// Inventory Types
export interface InventoryAlert {
  productId: string;
  productName: string;
  franchiseId: string;
  franchiseName: string;
  currentStock: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
}

export interface InventoryMetrics {
  lowStockProducts: InventoryAlert[];
  outOfStockByFranchise: {
    franchiseName: string;
    outOfStockCount: number;
  }[];
  totalAlerts: number;
}

// Customers & Loyalty Types
export const LoyaltyTier = {
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
} as const;

export type LoyaltyTier = (typeof LoyaltyTier)[keyof typeof LoyaltyTier];

export interface LoyaltyMetrics {
  totalPointsInCirculation: number;
  customersByTier: {
    [key in LoyaltyTier]: number;
  };
  earnVsRedeem: {
    earned: number;
    redeemed: number;
  };
  mostReturnedCustomers: {
    customerId: string;
    name: string;
    visitCount: number;
    totalSpent: number;
  }[];
}

// Staff & Shifts Types
export interface StaffMetrics {
  totalActive: number;
  absenceRate: number; // percentage
  completedShifts: number;
  breakdown: {
    managers: number;
    staff: number;
  };
}

// Audit & Control Types
export interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  changes: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export interface AuditMetrics {
  recentActions: AuditLog[];
  mostChangedEntities: {
    entityType: string;
    changeCount: number;
  }[];
  userActivitySummary: {
    user: string;
    actionCount: number;
  }[];
}

// Filter Types
export interface DashboardFilters {
  dateRange: 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  franchiseId?: string;
}
