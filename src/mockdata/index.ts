// Mock Data Index - Export all mock data
import franchises from './franchises.json';
import roles from './roles.json';
import users from './users.json';
import userFranchiseRole from './user_franchise_role.json';
import products from './products.json';
import productFranchise from './product_franchise.json';
import categories from './categories.json';
import categoryFranchise from './category_franchise.json';
import productCategoryFranchise from './product_category_franchise.json';
import customers from './customers.json';
import customerFranchise from './customer_franchise.json';
import inventory from './inventory.json';
import orders from './orders.json';
import orderItems from './order_items.json';
import shifts from './shifts.json';
import shiftAssignments from './shift_assignments.json';
import promotions from './promotions.json';
import orderStatusLogs from './order_status_logs.json';
import loyaltyTransactions from './loyalty_transactions.json';
import auditLogs from './audit_logs.json';

// Backward compatibility exports (matching old mock/data structure)
export const mockUsers = users;
export const mockCurrentUser = users[0]; // Admin user
export const mockRoles = roles;
export const mockFranchises = franchises;
export const mockUserFranchiseRoles = userFranchiseRole;
export const mockProducts = products;
export const mockCategories = categories;

// Utility types for joined data
export interface UserWithRolesAndFranchises {
  id: number
  email: string
  password_hash: string
  name: string
  phone: string
  avatar_url: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  roles: Array<{
    roleId: number
    roleCode: string
    roleName: string
    roleScope: string
    franchiseId: number | null
    franchiseCode: string | null
    franchiseName: string | null
  }>
}

// Helper function to get users with their roles and franchises
export const getUsersWithRolesAndFranchises = (): UserWithRolesAndFranchises[] => {
  return mockUsers.map((user) => {
    // Find all user_franchise_role entries for this user
    const userRoleEntries = mockUserFranchiseRoles.filter(
      (ufr) => ufr.user_id === user.id && !ufr.is_deleted
    )

    // Map to get full role and franchise details
    const roles = userRoleEntries.map((ufr) => {
      const role = mockRoles.find((r) => r.id === ufr.role_id)
      const franchise = ufr.franchise_id
        ? mockFranchises.find((f) => f.id === ufr.franchise_id)
        : null

      return {
        roleId: role?.id || 0,
        roleCode: role?.code || '',
        roleName: role?.name || '',
        roleScope: role?.scope || '',
        franchiseId: franchise?.id || null,
        franchiseCode: franchise?.code || null,
        franchiseName: franchise?.name || null,
      }
    })

    return {
      ...user,
      password_hash: user.password || '',
      roles,
    } as UserWithRolesAndFranchises
  })
}

// Helper to get primary role (first role) for a user
export const getUserPrimaryRole = (userId: number) => {
  const userWithRoles = getUsersWithRolesAndFranchises().find((u) => u.id === userId)
  return userWithRoles?.roles[0] || null
}

export const mockData = {
  // Core Data
  franchises,
  roles,
  users,
  userFranchiseRole,
  
  // Product & Menu
  products,
  productFranchise,
  categories,
  categoryFranchise,
  productCategoryFranchise,
  
  // Customer
  customers,
  customerFranchise,
  
  // Inventory & Orders
  inventory,
  orders,
  orderItems,
  
  // Operations
  shifts,
  shiftAssignments,
  promotions,
  
  // Logs & Audit
  orderStatusLogs,
  loyaltyTransactions,
  auditLogs,
};

export default mockData;

export {
  // Core
  franchises,
  roles,
  users,
  userFranchiseRole,
  
  // Product
  products,
  productFranchise,
  categories,
  categoryFranchise,
  productCategoryFranchise,
  
  // Customer
  customers,
  customerFranchise,
  
  // Operations
  inventory,
  orders,
  orderItems,
  shifts,
  shiftAssignments,
  promotions,
  
  // Logs
  orderStatusLogs,
  loyaltyTransactions,
  auditLogs,
};