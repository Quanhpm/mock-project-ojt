import React from 'react'
import type {
  CalendarDay,
  DailyShiftView,
  ShiftAssignmentView,
} from '../hooks/useShiftCalendar.hook'
import type { ShiftCalendarViewMode } from '../stores/shift-management.store'

interface ShiftCalendarProps {
  monthLabel: string
  calendarDays: CalendarDay[]
  selectedDate: Date | null
  viewMode: ShiftCalendarViewMode
  onSelectDate: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onOpenShiftDetail: (shift: DailyShiftView) => void
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-700/10',
  ASSIGNED: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-700/10',
  CANCELED: 'bg-slate-100 text-slate-700 ring-slate-300',
  ABSENT: 'bg-red-50 text-red-700 ring-red-700/10',
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getStatusClass = (assignment: ShiftAssignmentView) => {
  return STATUS_STYLES[assignment.status] || 'bg-slate-50 text-slate-700 ring-slate-200'
}

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  monthLabel,
  calendarDays,
  selectedDate,
  viewMode,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onOpenShiftDetail,
}) => {
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : ''

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            onClick={onNextMonth}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
          <h3 className="text-lg font-bold text-slate-900">{monthLabel}</h3>
        </div>
        <div className="text-sm text-slate-500">
          {viewMode === 'assignment' ? 'Assignment View' : 'Shift View'}
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="border-r border-slate-200 px-3 py-2 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayKey = formatDateKey(day.date)
          const isSelected = selectedKey === dayKey
          const visibleItems = viewMode === 'assignment' ? day.assignments : day.shifts
          const maxVisible = viewMode === 'assignment' ? 2 : 3
          const hiddenCount = Math.max(visibleItems.length - maxVisible, 0)

          return (
            <div
              key={`${dayKey}-${index}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDate(day.date)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectDate(day.date)
                }
              }}
              className={`min-h-[132px] border-b border-r border-slate-200 p-3 text-left transition-colors last:border-r-0 ${
                day.isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'
              } ${isSelected ? 'ring-2 ring-inset ring-primary' : 'hover:bg-slate-50'}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    day.isToday ? 'text-primary' : 'text-slate-900'
                  }`}
                >
                  {day.date.getDate()}
                </span>
                {visibleItems.length > 0 && (
                  <span className="text-[10px] text-slate-400">
                    {viewMode === 'assignment'
                      ? `${day.assignments.length} assignments`
                      : `${day.shifts.length} shifts`}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                {viewMode === 'assignment' &&
                  day.assignments.slice(0, maxVisible).map((assignment) => (
                    <span
                      key={assignment.id}
                      className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset truncate ${
                        getStatusClass(assignment)
                      }`}
                    >
                      {assignment.staffName} - {assignment.shiftName}
                    </span>
                  ))}

                {viewMode === 'shift' &&
                  day.shifts.slice(0, maxVisible).map((shift) => (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectDate(day.date)
                        onOpenShiftDetail(shift)
                      }}
                      className="inline-flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-semibold text-slate-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      <span className="truncate">
                        {shift.shiftName} ({shift.startTime} - {shift.endTime})
                      </span>
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-slate-500">
                        {shift.assignmentCount}
                      </span>
                    </button>
                  ))}

                {hiddenCount > 0 && (
                  <span className="mt-1 block text-center text-[12px] font-bold tracking-[0.2em] text-slate-500">
                    ...
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
