import { useMemo, useState } from 'react'
import { franchises, shiftAssignments, shifts, users } from '@/mockdata'
import type { Franchise, Shift, ShiftAssignment } from '@/types'
import type { ShiftFilters } from './useShiftFilters.hook'

export interface ShiftAssignmentView {
  id: number
  workDate: string
  status: ShiftAssignment['status']
  shiftId: number
  shiftName: string
  startTime: string
  endTime: string
  staffId: number
  staffName: string
  staffAvatar: string
  franchiseId: number
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

const parseWorkDate = (workDate: string) => new Date(`${workDate}T00:00:00`)

const getInitialMonthDate = () => {
  if (shiftAssignments.length === 0) {
    return new Date()
  }

  let earliest = parseWorkDate(shiftAssignments[0].work_date)
  shiftAssignments.forEach((assignment) => {
    const date = parseWorkDate(assignment.work_date)
    if (date < earliest) {
      earliest = date
    }
  })

  return new Date(earliest.getFullYear(), earliest.getMonth(), 1)
}

export const useShiftCalendar = (filters: ShiftFilters) => {
  const [monthDate, setMonthDate] = useState<Date>(getInitialMonthDate)

  const staffOptions = useMemo(() => {
    return users
      .filter((user) => user.role === 'STAFF')
      .map((user) => ({
        id: user.id,
        name: user.name,
        avatarUrl: user.avatar_url,
        franchiseId: user.franchise_id ?? null,
      }))
  }, [])

  const franchiseOptions = useMemo(() => {
    return franchises.map((franchise: Franchise) => ({
      id: franchise.id,
      name: franchise.name,
    }))
  }, [])

  const shiftOptions = useMemo(() => {
    return shifts.filter((shift: Shift) => !shift.is_deleted)
  }, [])

  const assignmentsView = useMemo(() => {
    const shiftById = new Map<number, Shift>(
      shifts.map((shift: Shift) => [shift.id, shift])
    )
    const staffById = new Map(users.map((user) => [user.id, user]))
    const franchiseById = new Map<number, Franchise>(
      franchises.map((franchise: Franchise) => [franchise.id, franchise])
    )

    return shiftAssignments
      .filter((assignment) => !assignment.is_deleted)
      .map((assignment) => {
        const shift = shiftById.get(assignment.shift_id)
        const staff = staffById.get(assignment.user_id)

        if (!shift || !staff) {
          return null
        }

        const franchise = franchiseById.get(shift.franchise_id)

        return {
          id: assignment.id,
          workDate: assignment.work_date,
          status: assignment.status,
          shiftId: shift.id,
          shiftName: shift.name,
          startTime: shift.start_time,
          endTime: shift.end_time,
          staffId: staff.id,
          staffName: staff.name,
          staffAvatar: staff.avatar_url,
          franchiseId: shift.franchise_id,
          franchiseName: franchise?.name || 'N/A',
        }
      })
      .filter(Boolean) as ShiftAssignmentView[]
  }, [])

  const filteredAssignments = useMemo(() => {
    return assignmentsView.filter((assignment) => {
      const matchesSearch =
        filters.searchTerm === '' ||
        assignment.staffName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assignment.shiftName.toLowerCase().includes(filters.searchTerm.toLowerCase())

      const matchesFranchise =
        filters.franchiseFilter === 'all' ||
        assignment.franchiseId.toString() === filters.franchiseFilter

      const matchesStaff =
        filters.staffFilter === 'all' ||
        assignment.staffId.toString() === filters.staffFilter

      const matchesStatus =
        filters.statusFilter === 'all' || assignment.status === filters.statusFilter

      return matchesSearch && matchesFranchise && matchesStaff && matchesStatus
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

    for (let index = 0; index < 42; index += 1) {
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
