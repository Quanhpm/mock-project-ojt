import { useState } from 'react'
import type { UserWithRoles } from './useUserList'

interface UseUserFiltersReturn {
  search: string
  selectedRole: string
  selectedFranchise: string
  selectedStatus: string
  filteredUsers: UserWithRoles[]
  setSearch: (value: string) => void
  setSelectedRole: (value: string) => void
  setSelectedFranchise: (value: string) => void
  setSelectedStatus: (value: string) => void
  clearFilters: () => void
}

export function useUserFilters(users: UserWithRoles[]): UseUserFiltersReturn {
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedFranchise, setSelectedFranchise] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Filter users based on criteria
  const filteredUsers = users.filter((user) => {
    // Search filter (by name or email)
    if (search && !user.name.toLowerCase().includes(search.toLowerCase()) && !user.email.toLowerCase().includes(search.toLowerCase())) {
      return false
    }

    // Role filter
    if (selectedRole && !user.roles.some((r) => r.role_code === selectedRole)) {
      return false
    }

    // Franchise filter
    if (selectedFranchise && !user.roles.some((r) => r.franchise_id === parseInt(selectedFranchise))) {
      return false
    }

    // Status filter
    if (selectedStatus === 'active' && !user.is_active) {
      return false
    }
    if (selectedStatus === 'inactive' && user.is_active) {
      return false
    }

    return true
  })

  const clearFilters = () => {
    setSearch('')
    setSelectedRole('')
    setSelectedFranchise('')
    setSelectedStatus('')
  }

  return {
    search,
    selectedRole,
    selectedFranchise,
    selectedStatus,
    filteredUsers,
    setSearch,
    setSelectedRole,
    setSelectedFranchise,
    setSelectedStatus,
    clearFilters
  }
}
