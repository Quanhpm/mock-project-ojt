import { useEffect, useMemo, useState } from 'react'
import { shiftApi, searchUsers, franchiseApi } from '@/apis/endpoints'
import type { ShiftAssignmentItem, UserItem, ShiftItem, FranchiseItem } from '@/apis/endpoints'
import type { ShiftFilters } from './useShiftFilters.hook'

export interface ShiftAssignmentView {
  id: string
  workDate: string
  status: 'ASSIGNED' | 'COMPLETED' | 'ABSENT'
  shiftId: string
  shiftName: string
  startTime: string
  endTime: string
  staffId: string
  staffName: string
  staffAvatar: string
  franchiseId: string | number
  franchiseName: string
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  assignments: ShiftAssignmentView[]
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useShiftCalendar = (filters: ShiftFilters) => {
  const [monthDate, setMonthDate] = useState<Date>(new Date())
  
  // States to hold API data
  const [assignmentRawData, setAssignmentRawData] = useState<ShiftAssignmentItem[]>([])
  const [usersMap, setUsersMap] = useState<Map<string, UserItem>>(new Map())
  const [shiftsMap, setShiftsMap] = useState<Map<string, ShiftItem>>(new Map())
  const [franchisesMap, setFranchisesMap] = useState<Map<string, FranchiseItem>>(new Map())

  // Raw arrays for dropdown options
  const [shiftsData, setShiftsData] = useState<ShiftItem[]>([])
  const [franchisesData, setFranchisesData] = useState<FranchiseItem[]>([])

  // ===== Load Data from APIs =====
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Search assignments
        const assignResponse = await shiftApi.searchShiftAssignments({
          searchCondition: {
            is_deleted: false,
          },
          pageInfo: { pageNum: 1, pageSize: 1000 },
        })
        const assignments = assignResponse?.data || []
        setAssignmentRawData(assignments)

        if (assignments.length > 0) {
          let earliestDateStr = assignments[0].work_date
          assignments.forEach((a) => {
            if (a.work_date < earliestDateStr) earliestDateStr = a.work_date
          })
          const [year, month] = earliestDateStr.split('-')
          if (year && month) {
            setMonthDate(new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1))
          }
        }

        // 2. Search users (lấy staff info + avatar)
        const usersResponse = await searchUsers({
          searchCondition: {
            is_deleted: false,
          },
          pageInfo: { pageNum: 1, pageSize: 1000 },
        })
        const usersData = usersResponse?.data || []
        setUsersMap(new Map(usersData.map((user: UserItem) => [user.id, user])))

        // 3. Search shifts (để lấy tên ca + giờ nếu cần)
        const shiftResponse = await shiftApi.searchShifts({
          searchCondition: {
            is_deleted: false,
            franchise_id:
              filters.franchiseFilter !== 'all' ? filters.franchiseFilter : undefined,
          },
          pageInfo: { pageNum: 1, pageSize: 1000 },
        })
        const shifts = shiftResponse?.data || []
        setShiftsData(shifts)
        setShiftsMap(new Map(shifts.map((shift: ShiftItem) => [(shift.id || shift._id) as string, shift])))

        // 4. Search franchises (để lấy tên chi nhánh)
        const franchiseResponse = await franchiseApi.searchFranchises({
          searchCondition: {
            is_deleted: false,
          },
          pageInfo: { pageNum: 1, pageSize: 1000 },
        })
        const franchises = franchiseResponse?.data || []
        setFranchisesData(franchises)
        setFranchisesMap(new Map(franchises.map((f: FranchiseItem) => [f.id as string, f])))

      } catch (error) {
        console.error('Failed to load shift management data:', error)
      }
    }

    loadData()
  }, [filters.franchiseFilter])

  // ===== Transform raw data =====
  const assignmentsView = useMemo(() => {
    return assignmentRawData.map((assignment) => {
      const shift = shiftsMap.get(assignment.shift_id)
      const user = usersMap.get(assignment.user_id)
      const franchiseId = shift?.franchise_id
      const franchise = franchiseId ? franchisesMap.get(franchiseId.toString()) : null

      return {
        id: assignment.id,
        workDate: assignment.work_date,
        status: assignment.status as 'ASSIGNED' | 'COMPLETED' | 'ABSENT',
        shiftId: assignment.shift_id,
        shiftName: shift?.name || assignment.shift_name || 'Unknown Shift',
        startTime: assignment.start_time || shift?.start_time || '',
        endTime: assignment.end_time || shift?.end_time || '',
        staffId: assignment.user_id,
        staffName: assignment.user_name || user?.name || 'Unknown Staff',
        staffAvatar: user?.avatar_url || '',
        franchiseId: franchiseId || '',
        franchiseName: franchise?.name || 'Unknown Franchise',
      }
    }).filter(Boolean) as ShiftAssignmentView[]
  }, [assignmentRawData, usersMap, shiftsMap, franchisesMap])

  // ===== Staff Options =====
  const staffOptions = useMemo(() => {
    return Array.from(usersMap.values()).map((user: UserItem) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatar_url,
    }))
  }, [usersMap])

  // ===== Franchise Options =====
  const franchiseOptions = useMemo(() => {
    return franchisesData.map((f) => ({
      id: f.id as string,
      name: f.name,
    }))
  }, [franchisesData])

  // ===== Shift Options =====
  const shiftOptions = useMemo(() => {
    return shiftsData
  }, [shiftsData])

  // ===== Filter assignments =====
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
        filters.franchiseFilter === 'all' || assignment.franchiseId.toString() === filters.franchiseFilter

      return matchesSearch && matchesStaff && matchesStatus && matchesFranchise
    })
  }, [assignmentsView, filters])

  const assignmentByDate = useMemo(() => {
    return filteredAssignments.reduce<Record<string, ShiftAssignmentView[]>>(
      (acc, assignment) => {
        if (!acc[assignment.workDate]) {
          acc[assignment.workDate] = []
        }
        acc[assignment.workDate].push(assignment)
        return acc
      },
      {}
    )
  }, [filteredAssignments])

  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const firstDayIndex = (startOfMonth.getDay() + 6) % 7
    const startDate = new Date(startOfMonth)
    startDate.setDate(startOfMonth.getDate() - firstDayIndex)

    const todayKey = formatDateKey(new Date())
    const days: CalendarDay[] = []

    for (let index = 0; index < 35; index += 1) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + index)
      const dateKey = formatDateKey(currentDate)

      days.push({
        date: currentDate,
        isCurrentMonth: currentDate.getMonth() === monthDate.getMonth(),
        isToday: dateKey === todayKey,
        assignments: assignmentByDate[dateKey] || [],
      })
    }

    return days
  }, [monthDate, assignmentByDate])

  const monthLabel = monthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return {
    monthDate,
    setMonthDate,
    monthLabel,
    calendarDays,
    filteredAssignments,
    staffOptions,
    franchiseOptions,
    shiftOptions,
    assignmentByDate,
  }
}
