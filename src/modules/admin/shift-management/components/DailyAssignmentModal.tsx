import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { AssignableUserOption } from '../hooks/useDailyAssignment.hook'
import type {
  DailyShiftView,
  ShiftAssignmentStatus,
  ShiftAssignmentView,
} from '../hooks/useShiftCalendar.hook'
import { ShiftAssignmentCard } from './ShiftAssignmentCard'

interface DailyAssignmentFormValues {
  userId: string
  note: string
}

interface DailyAssignmentModalProps {
  isOpen: boolean
  selectedShift: DailyShiftView | null
  assignableUsers: AssignableUserOption[]
  isUsersLoading: boolean
  isSubmitting: boolean
  updatingAssignmentId: string | null
  deletingAssignmentId: string | null
  onClose: () => void
  onSubmit: (values: DailyAssignmentFormValues) => Promise<void>
  onEditShift: (shift: DailyShiftView) => void
  onStatusChange: (assignmentId: string, status: ShiftAssignmentStatus) => void
  onDeleteAssignment: (assignment: ShiftAssignmentView) => void
}

const formatDateLabel = (workDate: string) => {
  return new Date(`${workDate}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const DailyAssignmentModal: React.FC<DailyAssignmentModalProps> = ({
  isOpen,
  selectedShift,
  assignableUsers,
  isUsersLoading,
  isSubmitting,
  updatingAssignmentId,
  deletingAssignmentId,
  onClose,
  onSubmit,
  onEditShift,
  onStatusChange,
  onDeleteAssignment,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<DailyAssignmentFormValues>({
    mode: 'onChange',
    defaultValues: {
      userId: '',
      note: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        userId: '',
        note: '',
      })
    }
  }, [isOpen, reset, selectedShift?.id])

  if (!isOpen || !selectedShift) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-[28px]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Daily Assignment
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              {selectedShift.shiftName}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {formatDateLabel(selectedShift.workDate)} · {selectedShift.startTime} -{' '}
              {selectedShift.endTime}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onEditShift(selectedShift)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:flex-none"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Edit Shift</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              aria-label="Close daily assignment"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-slate-200 px-6 py-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Assigned users</h3>
                <p className="text-sm text-slate-500">
                  {selectedShift.assignmentCount} assignment
                  {selectedShift.assignmentCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectedShift.assignments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No users are assigned to this shift yet.
                </div>
              )}

              {selectedShift.assignments.map((assignment) => (
                <ShiftAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  secondaryLine={assignment.franchiseName}
                  onStatusChange={onStatusChange}
                  onDelete={onDeleteAssignment}
                  isStatusUpdating={updatingAssignmentId === assignment.id}
                  isDeleting={deletingAssignmentId === assignment.id}
                />
              ))}
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Assign User</h3>
              <p className="mt-1 text-sm text-slate-500">
                Choose another staff member from the same franchise and add them to this shift.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Staff member
                </label>
                <select
                  {...register('userId', {
                    required: 'Please select a user to assign',
                  })}
                  disabled={isUsersLoading || isSubmitting || assignableUsers.length === 0}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {isUsersLoading
                      ? 'Loading users...'
                      : assignableUsers.length === 0
                        ? 'No available users'
                        : 'Select a user'}
                  </option>
                  {assignableUsers.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.userName}
                      {user.userEmail ? ` · ${user.userEmail}` : ''}
                    </option>
                  ))}
                </select>
                {errors.userId && (
                  <p className="mt-1 text-xs text-red-500">{errors.userId.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Note</label>
                <textarea
                  {...register('note')}
                  rows={4}
                  placeholder="Optional note for this assignment"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting || isUsersLoading || assignableUsers.length === 0}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
