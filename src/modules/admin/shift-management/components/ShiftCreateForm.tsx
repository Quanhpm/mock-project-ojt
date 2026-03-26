import React, { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useCreateShift } from '../hooks/useCreateShift.hook'
import type { CreateShiftRequest } from '@/apis/endpoints'
import { useAdminAuthStore } from '@/modules/admin/auth-admin/stores/admin-auth.store'

interface Step1FormValues {
  shiftName: string
  franchiseId: string
  startTime: string
  endTime: string
}

interface Step2FormValues {
  userId: string
  workDate: string
  note: string
}

export const ShiftCreateForm: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { activeContext, roles } = useAdminAuthStore()
  const routeFranchiseId = searchParams.get('franchiseId') || ''
  const currentRoleCode = activeContext?.role ?? roles[0]?.role ?? null
  const currentFranchiseId = activeContext?.franchise_id ?? roles[0]?.franchise_id ?? ''
  const isManagerContext = currentRoleCode === 'MANAGER' && Boolean(currentFranchiseId)
  const returnToCalendarPath = `/admin/shifts/calendar?franchiseId=${
    isManagerContext ? currentFranchiseId : routeFranchiseId || currentFranchiseId
  }`

  const {
    currentStep,
    isSubmitting,
    error,
    franchises,
    staffList,
    isFranchisesLoading,
    isUsersLoading,
    handleCreateShift,
    handleAssignStaff,
    goBackToStep1,
  } = useCreateShift(() => {
    navigate(
      isManagerContext || routeFranchiseId || currentFranchiseId
        ? returnToCalendarPath
        : '/admin/shifts',
    )
  })

  const managerFranchiseName = useMemo(() => {
    const roleFranchiseName =
      roles.find((role) => role.franchise_id === currentFranchiseId)?.franchise_name ?? null

    if (roleFranchiseName) return roleFranchiseName

    return franchises.find((franchise) => franchise.value === currentFranchiseId)?.name ?? ''
  }, [currentFranchiseId, franchises, roles])

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    setValue: setStep1Value,
    formState: { errors: step1Errors, isValid: isStep1Valid },
  } = useForm<Step1FormValues>({
    mode: 'onChange',
    defaultValues: {
      shiftName: '',
      franchiseId: '',
      startTime: '',
      endTime: '',
    },
  })

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    reset: resetStep2Form,
    formState: { errors: step2Errors, isValid: isStep2Valid },
  } = useForm<Step2FormValues>({
    mode: 'onChange',
    defaultValues: {
      userId: '',
      workDate: '',
      note: '',
    },
  })

  // ──────── Navigation ────────
  const handleCancel = () => {
    navigate(
      isManagerContext || routeFranchiseId || currentFranchiseId
        ? returnToCalendarPath
        : '/admin/shifts',
    )
  }

  const handleBackStep1 = () => {
    goBackToStep1()
  }

  useEffect(() => {
    const defaultFranchiseId = isManagerContext ? currentFranchiseId : routeFranchiseId

    if (!defaultFranchiseId) return

    setStep1Value('franchiseId', defaultFranchiseId, {
      shouldValidate: true,
      shouldDirty: false,
    })
  }, [currentFranchiseId, isManagerContext, routeFranchiseId, setStep1Value])

  useEffect(() => {
    if (currentStep === 2) {
      resetStep2Form({
        userId: '',
        workDate: '',
        note: '',
      })
    }
  }, [currentStep, resetStep2Form])

  // ──────── Step 1 submit ────────
  const onSubmitStep1 = async (values: Step1FormValues) => {
    const payload: CreateShiftRequest = {
      name: values.shiftName.trim(),
      franchise_id: isManagerContext ? currentFranchiseId : values.franchiseId,
      start_time: values.startTime,
      end_time: values.endTime,
    }
    await handleCreateShift(payload)
  }

  // ──────── Step 2 submit ────────
  const onSubmitStep2 = async (values: Step2FormValues) => {
    await handleAssignStaff(values.userId, values.workDate, values.note || undefined)
  }

  return (
    <div className="min-h-[100dvh] py-8 flex justify-center px-4 sm:px-6 lg:px-8 lg:py-12">
      <div className="w-full max-w-6xl">
        {/* HEADER */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl font-bold text-[#7F5539] sm:text-3xl">
            Create New Shift
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Set up a new shift and assign staff members.
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="mb-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:mb-10">
          <div className="flex items-center gap-3 justify-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
              ${
                currentStep === 1
                  ? 'bg-[#7F5539] text-white'
                  : 'bg-[#9C6644] text-white'
              }`}
            >
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span className="text-sm font-medium text-slate-700">
              Shift Details
            </span>
          </div>

          <div
            className={`mx-auto h-0.75 w-24 rounded-full sm:w-28 sm:mx-4
            ${currentStep > 1 ? 'bg-[#7F5539]' : 'bg-slate-200'}`}
          />

          <div className="flex items-center gap-3 justify-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
              ${
                currentStep === 2
                  ? 'bg-[#7F5539] text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium text-slate-500">
              Staff Assignment
            </span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {currentStep === 1 && (
          <form
            onSubmit={handleSubmitStep1(onSubmitStep1)}
            className="bg-white rounded-2xl border border-[#E6CCB2] shadow-sm p-6 sm:p-8 lg:p-10"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-6 sm:mb-8">
              Shift Information
            </h2>

            {/* SHIFT NAME */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700">
                Shift Name
              </label>
              <input
                {...registerStep1('shiftName', {
                  required: 'Shift name is required',
                  validate: (value) =>
                    value.trim().length > 0 || 'Shift name is required',
                })}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                placeholder="e.g. Morning Shift, Evening Shift"
              />
              {step1Errors.shiftName && (
                <p className="mt-1 text-xs text-red-500">{step1Errors.shiftName.message}</p>
              )}
            </div>

            {/* FRANCHISE */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700">
                Franchise
              </label>
              {isManagerContext ? (
                <>
                  <input
                    value={managerFranchiseName || 'Loading franchise...'}
                    disabled
                    readOnly
                    className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 text-sm cursor-not-allowed"
                  />
                  <input
                    type="hidden"
                    {...registerStep1('franchiseId', {
                      required: 'Franchise is required',
                    })}
                  />
                </>
              ) : (
                <select
                  {...registerStep1('franchiseId', {
                    required: 'Franchise is required',
                  })}
                  className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] text-sm"
                  disabled={isFranchisesLoading}
                >
                  <option value="">
                    {isFranchisesLoading ? 'Loading franchises...' : 'Select franchise'}
                  </option>
                  {franchises.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.name}
                    </option>
                  ))}
                </select>
              )}
              {step1Errors.franchiseId && (
                <p className="mt-1 text-xs text-red-500">{step1Errors.franchiseId.message}</p>
              )}
            </div>

            {/* TIME RANGE */}
            <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Start Time
                </label>
                <input
                  type="time"
                  {...registerStep1('startTime', {
                    required: 'Start time is required',
                  })}
                  className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                />
                {step1Errors.startTime && (
                  <p className="mt-1 text-xs text-red-500">{step1Errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  End Time
                </label>
                <input
                  type="time"
                  {...registerStep1('endTime', {
                    required: 'End time is required',
                  })}
                  className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                />
                {step1Errors.endTime && (
                  <p className="mt-1 text-xs text-red-500">{step1Errors.endTime.message}</p>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col-reverse gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-slate-500 hover:text-slate-700 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isStep1Valid || isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Creating...' : 'Next Step →'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <form
            onSubmit={handleSubmitStep2(onSubmitStep2)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-6 sm:mb-8">
              Staff Assignment
            </h2>

            {/* USER */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700">
                Staff Member
              </label>
              <select
                {...registerStep2('userId', {
                  required: 'Staff member is required',
                })}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 text-sm"
                disabled={isUsersLoading || staffList.length === 0}
              >
                <option value="">
                  {isUsersLoading
                    ? 'Loading staff...'
                    : staffList.length === 0
                      ? 'No staff available'
                      : 'Select staff member'}
                </option>
                {staffList.map((staff) => (
                  <option key={staff.userId} value={staff.userId}>
                    {staff.userName}
                  </option>
                ))}
              </select>
              {step2Errors.userId && (
                <p className="mt-1 text-xs text-red-500">{step2Errors.userId.message}</p>
              )}
            </div>

            {/* WORK DATE */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700">
                Work Date
              </label>
              <input
                type="date"
                {...registerStep2('workDate', {
                  required: 'Work date is required',
                })}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm"
              />
              {step2Errors.workDate && (
                <p className="mt-1 text-xs text-red-500">{step2Errors.workDate.message}</p>
              )}
            </div>

            {/* NOTE */}
            <div className="mb-8">
              <label className="text-sm font-medium text-slate-700">
                Note (Optional)
              </label>
              <textarea
                {...registerStep2('note')}
                className="mt-2 w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm"
                rows={4}
                placeholder="Add any additional notes or instructions..."
              />
            </div>

            {/* FOOTER */}
            <div className="flex flex-col-reverse gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleBackStep1}
                className="text-sm text-slate-500 hover:text-slate-700 sm:w-auto"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={!isStep2Valid || isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Saving...' : 'Save Shift Assignment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
