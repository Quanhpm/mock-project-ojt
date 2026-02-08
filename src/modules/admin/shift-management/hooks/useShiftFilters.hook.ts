import { useState } from 'react'

export interface ShiftFilters {
  searchTerm: string
  franchiseFilter: string
  staffFilter: string
  statusFilter: string
}

export const useShiftFilters = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [franchiseFilter, setFranchiseFilter] = useState('all')
  const [staffFilter, setStaffFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleClearFilters = () => {
    setSearchTerm('')
    setFranchiseFilter('all')
    setStaffFilter('all')
    setStatusFilter('all')
  }

  return {
    filters: {
      searchTerm,
      franchiseFilter,
      staffFilter,
      statusFilter,
    },
    setSearchTerm,
    setFranchiseFilter,
    setStaffFilter,
    setStatusFilter,
    handleClearFilters,
  }
}
