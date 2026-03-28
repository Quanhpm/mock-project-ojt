import React from 'react'
import type {
  DailyShiftView,
  ShiftAssignmentStatus,
  ShiftAssignmentView,
} from '../hooks/useShiftCalendar.hook'
import { ShiftLegend } from './ShiftLegend'
import type { ShiftCalendarViewMode } from '../stores/shift-management.store'
import { ShiftAssignmentCard } from './ShiftAssignmentCard'

interface ShiftDayPanelProps {
  viewMode: ShiftCalendarViewMode
  selectedDate: Date | null
  assignments: ShiftAssignmentView[]
  shifts: DailyShiftView[]
  onCreateAssignment?: () => void
  onEditShift?: (shift: DailyShiftView) => void
  onDeleteShift?: (shift: DailyShiftView) => void
  onStatusChange?: (assignmentId: string, status: ShiftAssignmentStatus) => void
  onDeleteAssignment?: (assignment: ShiftAssignmentView) => void
  updatingAssignmentId: string | null
  deletingAssignmentId: string | null
  deletingShiftId: string | null
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
  viewMode,
  selectedDate,
  assignments,
  shifts,
  onCreateAssignment,
  onEditShift,
  onDeleteShift,
  onStatusChange,
  onDeleteAssignment,
  updatingAssignmentId,
  deletingAssignmentId,
  deletingShiftId,
}) => {
  return (
    <div className="relative flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900">
              {viewMode === 'assignment' ? 'Daily Assignments' : 'Daily Shift Groups'}
            </h3>
            <p className="text-sm text-slate-500">
              {selectedDate ? formatDateLabel(selectedDate) : 'Select a day'}
            </p>
          </div>
          {viewMode === 'assignment' ? (
            <ShiftLegend />
          ) : (
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                Shift overview
              </span>
              {onCreateAssignment && (
                <button
                  type="button"
                  onClick={onCreateAssignment}
                  disabled={!selectedDate}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Assign User</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {!selectedDate && (
            <div className="text-sm text-slate-500">
              Choose a date on the calendar to view the detailed schedule.
            </div>
          )}

          {selectedDate && viewMode === 'assignment' && assignments.length === 0 && (
            <div className="text-sm text-slate-500">No assignments for this day.</div>
          )}

          {selectedDate && viewMode === 'shift' && shifts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm text-slate-500">No shifts grouped for this day.</p>
              {onCreateAssignment && (
                <button
                  type="button"
                  onClick={onCreateAssignment}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Assign User To Shift</span>
                </button>
              )}
            </div>
          )}

          {viewMode === 'assignment' &&
            assignments.map((assignment) => (
              <ShiftAssignmentCard
                key={assignment.id}
                assignment={assignment}
                secondaryLine={`${assignment.shiftName} (${assignment.startTime} - ${assignment.endTime})`}
                tertiaryLine={assignment.franchiseName}
                onStatusChange={onStatusChange}
                onDelete={onDeleteAssignment}
                isStatusUpdating={updatingAssignmentId === assignment.id}
                isDeleting={deletingAssignmentId === assignment.id}
              />
            ))}

          {viewMode === 'shift' &&
            shifts.map((shift) => (
              <div
                key={shift.id}
                className="rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900" title={shift.shiftName}>
                      {shift.shiftName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {shift.startTime} - {shift.endTime}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{shift.franchiseName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {shift.assignmentCount} assigned
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      {onEditShift && (
                        <button
                          type="button"
                          onClick={() => onEditShift(shift)}
                          disabled={deletingShiftId === shift.shiftId}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          Edit Shift
                        </button>
                      )}
                      {onDeleteShift && (
                        <button
                          type="button"
                          onClick={() => onDeleteShift(shift)}
                          disabled={deletingShiftId === shift.shiftId}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Delete shift ${shift.shiftName}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {deletingShiftId === shift.shiftId ? 'hourglass_top' : 'delete'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
