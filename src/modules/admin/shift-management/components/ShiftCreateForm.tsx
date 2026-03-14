import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateShift } from '../hooks/useCreateShift.hook'
import type { CreateShiftRequest } from '@/apis/endpoints'

export const ShiftCreateForm: React.FC = () => {
  const navigate = useNavigate()

  const {
    currentStep,
    isSubmitting,
    error,
    franchises,
    staffList,
    isUsersLoading,
    handleCreateShift,
    handleAssignStaff,
    goBackToStep1,
  } = useCreateShift(() => {
    navigate('/admin/shifts')
  })

  // ──────── Step 1 fields ────────
  const [shiftName, setShiftName] = useState('')
  const [franchiseId, setFranchiseId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // ──────── Step 2 fields ────────
  const [userId, setUserId] = useState('')
  const [workDate, setWorkDate] = useState('')
  const [note, setNote] = useState('')

  // ──────── Navigation ────────
  const handleCancel = () => {
    navigate('/admin/shifts')
  }

  const handleBackStep1 = () => {
    goBackToStep1()
  }

  // ──────── Step 1 submit ────────
  const onSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CreateShiftRequest = {
      name: shiftName,
      franchise_id: franchiseId,
      start_time: startTime,
      end_time: endTime,
    }
    await handleCreateShift(payload)
  }

  // ──────── Step 2 submit ────────
  const onSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleAssignStaff(userId, workDate, note || undefined)
  }

  // ──────── Validate ────────
  const isStep1Valid =
    shiftName.trim() && franchiseId && startTime && endTime

  const isStep2Valid = userId && workDate

  return (
    <div className="min-h-screen py-12 flex justify-center">
      <div className="w-full max-w-6xl">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#7F5539]">
            Create New Shift
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Set up a new shift and assign staff members.
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-3">
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
            className={`w-28 h-0.75 mx-4 rounded-full
            ${currentStep > 1 ? 'bg-[#7F5539]' : 'bg-slate-200'}`}
          />

          <div className="flex items-center gap-3">
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
            onSubmit={onSubmitStep1}
            className="bg-white rounded-2xl border border-[#E6CCB2] shadow-sm p-10"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-8">
              Shift Information
            </h2>

            {/* SHIFT NAME */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700">
                Shift Name
              </label>
              <input
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                placeholder="e.g. Morning Shift, Evening Shift"
              />
            </div>

            {/* FRANCHISE */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700">
                Franchise
              </label>
              <select
                value={franchiseId}
                onChange={(e) => setFranchiseId(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] text-sm"
              >
                <option value="">Select franchise</option>
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TIME RANGE */}
            <div className="grid grid-cols-2 gap-5 mb-8">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#B08968] outline-none text-sm"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-slate-500 hover:text-slate-700"
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
            onSubmit={onSubmitStep2}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-8">
              Staff Assignment
            </h2>

            {/* USER */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700">
                Staff Member
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 text-sm"
              >
                <option value="">
                  {isUsersLoading ? 'Loading staff...' : 'Select staff member'}
                </option>
                {staffList.map((staff) => (
                  <option key={staff.userId} value={staff.userId}>
                    {staff.userName}
                  </option>
                ))}
              </select>
            </div>

            {/* WORK DATE */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700">
                Work Date
              </label>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm"
              />
            </div>

            {/* NOTE */}
            <div className="mb-8">
              <label className="text-sm font-medium text-slate-700">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2 w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-400 outline-none text-sm"
                rows={4}
                placeholder="Add any additional notes or instructions..."
              />
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={handleBackStep1}
                className="text-sm text-slate-500 hover:text-slate-700"
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
