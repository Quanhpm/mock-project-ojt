import React, { useEffect, useMemo, useState } from 'react'
import type { Shift } from '@/types'

interface OptionItem {
  id: number
  name: string
}

interface StaffOption extends OptionItem {
  franchiseId: number | null
}

interface CreateShiftAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: {
    workDate: string
    shiftId: number
    staffId: number
    status: 'ASSIGNED' | 'COMPLETED' | 'ABSENT'
    note: string
  }) => void
  franchises: OptionItem[]
  staff: StaffOption[]
  shifts: Shift[]
}

export const CreateShiftAssignmentModal: React.FC<CreateShiftAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  franchises,
  staff,
  shifts,
}) => {
  const [workDate, setWorkDate] = useState('')
  const [franchiseId, setFranchiseId] = useState('all')
  const [shiftId, setShiftId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [status, setStatus] = useState<'ASSIGNED' | 'COMPLETED' | 'ABSENT'>('ASSIGNED')
  const [note, setNote] = useState('')

  const filteredShifts = useMemo(() => {
    if (franchiseId === 'all') return shifts
    return shifts.filter((shift) => shift.franchise_id.toString() === franchiseId)
  }, [franchiseId, shifts])

  const filteredStaff = useMemo(() => {
    if (franchiseId === 'all') return staff
    return staff.filter((member) => member.franchiseId?.toString() === franchiseId)
  }, [franchiseId, staff])

  useEffect(() => {
    if (!isOpen) return

    setWorkDate('')
    setFranchiseId('all')
    setShiftId(shifts[0]?.id.toString() || '')
    setStaffId(staff[0]?.id.toString() || '')
    setStatus('ASSIGNED')
    setNote('')
  }, [isOpen, shifts, staff])

  if (!isOpen) return null

  const handleSave = () => {
    if (!workDate || !shiftId || !staffId) return

    onSave({
      workDate,
      shiftId: Number(shiftId),
      staffId: Number(staffId),
      status,
      note,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              Create Shift Assignment
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Plan staff coverage by adding shift assignments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 bg-white space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 flex flex-col gap-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    calendar_month
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">Assignment Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Work Date
                    </label>
                    <input
                      type="date"
                      value={workDate}
                      onChange={(e) => setWorkDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Franchise
                    </label>
                    <div className="relative">
                      <select
                        value={franchiseId}
                        onChange={(e) => setFranchiseId(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm appearance-none"
                      >
                        <option value="all">All Franchises</option>
                        {franchises.map((franchise) => (
                          <option key={franchise.id} value={franchise.id}>
                            {franchise.name}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Shift
                    </label>
                    <div className="relative">
                      <select
                        value={shiftId}
                        onChange={(e) => setShiftId(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm appearance-none"
                      >
                        {filteredShifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name} ({shift.start_time} - {shift.end_time})
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Staff
                    </label>
                    <div className="relative">
                      <select
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm appearance-none"
                      >
                        {filteredStaff.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    fact_check
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">Status</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['ASSIGNED', 'COMPLETED', 'ABSENT'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStatus(item as 'ASSIGNED' | 'COMPLETED' | 'ABSENT')}
                      className={`h-10 rounded-md border text-xs font-semibold uppercase tracking-wide transition-all ${
                        status === item
                          ? 'bg-primary text-white border-primary'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <section className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    description
                  </span>
                  <h3 className="text-sm font-bold text-gray-800">Notes</h3>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={6}
                  className="w-full rounded-md bg-white border border-gray-200 text-gray-800 text-sm focus:ring-1 focus:ring-primary focus:border-primary p-3"
                  placeholder="Add notes for this assignment (optional)."
                />
              </section>

              <section className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    info
                  </span>
                  <h3 className="text-sm font-bold text-gray-800">Tips</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Assign staff based on franchise coverage and shift availability.
                  Completed or Absent status should reflect historical attendance.
                </p>
              </section>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-white sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-md shadow-sm hover:bg-blue-600 transition-all"
          >
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  )
}
