import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, ClipboardList, Info, Save, UserRound } from 'lucide-react'
import type { Shift } from '@/types'

interface OptionItem {
  id: number
  name: string
}

interface StaffOption extends OptionItem {
  franchiseId: number | null
}

type AssignmentStatus = 'ASSIGNED' | 'COMPLETED' | 'ABSENT'

interface CreateShiftAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: {
    workDate: string
    shiftId: number
    staffId: number
    status: AssignmentStatus
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
  const [status, setStatus] = useState<AssignmentStatus>('ASSIGNED')
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

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'hidden',
          borderRadius: '16px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', backgroundColor: 'white' }}>
          <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6c757d' }}>
            Shift Management › <span className="text-gray-800">Create Shift Assignment</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6c757d',
                  fontSize: '14px',
                }}
              >
                <ArrowLeft size={18} />
                Back to Shift Calendar
              </button>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                Create Shift Assignment
              </h2>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                Plan staff coverage by assigning users to shifts.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-shift-assignment-form"
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: '#8B4513',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Save size={18} />
                Save Assignment
              </button>
            </div>
          </div>
        </div>

        <form
          id="create-shift-assignment-form"
          onSubmit={handleSubmit}
          style={{ overflowY: 'auto', padding: '24px', backgroundColor: '#f8f9fa' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <CalendarDays size={18} color="#8B4513" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Assignment Details</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / span 2' }}>
                    <label htmlFor="shift-work-date" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      Work Date
                    </label>
                    <input
                      id="shift-work-date"
                      type="date"
                      value={workDate}
                      onChange={(e) => setWorkDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / span 2' }}>
                    <label htmlFor="shift-franchise" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      Franchise
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        id="shift-franchise"
                        value={franchiseId}
                        onChange={(e) => setFranchiseId(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', appearance: 'none', backgroundColor: 'white' }}
                      >
                        <option value="all">All Franchises</option>
                        {franchises.map((franchise) => (
                          <option key={franchise.id} value={franchise.id}>
                            {franchise.name}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="shift-id" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      Shift
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        id="shift-id"
                        value={shiftId}
                        onChange={(e) => setShiftId(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', appearance: 'none', backgroundColor: 'white' }}
                      >
                        {filteredShifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name} ({shift.start_time} - {shift.end_time})
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="shift-staff" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      Staff
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        id="shift-staff"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', appearance: 'none', backgroundColor: 'white' }}
                      >
                        {filteredStaff.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <ClipboardList size={18} color="#8B4513" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Status</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {['ASSIGNED', 'COMPLETED', 'ABSENT'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStatus(item as AssignmentStatus)}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        border: `1px solid ${status === item ? '#8B4513' : '#e0e0e0'}`,
                        backgroundColor: status === item ? '#8B4513' : 'white',
                        color: status === item ? 'white' : '#374151',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <UserRound size={18} color="#8B4513" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Notes</h3>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={6}
                  style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', padding: '12px', boxSizing: 'border-box', resize: 'vertical' }}
                  placeholder="Add notes for this assignment (optional)."
                />
              </div>

              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Info size={18} color="#8B4513" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Tips</h3>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#6c757d', lineHeight: 1.5 }}>
                  Assign staff based on franchise coverage and shift availability.
                  Completed or Absent status should reflect historical attendance.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
