import { useState } from 'react'

export interface ShiftFilters {
  searchTerm: string
  franchiseFilter: string
  staffFilter: string
  statusFilter: string
}

export const useShiftFilters = (lockedFranchiseId?: string | null) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [localFranchiseFilter, setLocalFranchiseFilter] = useState('all')
  const [staffFilter, setStaffFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const franchiseFilter = lockedFranchiseId || localFranchiseFilter

  const setFranchiseFilter = (value: string) => {
    if (lockedFranchiseId) return
    setLocalFranchiseFilter(value)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setLocalFranchiseFilter('all')
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
    isFranchiseLocked: Boolean(lockedFranchiseId),
  }
}
