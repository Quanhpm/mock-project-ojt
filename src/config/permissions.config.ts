// src/config/permissions.config.ts
type RoleCode = 'GLOBAL_ADMIN' | 'FRANCHISE_MANAGER' | 'STAFF' | 'WAREHOUSE';
type Module = 'dashboard' | 'users' | 'franchise' | 'products' | 'inventory' | 'customers' | 'orders' | 'shifts' | 'select-franchise';

export const ROLE_PERMISSIONS: Record<RoleCode, Module[]> = {
  GLOBAL_ADMIN: ['dashboard', 'users', 'franchise', 'products', 'inventory', 'customers', 'orders', 'shifts', 'select-franchise'],
  FRANCHISE_MANAGER: ['dashboard', 'products', 'inventory', 'customers', 'orders', 'shifts', 'select-franchise'],
  STAFF: ['dashboard', 'customers', 'orders', 'select-franchise'],
  WAREHOUSE: ['dashboard', 'inventory', 'products', 'select-franchise']
};

export const hasPermission = (roleCode: string, module: string): boolean => {
  return ROLE_PERMISSIONS[roleCode as RoleCode]?.includes(module as Module) || false;
};

export const getAvailableModules = (roleCode: string): Module[] => {
  return ROLE_PERMISSIONS[roleCode as RoleCode] || [];
};