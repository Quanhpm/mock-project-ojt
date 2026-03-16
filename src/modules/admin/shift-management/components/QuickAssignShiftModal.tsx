import React, { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

interface QuickAssignShiftFormValues {
  shiftId: string
  userId: string
}

interface QuickAssignShiftOption {
  id: string
  label: string
}

interface QuickAssignShiftModalProps {
  isOpen: boolean
  workDate: string | null
  shiftOptions: QuickAssignShiftOption[]
  userOptions: QuickAssignShiftOption[]
  assignedUserIdsByShiftId: Record<string, string[]>
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (values: QuickAssignShiftFormValues) => Promise<void>
}

const formatDateLabel = (workDate: string) => {
  return new Date(`${workDate}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const QuickAssignShiftModal: React.FC<QuickAssignShiftModalProps> = ({
  isOpen,
  workDate,
  shiftOptions,
  userOptions,
  assignedUserIdsByShiftId,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<QuickAssignShiftFormValues>({
    mode: 'onChange',
    defaultValues: {
      shiftId: '',
      userId: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        shiftId: '',
        userId: '',
      })
    }
  }, [isOpen, reset])

  const selectedShiftId = useWatch({ control, name: 'shiftId' })
  const selectedUserId = useWatch({ control, name: 'userId' })

  const filteredUserOptions = useMemo(() => {
    if (!selectedShiftId) {
      return userOptions
    }

    const assignedUserIds = new Set(assignedUserIdsByShiftId[selectedShiftId] || [])
    return userOptions.filter((user) => !assignedUserIds.has(user.id))
  }, [assignedUserIdsByShiftId, selectedShiftId, userOptions])

  useEffect(() => {
    if (!selectedShiftId || !selectedUserId) return

    const assignedUserIds = new Set(assignedUserIdsByShiftId[selectedShiftId] || [])
    if (assignedUserIds.has(selectedUserId)) {
      setValue('userId', '', {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }, [assignedUserIdsByShiftId, selectedShiftId, selectedUserId, setValue])

  if (!isOpen || !workDate) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Quick Assign
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Assign User To Shift
            </h3>
            <p className="mt-2 text-sm text-slate-500">{formatDateLabel(workDate)}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close quick assign modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Shift</label>
            <select
              {...register('shiftId', {
                required: 'Please select a shift',
              })}
              disabled={isSubmitting || shiftOptions.length === 0}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {shiftOptions.length === 0 ? 'No shifts available' : 'Select a shift'}
              </option>
              {shiftOptions.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.label}
                </option>
              ))}
            </select>
            {errors.shiftId && (
              <p className="mt-1 text-xs text-red-500">{errors.shiftId.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">User</label>
            <select
              {...register('userId', {
                required: 'Please select a user',
              })}
              disabled={isSubmitting || !selectedShiftId || filteredUserOptions.length === 0}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {!selectedShiftId
                  ? 'Select a shift first'
                  : filteredUserOptions.length === 0
                    ? 'All available users are already assigned'
                    : 'Select a user'}
              </option>
              {filteredUserOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.label}
                </option>
              ))}
            </select>
            {errors.userId && (
              <p className="mt-1 text-xs text-red-500">{errors.userId.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !isValid ||
                isSubmitting ||
                shiftOptions.length === 0 ||
                !selectedShiftId ||
                filteredUserOptions.length === 0
              }
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
