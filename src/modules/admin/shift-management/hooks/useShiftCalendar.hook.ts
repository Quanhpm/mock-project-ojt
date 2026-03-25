import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getFranchisesSelect,
  searchUserFranchiseRoles,
  searchUsers,
  shiftApi,
} from '@/apis/endpoints'
import type {
  FranchiseOptionItem,
  ShiftAssignmentItem,
  ShiftAssignmentStatus as ApiShiftAssignmentStatus,
  ShiftItem,
  UserFranchiseRoleItem,
  UserItem,
} from '@/apis/endpoints'
import type { ShiftFilters } from './useShiftFilters.hook'
import type { ShiftAssignmentLookupData } from '../utils/shift-import.excel'
import type { ShiftCalendarViewMode } from '../stores/shift-management.store'
import { getRoleCode, useAdminAuthStore } from '@/modules/admin/auth-admin/stores/admin-auth.store'

export type ShiftAssignmentStatus = ApiShiftAssignmentStatus

export interface ShiftAssignmentView {
  id: string
  workDate: string
  status: ShiftAssignmentStatus
  shiftId: string
  shiftName: string
  startTime: string
  endTime: string
  staffId: string
  staffName: string
  staffAvatar: string
  franchiseId: string
  franchiseName: string
}

export interface DailyShiftView {
  id: string
  workDate: string
  shiftId: string
  shiftName: string
  startTime: string
  endTime: string
  assignmentCount: number
  franchiseId: string
  franchiseName: string
  assignments: ShiftAssignmentView[]
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  assignments: ShiftAssignmentView[]
  shifts: DailyShiftView[]
}

interface OptionItem {
  id: string
  name: string
}

