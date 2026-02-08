import React, { useState } from 'react'
import {
  PageHeader,
  ShiftCalendar,
  ShiftDayPanel,
  ShiftFilters,
  CreateShiftAssignmentModal,
} from '../components'
import { useShiftCalendar, useShiftFilters } from '../hooks'

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function ShiftManagement() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const {
    filters,
    setSearchTerm,
    setFranchiseFilter,
    setStaffFilter,
    setStatusFilter,
    handleClearFilters,
  } = useShiftFilters()

  const {
    monthDate,
    setMonthDate,
    monthLabel,
    calendarDays,
    filteredAssignments,
    staffOptions,
    franchiseOptions,
    shiftOptions,
    assignmentByDate,
  } = useShiftCalendar(filters)

  const handleCreateAssignment = () => {
    setIsCreateModalOpen(true)
  }

  const handleSaveAssignment = (payload: {
    workDate: string
    shiftId: number
    staffId: number
    status: 'ASSIGNED' | 'COMPLETED' | 'ABSENT'
    note: string
  }) => {
    console.log('New assignment', payload)
  }

  const handlePrevMonth = () => {
    setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))
  }

  const selectedAssignments = selectedDate
    ? assignmentByDate[formatDateKey(selectedDate)] || []
    : []

  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PageHeader
          totalAssignments={filteredAssignments.length}
          onCreateAssignment={handleCreateAssignment}
        />

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <ShiftFilters
            searchTerm={filters.searchTerm}
            franchiseFilter={filters.franchiseFilter}
            staffFilter={filters.staffFilter}
            statusFilter={filters.statusFilter}
            franchises={franchiseOptions}
            staff={staffOptions}
            onSearchChange={setSearchTerm}
            onFranchiseChange={setFranchiseFilter}
            onStaffChange={setStaffFilter}
            onStatusChange={setStatusFilter}
            onClearFilters={handleClearFilters}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ShiftCalendar
                monthLabel={monthLabel}
                calendarDays={calendarDays}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
            </div>
            <div className="xl:col-span-1">
              <ShiftDayPanel selectedDate={selectedDate} assignments={selectedAssignments} />
            </div>
          </div>
        </div>
      </main>

      <CreateShiftAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveAssignment}
        franchises={franchiseOptions}
        staff={staffOptions}
        shifts={shiftOptions}
      />
    </div>
  )
}

export default ShiftManagement
