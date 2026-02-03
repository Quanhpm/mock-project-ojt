import { useState, useEffect, useMemo } from 'react'
import { mockUsers } from '@/mock/data/users.mock'
import type { UserFilters } from './useUserFilters.hook'

export interface User {
  id: number
  email: string
  name: string
  phone: string
  avatar_url: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export const useUserList = (filters: UserFilters) => {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    // Load mock data
    setUsers(mockUsers)
  }, [])

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

      // You can add more filter logic here for role and franchise
      // For now, we'll just check search and status

      return matchesSearch && matchesStatus
    })
  }, [users, filters])

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, currentPage])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const toggleUserStatus = (userId: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, is_active: !user.is_active } : user
      )
    )
  }

  return {
    users: paginatedUsers,
    totalUsers: filteredUsers.length,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    toggleUserStatus,
  }
}