interface CalendarSnapshot {
  assignmentRawData: ShiftAssignmentItem[]
  usersMap: Map<string, UserItem>
  userFranchiseRoles: UserFranchiseRoleItem[]
  shiftsMap: Map<string, ShiftItem>
  franchisesData: FranchiseOptionItem[]
  franchisesMap: Map<string, FranchiseOptionItem>
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeDateKey = (dateValue: string) => {
  const [year, month, day] = dateValue.split('-')

  if (!year || !month || !day) {
    return dateValue
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

const buildAssignmentImportKey = (shiftId: string, userId: string, workDate: string) => {
  return `${shiftId}__${userId}__${workDate}`
}

const compareTimeValue = (left: string, right: string) => left.localeCompare(right)

const mergeUsersIntoMap = (prev: Map<string, UserItem>, users: UserItem[]) => {
  const next = new Map(prev)

  users.forEach((user) => {
    next.set(user.id, {
      ...(next.get(user.id) || {}),
      ...user,
    })
  })

  return next
}

const seedUsersFromAssignments = (
  prev: Map<string, UserItem>,
  assignments: ShiftAssignmentItem[],
) => {
  const next = new Map(prev)

  assignments.forEach((assignment) => {
    if (!assignment.user_id) return

    const existingUser = next.get(assignment.user_id)
    next.set(assignment.user_id, {
      id: assignment.user_id,
      email: existingUser?.email || '',
      name: assignment.user_name || existingUser?.name || `User ${assignment.user_id}`,
      phone: existingUser?.phone || '',
      avatar_url: existingUser?.avatar_url,
      is_active: existingUser?.is_active,
      is_deleted: existingUser?.is_deleted,
      created_at: existingUser?.created_at,
      updated_at: existingUser?.updated_at,
    })
  })

  return next
}

const getInitialMonthDate = (assignments: ShiftAssignmentItem[]) => {
  if (assignments.length === 0) return null

  let earliestDateStr = assignments[0].work_date
  assignments.forEach((assignment) => {
    if (assignment.work_date < earliestDateStr) earliestDateStr = assignment.work_date
  })

  const [year, month] = earliestDateStr.split('-')
  if (!year || !month) return null

  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
}

const toShiftMap = (shifts: ShiftItem[]) => {
  return new Map(
    shifts
      .map((shift) => [((shift.id ?? shift._id) as string) ?? '', shift] as const)
      .filter(([shiftId]) => Boolean(shiftId)),
  )
}

const toFranchiseMap = (franchises: FranchiseOptionItem[]) => {
  return new Map(franchises.map((franchise) => [franchise.value, franchise]))
}

const buildSnapshot = (
  assignments: ShiftAssignmentItem[],
  users: UserItem[],
  shifts: ShiftItem[],
  franchises: FranchiseOptionItem[],
): CalendarSnapshot => {
  const normalizedAssignments = assignments.map((assignment) => ({
    ...assignment,
    work_date: normalizeDateKey(assignment.work_date),
  }))

  const seededUsers = seedUsersFromAssignments(new Map(), normalizedAssignments)

  return {
    assignmentRawData: normalizedAssignments,
    usersMap: mergeUsersIntoMap(seededUsers, users),
    userFranchiseRoles: [],
    shiftsMap: toShiftMap(shifts),
    franchisesData: franchises,
    franchisesMap: toFranchiseMap(franchises),
  }
}

const buildShiftGroupsByDate = (assignments: ShiftAssignmentView[]) => {
  const groupedShiftMap = assignments.reduce<Record<string, DailyShiftView>>((acc, assignment) => {
    const groupKey = `${assignment.workDate}__${assignment.shiftId}`

    if (!acc[groupKey]) {
      acc[groupKey] = {
        id: groupKey,
        workDate: assignment.workDate,
        shiftId: assignment.shiftId,
        shiftName: assignment.shiftName,
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        assignmentCount: 0,
        franchiseId: assignment.franchiseId,
        franchiseName: assignment.franchiseName,
        assignments: [],
      }
    }

    acc[groupKey].assignments.push(assignment)
    acc[groupKey].assignmentCount = acc[groupKey].assignments.length
    return acc
  }, {})

  return Object.values(groupedShiftMap).reduce<Record<string, DailyShiftView[]>>((acc, shift) => {
    if (!acc[shift.workDate]) {
      acc[shift.workDate] = []
    }

    acc[shift.workDate].push({
      ...shift,
      assignments: [...shift.assignments].sort((left, right) =>
        left.staffName.localeCompare(right.staffName),
      ),
    })

    acc[shift.workDate].sort((left, right) => {
      const timeCompare = compareTimeValue(left.startTime, right.startTime)
      if (timeCompare !== 0) return timeCompare
      return left.shiftName.localeCompare(right.shiftName)
    })

    return acc
  }, {})
}

export const useShiftCalendar = (
  filters: ShiftFilters,
  franchiseId?: string | null,
  viewMode: ShiftCalendarViewMode = 'assignment',
) => {
  const authStore = useAdminAuthStore()
  const authRoles = useAdminAuthStore((state) => state.roles)
  const roleCode = getRoleCode(authStore)
  const isStaff = roleCode === 'STAFF'
  const [monthDate, setMonthDate] = useState<Date>(new Date())
  const [assignmentRawData, setAssignmentRawData] = useState<ShiftAssignmentItem[]>([])
  const [usersMap, setUsersMap] = useState<Map<string, UserItem>>(new Map())
  const [userFranchiseRoles, setUserFranchiseRoles] = useState<UserFranchiseRoleItem[]>([])
  const [shiftsMap, setShiftsMap] = useState<Map<string, ShiftItem>>(new Map())
  const [franchisesMap, setFranchisesMap] = useState<Map<string, FranchiseOptionItem>>(new Map())
  const [franchisesData, setFranchisesData] = useState<FranchiseOptionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initializedMonthRef = useRef(false)
  const snapshotCacheRef = useRef<Map<string, CalendarSnapshot>>(new Map())
  const lookupMode = isStaff ? 'staff' : 'full'
  const cacheKey = `${franchiseId || 'all'}::${lookupMode}`
  const [reloadVersion, setReloadVersion] = useState(0)

  const franchiseNameById = useMemo(() => {
    return authRoles.reduce<Map<string, string>>((acc, role) => {
      if (role.franchise_id && role.franchise_name) {
        acc.set(role.franchise_id, role.franchise_name)
      }

      return acc
    }, new Map())
  }, [authRoles])

  const applySnapshot = useCallback((snapshot: CalendarSnapshot) => {
    setAssignmentRawData(snapshot.assignmentRawData)
    setUsersMap(new Map(snapshot.usersMap))
    setUserFranchiseRoles(snapshot.userFranchiseRoles)
    setShiftsMap(new Map(snapshot.shiftsMap))
    setFranchisesData(snapshot.franchisesData)
    setFranchisesMap(new Map(snapshot.franchisesMap))
  }, [])

  const reloadCalendarData = useCallback(() => {
    snapshotCacheRef.current.delete(cacheKey)
    setReloadVersion((prev) => prev + 1)
  }, [cacheKey])

  useEffect(() => {
    initializedMonthRef.current = false
  }, [cacheKey])

  useEffect(() => {
    let cancelled = false

    const cachedSnapshot = snapshotCacheRef.current.get(cacheKey)

    if (cachedSnapshot) {
      applySnapshot(cachedSnapshot)

      if (!initializedMonthRef.current) {
        const initialMonthDate = getInitialMonthDate(cachedSnapshot.assignmentRawData)
        if (initialMonthDate) {
          setMonthDate(initialMonthDate)
          initializedMonthRef.current = true
        }
      }

      setError(null)
      return
    }

    const loadCalendarData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [assignmentsResult, usersResult, userFranchiseRolesResult, shiftsResult, franchisesResult] = await Promise.all([
          franchiseId
            ? shiftApi.getShiftAssignmentsByFranchise(franchiseId)
            : shiftApi
                .searchShiftAssignments({
                  searchCondition: {
                    is_deleted: false,
                  },
                  pageInfo: { pageNum: 1, pageSize: 1000 },
                })
                .then((response) => response?.data || []),
          isStaff
            ? Promise.resolve([])
            : searchUsers({
                searchCondition: {
                  is_deleted: false,
                },
                pageInfo: { pageNum: 1, pageSize: 1000 },
              }).then((response) => response?.data || []),
          !isStaff && franchiseId
            ? searchUserFranchiseRoles({
                searchCondition: {
                  franchise_id: franchiseId,
                  is_deleted: false,
                },
                pageInfo: { pageNum: 1, pageSize: 1000 },
              }).then((response) => response?.data || [])
            : Promise.resolve([]),
          shiftApi
            .searchShifts({
              searchCondition: {
                is_deleted: false,
                franchise_id: franchiseId || undefined,
              },
              pageInfo: { pageNum: 1, pageSize: 1000 },
            })
            .then((response) => response?.data || []),
          isStaff ? Promise.resolve([]) : getFranchisesSelect().then((response) => response || []),
        ])

        if (cancelled) return

        const activeAssignments = (assignmentsResult || []).filter((assignment) => !assignment.is_deleted)
        const snapshot = buildSnapshot(
          activeAssignments,
          usersResult || [],
          shiftsResult || [],
          franchisesResult || [],
        )
        snapshot.userFranchiseRoles = userFranchiseRolesResult || []

        snapshotCacheRef.current.set(cacheKey, snapshot)
        applySnapshot(snapshot)

        if (!initializedMonthRef.current) {
          const initialMonthDate = getInitialMonthDate(snapshot.assignmentRawData)
          if (initialMonthDate) {
            setMonthDate(initialMonthDate)
            initializedMonthRef.current = true
          }
        }
      } catch (loadError) {
        if (cancelled) return

        console.error('Failed to load shift calendar:', loadError)
        setError('Unable to load shift calendar data. Please try again.')
        setAssignmentRawData([])
        setUsersMap(new Map())
        setUserFranchiseRoles([])
        setShiftsMap(new Map())
        setFranchisesData([])
        setFranchisesMap(new Map())
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadCalendarData()

    return () => {
      cancelled = true
    }
  }, [applySnapshot, cacheKey, franchiseId, isStaff, reloadVersion])

  const assignmentsView = useMemo(() => {
    return assignmentRawData.map((assignment) => {
      const assignmentId = assignment.id || assignment._id || ''
      const shift = shiftsMap.get(assignment.shift_id)
      const user = usersMap.get(assignment.user_id)
      const resolvedFranchiseId = shift?.franchise_id || franchiseId || ''
      const franchise = resolvedFranchiseId
        ? franchisesMap.get(resolvedFranchiseId.toString())
        : null

      return {
        id: assignmentId,
        workDate: assignment.work_date,
        status: assignment.status,
        shiftId: assignment.shift_id,
        shiftName: assignment.shift_name || shift?.name || `Shift ${assignment.shift_id}`,
        startTime:
          assignment.start_time ||
          assignment.shift_start_time ||
          shift?.start_time ||
          '',
        endTime:
          assignment.end_time ||
          assignment.shift_end_time ||
          shift?.end_time ||
          '',
        staffId: assignment.user_id,
        staffName: assignment.user_name || user?.name || `User ${assignment.user_id}`,
        staffAvatar: user?.avatar_url || '',
        franchiseId: resolvedFranchiseId,
        franchiseName:
          franchise?.name ||
          franchiseNameById.get(resolvedFranchiseId.toString()) ||
          'Unknown Franchise',
      }
    })
  }, [assignmentRawData, franchiseId, franchiseNameById, franchisesMap, shiftsMap, usersMap])

  const staffOptions = useMemo<OptionItem[]>(() => {
    if (!franchiseId) {
      return Array.from(usersMap.values()).map((user) => ({
        id: user.id,
        name: user.name,
      }))
    }

    const seenUserIds = new Set<string>()

    return userFranchiseRoles.reduce<OptionItem[]>((acc, role) => {
      if (
        !role.user_id ||
        seenUserIds.has(role.user_id) ||
        role.is_deleted ||
        role.is_active === false
      ) {
        return acc
      }

      seenUserIds.add(role.user_id)
      acc.push({
        id: role.user_id,
        name: role.user_name || usersMap.get(role.user_id)?.name || `User ${role.user_id}`,
      })
      return acc
    }, []).sort((left, right) => left.name.localeCompare(right.name))
  }, [franchiseId, userFranchiseRoles, usersMap])

  const franchiseOptions = useMemo<OptionItem[]>(() => {
    return franchisesData.map((franchise) => ({
      id: franchise.value,
      name: franchise.name,
    }))
  }, [franchisesData])

  const filteredAssignments = useMemo(() => {
    return assignmentsView.filter((assignment) => {
      const matchesSearch =
        filters.searchTerm === '' ||
        assignment.staffName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assignment.shiftName.toLowerCase().includes(filters.searchTerm.toLowerCase())

      const matchesStaff =
        filters.staffFilter === 'all' || assignment.staffId === filters.staffFilter

      const matchesStatus =
        filters.statusFilter === 'all' || assignment.status === filters.statusFilter

      const matchesFranchise =
        filters.franchiseFilter === 'all' || assignment.franchiseId === filters.franchiseFilter

      return matchesSearch && matchesStaff && matchesStatus && matchesFranchise
    })
  }, [assignmentsView, filters])

  const assignmentByDate = useMemo(() => {
    return filteredAssignments.reduce<Record<string, ShiftAssignmentView[]>>((acc, assignment) => {
      if (!acc[assignment.workDate]) {
        acc[assignment.workDate] = []
      }

      acc[assignment.workDate].push(assignment)
      return acc
    }, {})
  }, [filteredAssignments])

  const shiftGroupsByDate = useMemo(() => {
    return buildShiftGroupsByDate(assignmentsView)
  }, [assignmentsView])

  const visibleShiftGroupsByDate = useMemo(() => {
    if (viewMode !== 'shift') {
      return shiftGroupsByDate
    }

    const normalizedSearch = filters.searchTerm.trim().toLowerCase()

    return Object.entries(shiftGroupsByDate).reduce<Record<string, DailyShiftView[]>>(
      (acc, [dateKey, shifts]) => {
        const nextShifts = shifts
          .filter((shift) => {
            const matchesSearch =
              normalizedSearch === '' ||
              shift.shiftName.toLowerCase().includes(normalizedSearch)

            const matchesFranchise =
              filters.franchiseFilter === 'all' || shift.franchiseId === filters.franchiseFilter

            return matchesSearch && matchesFranchise
          })
          .sort((left, right) => {
            const timeCompare = compareTimeValue(left.startTime, right.startTime)
            if (timeCompare !== 0) return timeCompare
            return left.shiftName.localeCompare(right.shiftName)
          })

        acc[dateKey] = nextShifts
        return acc
      },
      {},
    )
  }, [filters.franchiseFilter, filters.searchTerm, shiftGroupsByDate, viewMode])

  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const firstDayIndex = (startOfMonth.getDay() + 6) % 7
    const startDate = new Date(startOfMonth)
    startDate.setDate(startOfMonth.getDate() - firstDayIndex)

    const todayKey = formatDateKey(new Date())
    const days: CalendarDay[] = []

    const normalizedSearch = filters.searchTerm.trim().toLowerCase()
    const shouldInjectEmpty = filters.staffFilter === 'all' && filters.statusFilter === 'all'
    
    const activeFilteredShifts = Array.from(shiftsMap.values())
      .filter((shift) => {
        const shiftId = shift.id ?? shift._id
        if (!shiftId || shift.is_deleted || shift.is_active === false) return false
        
        const franchiseId = shift.franchise_id || ''
        
        const matchesSearch = normalizedSearch === '' || shift.name.toLowerCase().includes(normalizedSearch)
        const matchesFranchise = filters.franchiseFilter === 'all' || franchiseId === filters.franchiseFilter
        
        return matchesSearch && matchesFranchise
      })

    for (let index = 0; index < 42; index += 1) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + index)
      const dateKey = formatDateKey(currentDate)
      
      const assignmentsForDay = assignmentByDate[dateKey] || []
      const existingShifts = visibleShiftGroupsByDate[dateKey] || []
      
      const allShiftsForDay = [...existingShifts]
      
      if (shouldInjectEmpty) {
        activeFilteredShifts.forEach((shift) => {
          const shiftId = (shift.id ?? shift._id) as string
          if (!allShiftsForDay.some((s) => s.shiftId === shiftId)) {
            const franchiseId = shift.franchise_id || ''
            const franchiseName = franchisesMap.get(franchiseId)?.name || ''
            allShiftsForDay.push({
               id: `${dateKey}__${shiftId}`,
               workDate: dateKey,
               shiftId,
               shiftName: shift.name,
               startTime: shift.start_time,
               endTime: shift.end_time,
               assignmentCount: 0,
               franchiseId,
               franchiseName,
               assignments: []
            })
          }
        })
      }
      
      allShiftsForDay.sort((left, right) => {
        const timeCompare = compareTimeValue(left.startTime, right.startTime)
        if (timeCompare !== 0) return timeCompare
        return left.shiftName.localeCompare(right.shiftName)
      })

      days.push({
        date: currentDate,
        isCurrentMonth: currentDate.getMonth() === monthDate.getMonth(),
        isToday: dateKey === todayKey,
        assignments: assignmentsForDay,
        shifts: allShiftsForDay,
      })
    }

    return days
  }, [assignmentByDate, monthDate, visibleShiftGroupsByDate, shiftsMap, franchisesMap, filters.searchTerm, filters.franchiseFilter, filters.staffFilter, filters.statusFilter])

  const monthLabel = monthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const selectedFranchiseName = useMemo(() => {
    if (!franchiseId) return ''
    return franchisesMap.get(franchiseId)?.name || franchiseNameById.get(franchiseId) || ''
  }, [franchiseId, franchiseNameById, franchisesMap])

  const shiftAssignmentLookupData = useMemo<ShiftAssignmentLookupData>(() => {
    const shifts = Array.from(shiftsMap.values())
      .filter((shift) => {
        const shiftId = shift.id ?? shift._id
        return Boolean(shiftId) && !shift.is_deleted && shift.is_active !== false
      })
      .map((shift) => ({
        shiftId: (shift.id ?? shift._id) as string,
        shiftName: shift.name,
        startTime: shift.start_time,
        endTime: shift.end_time,
      }))

    const seenUserIds = new Set<string>()
    const users = userFranchiseRoles.reduce<ShiftAssignmentLookupData['users']>((acc, role) => {
      const userId = role.user_id?.trim()
      const userEmail = role.user_email?.trim() || ''

      if (
        !userId ||
        seenUserIds.has(userId) ||
        role.is_deleted ||
        role.is_active === false
      ) {
        return acc
      }

      seenUserIds.add(userId)
      acc.push({
        userId,
        userEmail,
        userName: role.user_name || usersMap.get(userId)?.name || `User ${userId}`,
      })
      return acc
    }, [])

    const existingAssignmentKeys = assignmentRawData
      .filter((assignment) => !assignment.is_deleted)
      .map((assignment) =>
        buildAssignmentImportKey(
          assignment.shift_id,
          assignment.user_id,
          normalizeDateKey(assignment.work_date),
        ),
      )

    return {
      shifts,
      users,
      existingAssignmentKeys,
    }
  }, [assignmentRawData, shiftsMap, userFranchiseRoles, usersMap])

  return {
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
  }
}
