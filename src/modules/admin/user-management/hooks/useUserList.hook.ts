import { useState, useMemo } from 'react'
import type { UserWithRolesAndFranchises } from '@/mockdata'
import type { UserFilters } from './useUserFilters.hook'

export type User = UserWithRolesAndFranchises

export const useUserList = (filters: UserFilters, users: User[]) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const matchesSearch =
        filters.searchTerm === '' ||
        user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchTerm.toLowerCase())

      // Status filter
      const matchesStatus =
        filters.statusFilter === 'all' ||
        (filters.statusFilter === 'active' && user.is_active) ||
        (filters.statusFilter === 'inactive' && !user.is_active)

      // Role filter
      const matchesRole =
        filters.roleFilter === 'all' ||
        user.roles.some((role) => {
          if (filters.roleFilter === 'manager') return role.roleCode === 'FRANCHISE_MANAGER'
          if (filters.roleFilter === 'barista') return role.roleCode === 'STAFF'
          if (filters.roleFilter === 'admin') return role.roleCode === 'SUPER_ADMIN'
          return false
        })

      // Franchise filter
      const matchesFranchise =
        filters.franchiseFilter === 'all' ||
        user.roles.some((role) => {
          if (!role.franchiseId) return filters.franchiseFilter === 'global'
          return role.franchiseId.toString() === filters.franchiseFilter
        })

      return matchesSearch && matchesStatus && matchesRole && matchesFranchise
    })
  }, [users, filters])

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, currentPage])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  return {
    users: paginatedUsers,
    totalUsers: filteredUsers.length,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
  }
}
