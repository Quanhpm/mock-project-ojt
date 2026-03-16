import { create } from 'zustand'

export type ShiftCalendarViewMode = 'assignment' | 'shift'

export interface DailyAssignmentTarget {
  isOpen: boolean
  shiftId: string | null
  workDate: string | null
}

interface ShiftManagementState {
  selectedFranchiseId: string | null
  selectedDateKey: string | null
  viewMode: ShiftCalendarViewMode
  dailyAssignment: DailyAssignmentTarget
  setSelectedFranchiseId: (franchiseId: string | null) => void
  setSelectedDate: (dateKey: string | null) => void
  setViewMode: (viewMode: ShiftCalendarViewMode) => void
  toggleViewMode: () => void
  openDailyAssignment: (shiftId: string, workDate: string) => void
  closeDailyAssignment: () => void
  resetShiftCalendarUi: () => void
}

const defaultDailyAssignmentState: DailyAssignmentTarget = {
  isOpen: false,
  shiftId: null,
  workDate: null,
}

export const useShiftManagementStore = create<ShiftManagementState>((set) => ({
  selectedFranchiseId: null,
  selectedDateKey: null,
  viewMode: 'assignment',
  dailyAssignment: defaultDailyAssignmentState,

  setSelectedFranchiseId: (franchiseId) => {
    set({ selectedFranchiseId: franchiseId })
  },

  setSelectedDate: (dateKey) => {
    set({ selectedDateKey: dateKey })
  },

  setViewMode: (viewMode) => {
    set({ viewMode })
  },

  toggleViewMode: () => {
    set((state) => ({
      viewMode: state.viewMode === 'assignment' ? 'shift' : 'assignment',
    }))
  },

  openDailyAssignment: (shiftId, workDate) => {
    set({
      dailyAssignment: {
        isOpen: true,
        shiftId,
        workDate,
      },
    })
  },

  closeDailyAssignment: () => {
    set({ dailyAssignment: defaultDailyAssignmentState })
  },

  resetShiftCalendarUi: () => {
    set({
      selectedDateKey: null,
      viewMode: 'assignment',
      dailyAssignment: defaultDailyAssignmentState,
    })
  },
}))
