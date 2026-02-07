import { useState } from 'react'

export interface FranchiseFilters {
  searchTerm: string
  statusFilter: string
}

export const useFranchiseFilters = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  return {
    filters: {
      searchTerm,
      statusFilter,
    },
    setSearchTerm,
    setStatusFilter,
    handleClearFilters,
  }
}
