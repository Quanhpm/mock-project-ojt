// src/routes/admin/AdminRoleMenu.tsx
import { ADMIN_MENU} from './Admin.menu';
import type {AdminMenuItem} from './Admin.menu';
import { hasPermission } from '@/config/permissions.config';
import { useAdminAuthStore, getRoleCode } from '@/modules/admin/auth-admin/stores/admin-auth.store';

const canAccessMenuItem = (menuItem: AdminMenuItem, roleCode: string) => {
  if (!hasPermission(roleCode, menuItem.module)) {
    return false;
  }

  if (menuItem.allowedRoles && !menuItem.allowedRoles.includes(roleCode as typeof menuItem.allowedRoles[number])) {
    return false;
  }

  return true;
};

export const useRoleBasedMenu = (): AdminMenuItem[] => {
  const store = useAdminAuthStore();
  const roleCode = getRoleCode(store);
  
  if (!roleCode) return [];
  
  return ADMIN_MENU.filter(menuItem => 
    canAccessMenuItem(menuItem, roleCode) && 
    !menuItem.hideFromSidebar 
  );
};

export const getMenuByRole = (roleCode: string): AdminMenuItem[] => {
  return ADMIN_MENU.filter(menuItem => 
    canAccessMenuItem(menuItem, roleCode) && 
    !menuItem.hideFromSidebar 
  );
};

// Hook to check specific permission
export const usePermission = () => {
  const store = useAdminAuthStore();
  const roleCode = getRoleCode(store);
  
  return {
    hasPermission: (module: string) => hasPermission(roleCode || '', module),
    roleCode,
    canAccess: (module: string) => hasPermission(roleCode || '', module)
  };
};
