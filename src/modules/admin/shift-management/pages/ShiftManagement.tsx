import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { shiftApi } from '@/apis/endpoints'
import type { BulkAssignShiftRequest } from '@/apis/endpoints/shift.api'
import { useAdminAuthStore, getRoleCode } from '@/modules/admin/auth-admin/stores/admin-auth.store'
import { useToast } from '@/hooks/use-toast.hook'
import {
  DailyAssignmentModal,
  DeleteShiftAssignmentDialog,
  EditShiftModal,
  PageHeader,
  QuickAssignShiftModal,
  ShiftCalendar,
  ShiftDayPanel,
  ShiftFilters,
  ShiftImportModal,
} from '../components'
import { useDailyAssignment, useShiftCalendar, useShiftFilters } from '../hooks'
import type {
  DailyShiftView,
  ShiftAssignmentStatus,
  ShiftAssignmentView,
} from '../hooks/useShiftCalendar.hook'
import { useShiftManagementStore } from '../stores/shift-management.store'

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateKey = (dateKey: string | null) => {
  if (!dateKey) return null
  return new Date(`${dateKey}T00:00:00`)
}

function ShiftManagement() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { success, error: showError, warning: showWarning } = useToast()
  const store = useAdminAuthStore()
  const roleCode = getRoleCode(store)
  const activeContext = useAdminAuthStore((state) => state.activeContext)
  const routeFranchiseId = searchParams.get('franchiseId')

  const selectedFranchiseId = useShiftManagementStore((state) => state.selectedFranchiseId)
  const setSelectedFranchiseId = useShiftManagementStore((state) => state.setSelectedFranchiseId)
  const selectedDateKey = useShiftManagementStore((state) => state.selectedDateKey)
  const setSelectedDate = useShiftManagementStore((state) => state.setSelectedDate)
  const viewMode = useShiftManagementStore((state) => state.viewMode)
  const toggleViewMode = useShiftManagementStore((state) => state.toggleViewMode)
  const dailyAssignment = useShiftManagementStore((state) => state.dailyAssignment)
  const openDailyAssignment = useShiftManagementStore((state) => state.openDailyAssignment)
  const closeDailyAssignment = useShiftManagementStore((state) => state.closeDailyAssignment)
  const resetShiftCalendarUi = useShiftManagementStore((state) => state.resetShiftCalendarUi)
  const [updatingAssignmentId, setUpdatingAssignmentId] = useState<string | null>(null)
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ShiftAssignmentView | null>(null)
  const [editingShift, setEditingShift] = useState<DailyShiftView | null>(null)
  const [isUpdatingShift, setIsUpdatingShift] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isImportingShifts, setIsImportingShifts] = useState(false)
  const [isQuickAssignModalOpen, setIsQuickAssignModalOpen] = useState(false)
  const [isQuickAssignSubmitting, setIsQuickAssignSubmitting] = useState(false)

  const resolvedFranchiseId =
    roleCode === 'MANAGER'
      ? activeContext?.franchise_id || routeFranchiseId || selectedFranchiseId
      : routeFranchiseId || selectedFranchiseId

  const {
    filters,
    setSearchTerm,
    setFranchiseFilter,
    setStaffFilter,
    setStatusFilter,
    handleClearFilters,
    isFranchiseLocked,
  } = useShiftFilters(resolvedFranchiseId)

  const {
    monthDate,
    setMonthDate,
    monthLabel,
    calendarDays,
    filteredAssignments,
    staffOptions,
    franchiseOptions,
    assignmentByDate,
    shiftGroupsByDate,
    visibleShiftGroupsByDate,
    selectedFranchiseName,
    shiftImportReferenceData,
    isLoading,
    error,
    reloadCalendarData,
  } = useShiftCalendar(filters, resolvedFranchiseId, viewMode)

  const selectedDate = parseDateKey(selectedDateKey)

  const selectedAssignments = useMemo(() => {
    if (!selectedDateKey) return []
    return assignmentByDate[selectedDateKey] || []
  }, [assignmentByDate, selectedDateKey])

  const selectedShifts = useMemo(() => {
    if (!selectedDateKey) return []
    return visibleShiftGroupsByDate[selectedDateKey] || []
  }, [selectedDateKey, visibleShiftGroupsByDate])

  const selectedShift = useMemo(() => {
    if (!dailyAssignment.shiftId || !dailyAssignment.workDate) return null

    return (
      shiftGroupsByDate[dailyAssignment.workDate]?.find(
        (shift) => shift.shiftId === dailyAssignment.shiftId,
      ) || null
    )
  }, [dailyAssignment.shiftId, dailyAssignment.workDate, shiftGroupsByDate])

  const quickAssignShiftOptions = useMemo(() => {
    return [...shiftImportReferenceData.shifts]
      .sort((left, right) => {
        const timeCompare = left.startTime.localeCompare(right.startTime)
        if (timeCompare !== 0) return timeCompare
        return left.shiftName.localeCompare(right.shiftName)
      })
      .map((shift) => ({
        id: shift.shiftId,
        label: `${shift.shiftName} · ${shift.startTime} - ${shift.endTime}`,
      }))
  }, [shiftImportReferenceData.shifts])

  const headerSummary = useMemo(() => {
    if (viewMode === 'shift') {
      const visibleShiftGroupCount = Object.values(visibleShiftGroupsByDate).reduce(
        (total, shifts) => total + shifts.length,
        0,
      )

      return {
        label: 'Visible Shift Groups',
        value: visibleShiftGroupCount,
      }
    }

    return {
      label: 'Total Assignments',
      value: filteredAssignments.length,
    }
  }, [filteredAssignments.length, viewMode, visibleShiftGroupsByDate])

  const quickAssignUserOptions = useMemo(() => {
    return [...shiftImportReferenceData.users]
      .sort((left, right) => left.userName.localeCompare(right.userName))
      .map((user) => ({
        id: user.userId,
        label: user.userEmail ? `${user.userName} · ${user.userEmail}` : user.userName,
      }))
  }, [shiftImportReferenceData.users])

  const quickAssignAssignedUserIdsByShiftId = useMemo<Record<string, string[]>>(() => {
    if (!selectedDateKey) return {}

    return (shiftGroupsByDate[selectedDateKey] || []).reduce<Record<string, string[]>>(
      (acc, shift) => {
        acc[shift.shiftId] = shift.assignments.map((assignment) => assignment.staffId)
        return acc
      },
      {},
    )
  }, [selectedDateKey, shiftGroupsByDate])

  const {
    assignableUsers,
    isUsersLoading,
    isSubmitting,
    handleAssignUser,
  } = useDailyAssignment(resolvedFranchiseId, selectedShift)

  useEffect(() => {
    if (resolvedFranchiseId && resolvedFranchiseId !== selectedFranchiseId) {
      setSelectedFranchiseId(resolvedFranchiseId)
    }
  }, [resolvedFranchiseId, selectedFranchiseId, setSelectedFranchiseId])

  useEffect(() => {
    if (dailyAssignment.isOpen && !isLoading && !selectedShift) {
      closeDailyAssignment()
    }
  }, [closeDailyAssignment, dailyAssignment.isOpen, isLoading, selectedShift])

  if (!resolvedFranchiseId) {
    return <Navigate to="/admin/shifts/select-franchise" replace />
  }

  const handleCreateShift = () => {
    navigate(`/admin/shifts/create?franchiseId=${resolvedFranchiseId}`)
  }

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true)
  }

  const handleOpenQuickAssignModal = () => {
    if (!selectedDateKey) return
    setIsQuickAssignModalOpen(true)
  }

  const handleChangeFranchise = () => {
    resetShiftCalendarUi()
    navigate('/admin/shifts/select-franchise')
  }

  const handlePrevMonth = () => {
    setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(formatDateKey(date))
  }

  const handleOpenShiftDetail = (shiftId: string, workDate: string) => {
    setSelectedDate(workDate)
    openDailyAssignment(shiftId, workDate)
  }

  const handleDailyAssignmentSubmit = async (values: { userId: string; note: string }) => {
    const isSuccess = await handleAssignUser(values.userId, values.note)

    if (isSuccess) {
      reloadCalendarData()
    }
  }

  const handleStatusChange = async (assignmentId: string, status: ShiftAssignmentStatus) => {
    setUpdatingAssignmentId(assignmentId)

    try {
      await shiftApi.changeShiftAssignmentStatus(assignmentId, { status })
      success('Shift assignment updated', `Status changed to ${status}.`)
      reloadCalendarData()
    } catch (updateError) {
      console.error('Failed to update assignment status:', updateError)
      showError('Failed to update assignment status', 'Please try again.')
    } finally {
      setUpdatingAssignmentId(null)
    }
  }

  const handleDeleteRequest = (assignment: ShiftAssignmentView) => {
    setDeleteTarget(assignment)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    setDeletingAssignmentId(deleteTarget.id)

    try {
      await shiftApi.deleteShiftAssignment(deleteTarget.id)
      success('Shift assignment deleted', `${deleteTarget.staffName} has been removed.`)
      reloadCalendarData()
      setDeleteTarget(null)
    } catch (deleteError) {
      console.error('Failed to delete assignment:', deleteError)
      showError('Failed to delete assignment', 'Please try again.')
    } finally {
      setDeletingAssignmentId(null)
    }
  }

  const handleEditShift = (shift: DailyShiftView) => {
    setEditingShift(shift)
  }

  const handleUpdateShift = async (values: {
    name: string
    startTime: string
    endTime: string
  }) => {
    if (!editingShift) return

    setIsUpdatingShift(true)

    try {
      await shiftApi.updateShift(editingShift.shiftId, {
        name: values.name.trim(),
        start_time: values.startTime,
        end_time: values.endTime,
      })
      success('Shift updated', `${values.name.trim()} has been saved.`)
      reloadCalendarData()
      setEditingShift(null)
    } catch (updateError) {
      console.error('Failed to update shift:', updateError)
      showError('Failed to update shift', 'Please try again.')
    } finally {
      setIsUpdatingShift(false)
    }
  }

  const handleBulkImport = async (payload: BulkAssignShiftRequest) => {
    setIsImportingShifts(true)

    try {
      const response = await shiftApi.bulkAssignShifts(payload)
      const createdCount = response?.created_count ?? payload.items.length
      const failedCount = response?.failed_count ?? 0

      if (failedCount > 0 && createdCount === 0) {
        const firstError = response?.errors?.[0]?.message || 'Please review the file and try again.'
        showError('Import failed', firstError)
        return false
      }

      if (createdCount > 0) {
        reloadCalendarData()
      }

      if (failedCount > 0) {
        const firstError = response?.errors?.[0]?.message
        showWarning(
          'Import completed with warnings',
          firstError
            ? `${createdCount} assignment(s) created, ${failedCount} failed. ${firstError}`
            : `${createdCount} assignment(s) created, ${failedCount} failed.`,
        )
        return false
      }

      success('Import completed', `${createdCount} shift assignment(s) created successfully.`)
      return true
    } catch (bulkImportError) {
      console.error('Failed to import shift assignments:', bulkImportError)
      showError('Import failed', 'Please try again.')
      return false
    } finally {
      setIsImportingShifts(false)
    }
  }

  const handleQuickAssignSubmit = async (values: {
    shiftId: string
    userId: string
  }) => {
    if (!selectedDateKey) return

    const assignedUserIds = new Set(quickAssignAssignedUserIdsByShiftId[values.shiftId] || [])
    if (assignedUserIds.has(values.userId)) {
      showWarning(
        'Assignment already exists',
        'This user is already assigned to the selected shift on this day.',
      )
      return
    }

    setIsQuickAssignSubmitting(true)

    try {
      await shiftApi.assignShiftToUser({
        shift_id: values.shiftId,
        user_id: values.userId,
        work_date: selectedDateKey,
      })
      success('Assignment created', `Shift assignment added for ${selectedDateKey}.`)
      reloadCalendarData()
      setIsQuickAssignModalOpen(false)
    } catch (quickAssignError) {
      console.error('Failed to create quick assignment:', quickAssignError)
      showError('Failed to create assignment', 'Please try again.')
    } finally {
      setIsQuickAssignSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen w-full">
      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        <PageHeader
          summaryLabel={headerSummary.label}
          summaryValue={headerSummary.value}
          viewMode={viewMode}
          selectedFranchiseName={selectedFranchiseName}
          onCreateShift={handleCreateShift}
          onImportExcel={handleOpenImportModal}
          onToggleViewMode={toggleViewMode}
          onChangeFranchise={roleCode === 'ADMIN' ? handleChangeFranchise : undefined}
          isImportDisabled={!resolvedFranchiseId || isLoading}
        />

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <ShiftFilters
            viewMode={viewMode}
            searchTerm={filters.searchTerm}
            franchiseFilter={filters.franchiseFilter}
            staffFilter={filters.staffFilter}
            statusFilter={filters.statusFilter}
            franchises={franchiseOptions}
            staff={staffOptions}
            isFranchiseLocked={isFranchiseLocked}
            selectedFranchiseName={selectedFranchiseName}
            onSearchChange={setSearchTerm}
            onFranchiseChange={setFranchiseFilter}
            onStaffChange={setStaffFilter}
            onStatusChange={setStatusFilter}
            onClearFilters={handleClearFilters}
          />

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              Loading shift calendar data...
            </div>
          )}

          <div className="grid grid-cols-1 items-stretch gap-6 xl:h-[calc(100vh-250px)] xl:grid-cols-3">
            <div className="xl:col-span-2 xl:min-h-0">
              <ShiftCalendar
                monthLabel={monthLabel}
                calendarDays={calendarDays}
                selectedDate={selectedDate}
                viewMode={viewMode}
                onSelectDate={handleSelectDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onOpenShiftDetail={(shift) => handleOpenShiftDetail(shift.shiftId, shift.workDate)}
              />
            </div>
            <div className="xl:col-span-1 xl:min-h-0">
              <ShiftDayPanel
                viewMode={viewMode}
                selectedDate={selectedDate}
                assignments={selectedAssignments}
                shifts={selectedShifts}
                onCreateAssignment={handleOpenQuickAssignModal}
                onOpenShiftDetail={(shift) => handleOpenShiftDetail(shift.shiftId, shift.workDate)}
                onEditShift={handleEditShift}
                onStatusChange={handleStatusChange}
                onDeleteAssignment={handleDeleteRequest}
                updatingAssignmentId={updatingAssignmentId}
                deletingAssignmentId={deletingAssignmentId}
              />
            </div>
          </div>
        </div>
      </main>

      <DailyAssignmentModal
        isOpen={dailyAssignment.isOpen}
        selectedShift={selectedShift}
        assignableUsers={assignableUsers}
        isUsersLoading={isUsersLoading}
        isSubmitting={isSubmitting}
        updatingAssignmentId={updatingAssignmentId}
        deletingAssignmentId={deletingAssignmentId}
        onClose={closeDailyAssignment}
        onSubmit={handleDailyAssignmentSubmit}
        onEditShift={handleEditShift}
        onStatusChange={handleStatusChange}
        onDeleteAssignment={handleDeleteRequest}
      />

      <DeleteShiftAssignmentDialog
        isOpen={Boolean(deleteTarget)}
        assignment={deleteTarget}
        isDeleting={Boolean(deletingAssignmentId)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <EditShiftModal
        isOpen={Boolean(editingShift)}
        shift={editingShift}
        isSubmitting={isUpdatingShift}
        onClose={() => setEditingShift(null)}
        onSubmit={handleUpdateShift}
      />

      <ShiftImportModal
        isOpen={isImportModalOpen}
        franchiseName={selectedFranchiseName}
        referenceData={shiftImportReferenceData}
        isReferenceLoading={isLoading}
        isSubmitting={isImportingShifts}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleBulkImport}
      />

      <QuickAssignShiftModal
        isOpen={isQuickAssignModalOpen}
        workDate={selectedDateKey}
        shiftOptions={quickAssignShiftOptions}
        userOptions={quickAssignUserOptions}
        assignedUserIdsByShiftId={quickAssignAssignedUserIdsByShiftId}
        isSubmitting={isQuickAssignSubmitting}
        onClose={() => setIsQuickAssignModalOpen(false)}
        onSubmit={handleQuickAssignSubmit}
      />
    </div>
  )
}

export default ShiftManagement
