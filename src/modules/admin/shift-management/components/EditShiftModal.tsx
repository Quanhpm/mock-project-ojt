import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { DailyShiftView } from '../hooks/useShiftCalendar.hook'

interface EditShiftFormValues {
  name: string
  startTime: string
  endTime: string
}

interface EditShiftModalProps {
  isOpen: boolean
  shift: DailyShiftView | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (values: EditShiftFormValues) => Promise<void>
}

export const EditShiftModal: React.FC<EditShiftModalProps> = ({
  isOpen,
  shift,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EditShiftFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      startTime: '',
      endTime: '',
    },
  })

  useEffect(() => {
    if (isOpen && shift) {
      reset({
        name: shift.shiftName,
        startTime: shift.startTime,
        endTime: shift.endTime,
      })
    }
  }, [isOpen, reset, shift])

  if (!isOpen || !shift) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Edit Shift
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              {shift.shiftName}
            </h3>
            <p className="mt-2 text-sm text-slate-500">{shift.franchiseName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close edit shift modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Shift name</label>
            <input
              {...register('name', {
                required: 'Shift name is required',
                validate: (value) => value.trim().length > 0 || 'Shift name is required',
              })}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:bg-white"
              placeholder="Morning Shift"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Start time</label>
              <input
                type="time"
                {...register('startTime', {
                  required: 'Start time is required',
                })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:bg-white"
              />
              {errors.startTime && (
                <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">End time</label>
              <input
                type="time"
                {...register('endTime', {
                  required: 'End time is required',
                })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:bg-white"
              />
              {errors.endTime && (
                <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>
              )}
            </div>
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
              disabled={!isValid || isSubmitting}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Saving...' : 'Save Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
