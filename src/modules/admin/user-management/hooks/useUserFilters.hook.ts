import { useState } from 'react'

export interface UserFilters {
  searchTerm: string
  roleFilter: string
  franchiseFilter: string
  statusFilter: string
}

export const useUserFilters = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [franchiseFilter, setFranchiseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleClearFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setFranchiseFilter('all')
    setStatusFilter('all')
  }

  return {
    filters: {
      searchTerm,
      roleFilter,
      franchiseFilter,
      statusFilter,
    },
    setSearchTerm,
    setRoleFilter,
    setFranchiseFilter,
    setStatusFilter,
    handleClearFilters,
  }
}
