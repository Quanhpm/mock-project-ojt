import React from 'react'
import type { ShiftAssignmentView } from '../hooks/useShiftCalendar.hook'
import { ShiftLegend } from './ShiftLegend'

interface ShiftDayPanelProps {
  selectedDate: Date | null
  assignments: ShiftAssignmentView[]
}

const STATUS_STYLES: Record<string, string> = {
  ASSIGNED: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-700/10',
  ABSENT: 'bg-red-50 text-red-700 ring-red-700/10',
}

const formatDateLabel = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const ShiftDayPanel: React.FC<ShiftDayPanelProps> = ({
  selectedDate,
  assignments,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Daily Assignments</h3>
            <p className="text-sm text-slate-500">
              {selectedDate ? formatDateLabel(selectedDate) : 'Select a day'}
            </p>
          </div>
          <ShiftLegend />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {!selectedDate && (
          <div className="text-sm text-slate-500">
            Choose a date on the calendar to view assigned shifts.
          </div>
        )}

        {selectedDate && assignments.length === 0 && (
          <div className="text-sm text-slate-500">No assignments for this day.</div>
        )}

        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"
          >
            <div
              className="h-10 w-10 rounded-full bg-cover bg-center shrink-0 border border-slate-200"
              style={{ backgroundImage: `url('${assignment.staffAvatar}')` }}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  {assignment.staffName}
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                    STATUS_STYLES[assignment.status]
                  }`}
                >
                  {assignment.status}
                </span>
              </div>
              <div className="text-sm text-slate-500">
                {assignment.shiftName} ({assignment.startTime} - {assignment.endTime})
              </div>
              <div className="text-xs text-slate-400">{assignment.franchiseName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
