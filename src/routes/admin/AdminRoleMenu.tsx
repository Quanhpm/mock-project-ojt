// src/routes/admin/AdminRoleMenu.tsx
import { ADMIN_MENU} from './Admin.menu';
import type {AdminMenuItem} from './Admin.menu';
import { hasPermission } from '@/config/permissions.config';
import { useAdminAuthStore } from '@/modules/admin/auth-admin/stores/admin-auth.store';

export const useRoleBasedMenu = (): AdminMenuItem[] => {
  const { roleCode } = useAdminAuthStore();
  
  if (!roleCode) return [];
  
  return ADMIN_MENU.filter(menuItem => 
    hasPermission(roleCode, menuItem.module) && 
    !menuItem.hideFromSidebar 
  );
};

export const getMenuByRole = (roleCode: string): AdminMenuItem[] => {
  return ADMIN_MENU.filter(menuItem => 
    hasPermission(roleCode, menuItem.module) && 
    !menuItem.hideFromSidebar 
  );
};

// Hook to check specific permission
export const usePermission = () => {
  const { roleCode } = useAdminAuthStore();
  
  return {
    hasPermission: (module: string) => hasPermission(roleCode || '', module),
    roleCode,
    canAccess: (module: string) => hasPermission(roleCode || '', module)
  };
};