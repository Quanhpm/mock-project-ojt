// Export all mock data
export { mockUsers, mockCurrentUser } from './users.mock'
export { mockRoles } from './roles.mock'
export { mockFranchises } from './franchises.mock'
export { mockUserFranchiseRoles } from './user-franchise-roles.mock'
export { mockProducts } from './products.mock'
export { mockCarts } from './carts.mock'

// Import for internal use
import { mockUsers } from './users.mock'
import { mockRoles } from './roles.mock'
import { mockFranchises } from './franchises.mock'
import { mockUserFranchiseRoles } from './user-franchise-roles.mock'

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
      roles,
    }
  })
}

// Helper to get primary role (first role) for a user
export const getUserPrimaryRole = (userId: number) => {
  const userWithRoles = getUsersWithRolesAndFranchises().find((u) => u.id === userId)
  return userWithRoles?.roles[0] || null
}
