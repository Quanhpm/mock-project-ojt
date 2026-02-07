// src/config/permissions.config.ts
type RoleCode = 'GLOBAL_ADMIN' | 'FRANCHISE_MANAGER' | 'STAFF' | 'WAREHOUSE';
type Module = 'dashboard' | 'users' | 'franchise' | 'products' | 'inventory' | 'customers' | 'orders' | 'shifts';

export const ROLE_PERMISSIONS: Record<RoleCode, Module[]> = {
  GLOBAL_ADMIN: ['dashboard', 'users', 'franchise', 'products', 'inventory', 'customers', 'orders', 'shifts'],
  FRANCHISE_MANAGER: ['dashboard', 'products', 'inventory', 'customers', 'orders', 'shifts'],
  STAFF: ['dashboard', 'customers', 'orders'],
  WAREHOUSE: ['dashboard', 'inventory', 'products']
};

export const hasPermission = (roleCode: string, module: string): boolean => {
  return ROLE_PERMISSIONS[roleCode as RoleCode]?.includes(module as Module) || false;
};

export const getAvailableModules = (roleCode: string): Module[] => {
  return ROLE_PERMISSIONS[roleCode as RoleCode] || [];
};