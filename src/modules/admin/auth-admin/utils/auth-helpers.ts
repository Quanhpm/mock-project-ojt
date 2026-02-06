import { mockUsers } from '@/mockdata';

// Simplified role mapping since we'll add role and franchise_id directly to users
export const getRoleCode = (userId: number): string => {
  const user = mockUsers.find(u => u.id === userId);
  return user?.role || 'STAFF';
};

export const getFranchiseId = (userId: number): number | null => {
  const user = mockUsers.find(u => u.id === userId);
  return user?.franchise_id || null;
};

export const getUserInfo = (userId: number) => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    franchise_id: user.franchise_id,
    avatar_url: user.avatar_url
  };
};

// Check if user has access to specific franchise
export const hasAccessToFranchise = (userId: number, franchiseId: number): boolean => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return false;
  
  // Global admin can access all franchises
  if (user.role === 'GLOBAL_ADMIN') return true;
  
  // Other roles only access their own franchise
  return user.franchise_id === franchiseId;
};