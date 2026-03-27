import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type ShiftCalendarViewMode = 'assignment' | 'shift'

export interface DailyAssignmentTarget {
  isOpen: boolean
  shiftId: string | null
  workDate: string | null
}

export type ShiftCalendarType = 'month' | 'day'

interface ShiftManagementState {
  selectedFranchiseId: string | null
  selectedDateKey: string | null
  viewMode: ShiftCalendarViewMode
  calendarType: ShiftCalendarType
  dailyAssignment: DailyAssignmentTarget
  setSelectedFranchiseId: (franchiseId: string | null) => void
  setSelectedDate: (dateKey: string | null) => void
  setViewMode: (viewMode: ShiftCalendarViewMode) => void
  setCalendarType: (type: ShiftCalendarType) => void
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

export const useShiftManagementStore = create<ShiftManagementState>()(
  persist(
    (set) => ({
      selectedFranchiseId: null,
      selectedDateKey: null,
      viewMode: 'assignment',
      calendarType: 'month',
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

      setCalendarType: (calendarType) => {
        set({ calendarType })
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
          calendarType: 'month',
          dailyAssignment: defaultDailyAssignmentState,
        })
      },
    }),
    {
      name: 'admin-shift-management-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        selectedFranchiseId: state.selectedFranchiseId,
      }),
    },
  ),
)
