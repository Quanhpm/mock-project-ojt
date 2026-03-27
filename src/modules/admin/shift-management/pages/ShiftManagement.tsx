import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { DndContext, pointerWithin, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
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
  ShiftDailyTimeline,
  ShiftDayPanel,
  ShiftFilters,
  ShiftImportModal,
  StaffSidebar,
} from '../components'
import { useDailyAssignment, useShiftCalendar, useShiftFilters } from '../hooks'
import type {
  DailyShiftView,
  ShiftAssignmentStatus,
  ShiftAssignmentView,
} from '../hooks/useShiftCalendar.hook'
import { useShiftManagementStore } from '../stores/shift-management.store'
import {
  extractBackendMessage,
  formatDateKey,
  isPastDate,
  isPastDateKey,
  parseDateKey,
} from '../utils/shift.helpers'

interface ActiveDragUser {
  userId: string
  userName: string
}

function ShiftManagement() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { success, error: showError, warning: showWarning } = useToast()
  const store = useAdminAuthStore()
  const roleCode = getRoleCode(store)
  const activeContext = useAdminAuthStore((state) => state.activeContext)
  const adminUser = useAdminAuthStore((state) => state.admin)
  const routeFranchiseId = searchParams.get('franchiseId')

  const isStaff = roleCode === 'STAFF'
  const staffUserId = adminUser?.id ?? null

  const selectedFranchiseId = useShiftManagementStore((state) => state.selectedFranchiseId)
  const setSelectedFranchiseId = useShiftManagementStore((state) => state.setSelectedFranchiseId)
  const selectedDateKey = useShiftManagementStore((state) => state.selectedDateKey)
  const setSelectedDate = useShiftManagementStore((state) => state.setSelectedDate)
  const viewMode = useShiftManagementStore((state) => state.viewMode)
  const toggleViewMode = useShiftManagementStore((state) => state.toggleViewMode)
  const calendarType = useShiftManagementStore((state) => state.calendarType)
  const setCalendarType = useShiftManagementStore((state) => state.setCalendarType)
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

  const [hoveredDateKey, setHoveredDateKey] = useState<string | null>(null)
  const [activeDragUser, setActiveDragUser] = useState<ActiveDragUser | null>(null)
  const [isAssignMode, setIsAssignMode] = useState(false)
  const [closeSignal, setCloseSignal] = useState(0)

  const resolvedFranchiseId =
    roleCode === 'ADMIN'
      ? routeFranchiseId || selectedFranchiseId
      : activeContext?.franchise_id || routeFranchiseId || selectedFranchiseId

  const {
    filters,
    setSearchTerm,
    setFranchiseFilter,
    setStaffFilter,
    setStatusFilter,
    handleClearFilters,
    isFranchiseLocked,
  } = useShiftFilters(resolvedFranchiseId)

  // Nếu là STAFF: tự động lock staffFilter theo userId của chính họ
  useEffect(() => {
    if (isStaff && staffUserId) {
      setStaffFilter(staffUserId)
    }
  }, [isStaff, staffUserId, setStaffFilter])

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
    shiftAssignmentLookupData,
    isLoading,
    error,
    reloadCalendarData,
  } = useShiftCalendar(filters, resolvedFranchiseId, viewMode)

  const selectedDate = parseDateKey(selectedDateKey)
  const selectedDateIsPast = selectedDate ? isPastDate(selectedDate) : false

  const selectedAssignments = useMemo(() => {
    if (!selectedDateKey) return []
    return assignmentByDate[selectedDateKey] || []
  }, [assignmentByDate, selectedDateKey])

  const selectedShifts = useMemo(() => {
    if (!selectedDateKey) return []
    const dayData = calendarDays.find((d) => formatDateKey(d.date) === selectedDateKey)
    return dayData ? dayData.shifts : (visibleShiftGroupsByDate[selectedDateKey] || [])
  }, [selectedDateKey, calendarDays, visibleShiftGroupsByDate])

  const selectedShift = useMemo(() => {
    if (!dailyAssignment.shiftId || !dailyAssignment.workDate) return null

    return (
      shiftGroupsByDate[dailyAssignment.workDate]?.find(
        (shift) => shift.shiftId === dailyAssignment.shiftId,
      ) || null
    )
  }, [dailyAssignment.shiftId, dailyAssignment.workDate, shiftGroupsByDate])

  const quickAssignShiftOptions = useMemo(() => {
    return [...shiftAssignmentLookupData.shifts]
      .sort((left, right) => {
        const timeCompare = left.startTime.localeCompare(right.startTime)
        if (timeCompare !== 0) return timeCompare
        return left.shiftName.localeCompare(right.shiftName)
      })
      .map((shift) => ({
        id: shift.shiftId,
        label: `${shift.shiftName} · ${shift.startTime} - ${shift.endTime}`,
      }))
  }, [shiftAssignmentLookupData.shifts])

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
    return [...shiftAssignmentLookupData.users]
      .sort((left, right) => left.userName.localeCompare(right.userName))
      .map((user) => ({
        id: user.userId,
        label: user.userEmail ? `${user.userName} · ${user.userEmail}` : user.userName,
      }))
  }, [shiftAssignmentLookupData.users])

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
  } = useDailyAssignment(isStaff ? null : resolvedFranchiseId, isStaff ? null : selectedShift)

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
    if (!selectedDateKey || selectedDateIsPast) return
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
    if (isPastDate(date)) return
    setSelectedDate(formatDateKey(date))
  }

  const handleOpenShiftDetail = (shiftId: string, workDate: string) => {
    if (isPastDateKey(workDate)) return

    if (isStaff) {
      setSelectedDate(workDate)
      return
    }

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
      showError(
        'Failed to update assignment status',
        extractBackendMessage(updateError, 'Please try again.'),
      )
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
      showError('Failed to delete assignment', extractBackendMessage(deleteError, 'Please try again.'))
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
      showError('Failed to update shift', extractBackendMessage(updateError, 'Please try again.'))
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
      showError('Import failed', extractBackendMessage(bulkImportError, 'Please try again.'))
      return false
    } finally {
      setIsImportingShifts(false)
    }
  }

  const handleQuickAssignSubmit = async (values: {
    shiftId: string
    userId: string
  }) => {
    if (!selectedDateKey || selectedDateIsPast) return

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
      showError(
        'Failed to create assignment',
        extractBackendMessage(quickAssignError, 'Please try again.'),
      )
    } finally {
      setIsQuickAssignSubmitting(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current
    if (!activeData) return

    const type = activeData?.type
    if (type === 'user' || type === 'assignment') {
      setActiveDragUser(activeData.user as ActiveDragUser)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const overData = event.over?.data.current
    if (overData?.type === 'date') {
      if (isPastDateKey(overData.date)) {
        setHoveredDateKey(null)
        return
      }

      setHoveredDateKey(overData.date)
    } else if (overData?.type === 'shift') {
      if (isPastDateKey(overData.workDate)) {
        setHoveredDateKey(null)
        return
      }

      setHoveredDateKey(overData.workDate)
    } else {
      setHoveredDateKey(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragUser(null)
    setHoveredDateKey(null)

    try {
      const overData = event.over?.data.current
      const activeData = event.active.data.current

      if (!overData || !activeData) return

      if (overData.type === 'date' && isPastDateKey(overData.date)) return
      if (overData.type === 'shift' && isPastDateKey(overData.workDate)) return

      if (overData.type === 'shift') {
        const shiftId = overData.shiftId
        const workDate = overData.workDate

        if (activeData.type === 'user') {
          const userId = activeData.user.userId
          const assignedIds = quickAssignAssignedUserIdsByShiftId[shiftId] || []

          if (assignedIds.includes(userId)) {
            showWarning('Đã tồn tại', 'Nhân viên này đã được phân công vào ca này.')
            return
          }

          try {
            await shiftApi.assignShiftToUser({
              shift_id: shiftId,
              user_id: userId,
              work_date: workDate,
            })
            success('Gán nhân viên thành công', `Đã phân công ${activeData.user.userName}.`)
            reloadCalendarData()
          } catch (assignError) {
            showError(
              'Gán nhân viên thất bại',
              extractBackendMessage(assignError, 'Vui lòng thử lại.'),
            )
          }
        } else if (activeData.type === 'assignment') {
          const userId = activeData.user.userId
          const oldAssignmentId = activeData.assignmentId
          const oldShiftId = activeData.shiftId
          const oldWorkDate = activeData.workDate

          if (oldShiftId === shiftId && oldWorkDate === workDate) {
            return
          }

          const assignedIds = quickAssignAssignedUserIdsByShiftId[shiftId] || []
          if (assignedIds.includes(userId)) {
            showWarning('Đã tồn tại', 'Nhân viên này đã được phân công vào ca này.')
            return
          }

          try {
            await shiftApi.deleteShiftAssignment(oldAssignmentId)
            await shiftApi.assignShiftToUser({
              shift_id: shiftId,
              user_id: userId,
              work_date: workDate,
            })
            success('Chuyển ca thành công', `Đã chuyển ${activeData.user.userName} sang ca mới.`)
            reloadCalendarData()
          } catch (moveError) {
            showError('Chuyển ca thất bại', extractBackendMessage(moveError, 'Vui lòng thử lại.'))
          }
        }
      }
    } finally {
      // Đóng modal bất kể thả vào đâu
      setCloseSignal((prev) => prev + 1)
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col overflow-x-hidden">
      <main className="relative flex min-h-[100dvh] flex-1 flex-col overflow-x-hidden">
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
          showImportButton={!isStaff}
          showCreateShiftButton={!isStaff}
        />

        <DndContext
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          autoScroll={{
            threshold: { x: 0.2, y: 0.2 },
            acceleration: 15,
            interval: 5,
          }}
        >
          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 sm:px-6 lg:px-8 lg:pb-8 lg:pt-4">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap rounded-xl bg-slate-100 p-1 ring-1 ring-inset ring-slate-200">
                <button
                  onClick={() => setCalendarType('month')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                    calendarType === 'month'
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  Monthly Grid
                </button>
                <button
                  onClick={() => {
                    setCalendarType('day')
                    if (!selectedDateKey) {
                      setSelectedDate(formatDateKey(new Date()))
                    }
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                    calendarType === 'day'
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">view_timeline</span>
                  Daily Timeline
                </button>
              </div>

              {/* Nút Quick Assign: ẩn với STAFF */}
              {!isStaff && (
                <button
                  onClick={() => setIsAssignMode(!isAssignMode)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors lg:w-fit ${
                    isAssignMode
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 relative'
                  }`}
                >
                  {!isAssignMode && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  )}
                  <span className="material-symbols-outlined text-[20px]">group_add</span>
                  Chế độ Kéo thả Nhanh
                </button>
              )}

              {/* Banner lịch cá nhân cho STAFF */}
              {isStaff && (
                <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Lịch làm việc cá nhân
                </div>
              )}
            </div>

            {/* Filters: ẩn với STAFF vì họ chỉ xem lịch của chính mình */}
            {!isStaff && (
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
            )}

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

            <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-3 xl:items-stretch xl:min-h-[calc(100dvh-250px)]">
              <div className="xl:col-span-2 xl:min-h-0">
                {calendarType === 'month' ? (
                  <ShiftCalendar
                    monthLabel={monthLabel}
                    calendarDays={calendarDays}
                  selectedDate={selectedDate}
                  viewMode={viewMode}
                  hoveredDateKey={hoveredDateKey}
                  closeSignal={closeSignal}
                  onSelectDate={handleSelectDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onOpenShiftDetail={(shift) => handleOpenShiftDetail(shift.shiftId, shift.workDate)}
                />
                ) : (
                  <ShiftDailyTimeline
                    selectedDay={calendarDays.find((d) => formatDateKey(d.date) === selectedDateKey)}
                    onSelectDate={handleSelectDate}
                    onOpenShiftDetail={isStaff || selectedDateIsPast ? undefined : (shift) => handleOpenShiftDetail(shift.shiftId, shift.workDate)}
                  />
                )}
              </div>
              <div className="xl:col-span-1 xl:min-h-0">
                {/* STAFF không có sidebar kéo thả, chỉ xem panel ngày */}
                {isAssignMode && !isStaff ? (
                  <StaffSidebar franchiseId={resolvedFranchiseId} />
                ) : (
                  <ShiftDayPanel
                    viewMode={isStaff ? 'assignment' : viewMode}
                    selectedDate={selectedDate}
                    assignments={selectedAssignments}
                    shifts={selectedShifts}
                    onCreateAssignment={isStaff || selectedDateIsPast ? undefined : handleOpenQuickAssignModal}
                    onOpenShiftDetail={isStaff || selectedDateIsPast ? undefined : (shift) => handleOpenShiftDetail(shift.shiftId, shift.workDate)}
                    onEditShift={isStaff ? undefined : handleEditShift}
                    onStatusChange={isStaff ? undefined : handleStatusChange}
                    onDeleteAssignment={isStaff ? undefined : handleDeleteRequest}
                    updatingAssignmentId={updatingAssignmentId}
                    deletingAssignmentId={deletingAssignmentId}
                  />
                )}
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeDragUser ? (
              <div className="group flex cursor-grabbing items-center gap-3 rounded-xl border border-primary bg-white p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] opacity-95 w-[240px]">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {activeDragUser.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-h-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{activeDragUser.userName}</p>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {!isStaff && (
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
      )}

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

      {!isStaff && (
        <ShiftImportModal
          isOpen={isImportModalOpen}
          franchiseName={selectedFranchiseName}
          lookupData={shiftAssignmentLookupData}
          isLookupLoading={isLoading}
          isSubmitting={isImportingShifts}
          onClose={() => setIsImportModalOpen(false)}
          onSubmit={handleBulkImport}
        />
      )}

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
