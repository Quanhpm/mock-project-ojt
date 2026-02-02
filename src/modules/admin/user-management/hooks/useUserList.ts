import { useState, useMemo } from 'react'
import { mockUsers } from '@/mock/data/users.mock'
import { mockRoles } from '@/mock/data/roles.mock'
import { mockFranchises } from '@/mock/data/franchises.mock'
import { mockUserFranchiseRoles } from '@/mock/data/user-franchise-roles.mock'

export interface UserWithRoles {
  id: number
  email: string
  name: string
  phone: string
  avatar_url: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  roles: Array<{
    franchise_id: number | null
    franchise_name: string
    role_id: number
    role_code: string
    role_name: string
  }>
  primaryRole?: {
    role_code: string
    role_name: string
    franchise_name?: string
  }
}

interface UseUserListReturn {
  users: UserWithRoles[]
  roles: Array<{ id: number; code: string; name: string }>
  franchises: Array<{ id: number; name: string }>
  loading: boolean
  error: string | null
  totalUsers: number
}

export function useUserList(): UseUserListReturn {
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  // Enrich users with role and franchise information
  const enrichedUsers = useMemo(() => {
    return mockUsers
      .filter((user) => !user.is_deleted)
      .map((user) => {
        // Get all user_franchise_roles for this user
        const userRoles = mockUserFranchiseRoles.filter(
          (ufr) => ufr.user_id === user.id && !ufr.is_deleted
        )

        // Map user_franchise_roles to enriched format
        const enrichedRoles = userRoles.map((ufr) => {
          const role = mockRoles.find((r) => r.id === ufr.role_id)
          const franchise = mockFranchises.find((f) => f.id === ufr.franchise_id)

          return {
            franchise_id: ufr.franchise_id,
            franchise_name: franchise?.name || 'Global',
            role_id: ufr.role_id,
            role_code: role?.code || '',
            role_name: role?.name || ''
          }
        })

        // Get primary role (first role or main role)
        const primaryRole = enrichedRoles[0]

        return {
          ...user,
          roles: enrichedRoles,
          primaryRole: primaryRole
            ? {
                role_code: primaryRole.role_code,
                role_name: primaryRole.role_name,
                franchise_name: primaryRole.franchise_name
              }
            : undefined
        }
      })
  }, [])

  const rolesList = mockRoles.filter((r) => !r.is_deleted)
  const franchisesList = mockFranchises.filter((f) => !f.is_deleted)

  return {
    users: enrichedUsers,
    roles: rolesList.map((r) => ({ id: r.id, code: r.code, name: r.name })),
    franchises: franchisesList.map((f) => ({ id: f.id, name: f.name })),
    loading,
    error,
    totalUsers: enrichedUsers.length
  }
}
