import React from 'react'
import type { CalendarDay, ShiftAssignmentView } from '../hooks/useShiftCalendar.hook'

interface ShiftCalendarProps {
  monthLabel: string
  calendarDays: CalendarDay[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

const STATUS_STYLES: Record<string, string> = {
  ASSIGNED: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-700/10',
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
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) => {
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : ''

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="text-slate-600 hover:text-primary hover:bg-slate-100 p-2 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            onClick={onNextMonth}
            className="text-slate-600 hover:text-primary hover:bg-slate-100 p-2 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
          <h3 className="text-lg font-bold text-slate-900">{monthLabel}</h3>
        </div>
        <div className="text-sm text-slate-500">Calendar View</div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="px-3 py-2 border-r last:border-r-0 border-slate-200">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayKey = formatDateKey(day.date)
          const isSelected = selectedKey === dayKey
          const maxVisible = 2
          const hiddenCount = Math.max(day.assignments.length - maxVisible, 0)

          return (
            <button
              key={`${dayKey}-${index}`}
              onClick={() => onSelectDate(day.date)}
              className={`text-left min-h-[120px] border-b border-r last:border-r-0 border-slate-200 p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                day.isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'
              } ${isSelected ? 'ring-2 ring-inset ring-primary' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-semibold ${
                    day.isToday ? 'text-primary' : 'text-slate-900'
                  }`}
                >
                  {day.date.getDate()}
                </span>
                {day.assignments.length > 0 && (
                  <span className="text-[10px] text-slate-400">
                    {day.assignments.length} shifts
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {day.assignments.slice(0, maxVisible).map((assignment) => (
                  <span
                    key={assignment.id}
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset truncate ${
                      getStatusClass(assignment)
                    }`}
                  >
                    {assignment.shiftName} - {assignment.staffName}
                  </span>
                ))}
                {hiddenCount > 0 && (
                  <span className="text-[12px] text-slate-500 font-bold block text-center tracking-[0.2em] mt-1">
                    ...
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
