import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ClipboardList, Info, Save, UserRound } from 'lucide-react'
import { shiftApi, franchiseApi, searchUsers } from '@/apis/endpoints'
import type { FranchiseItem, ShiftItem, UserItem } from '@/apis/endpoints'
import { toast } from 'sonner'

type AssignmentStatus = 'ASSIGNED' | 'COMPLETED' | 'ABSENT'

export default function ShiftCreatePage() {
  const navigate = useNavigate()

  const [workDate, setWorkDate] = useState('')
  const [franchiseId, setFranchiseId] = useState('all')
  const [shiftId, setShiftId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [status, setStatus] = useState<AssignmentStatus>('ASSIGNED')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data states
  const [franchisesData, setFranchisesData] = useState<FranchiseItem[]>([])
  const [shiftsData, setShiftsData] = useState<ShiftItem[]>([])
  const [usersData, setUsersData] = useState<UserItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [franRes, shiftRes, userRes] = await Promise.all([
          franchiseApi.searchFranchises({
            searchCondition: { is_deleted: false },
            pageInfo: { pageNum: 1, pageSize: 1000 },
          }),
          shiftApi.searchShifts({
            searchCondition: { is_deleted: false },
            pageInfo: { pageNum: 1, pageSize: 1000 },
          }),
          searchUsers({
            searchCondition: { is_deleted: false },
            pageInfo: { pageNum: 1, pageSize: 1000 },
          }),
        ])

        setFranchisesData(franRes?.data || [])
        setShiftsData(shiftRes?.data || [])
        setUsersData(userRes?.data || [])
      } catch (err) {
        console.error(err)
        toast.error('Gặp lỗi khi tải dữ liệu. Vui lòng thử lại.')
      }
    }
    fetchData()
  }, [])

  const franchiseOptions = useMemo(
    () => franchisesData.map((franchise) => ({ id: franchise.id, name: franchise.name })),
    [franchisesData]
  )

  const staffOptions = useMemo(
    () => usersData.map((user) => ({ id: user.id, name: user.name })),
    [usersData]
  )

  const shiftOptions = useMemo(() => shiftsData, [shiftsData])

  const filteredShifts = useMemo(() => {
    if (franchiseId === 'all') return shiftOptions
    return shiftOptions.filter((shift) => shift.franchise_id?.toString() === franchiseId)
  }, [franchiseId, shiftOptions])

  const filteredStaff = useMemo(() => {
    return staffOptions // In real scenario, staff might be filtered by franchise via user-role, but we just display all users now
  }, [staffOptions])

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!workDate || !shiftId || !staffId) {
      toast.error('Vui lòng chọn đầy đủ Work Date, Shift và Staff')
      return
    }

    try {
      setIsSubmitting(true)
      await shiftApi.assignShiftToUser({
        work_date: workDate,
        shift_id: shiftId,
        user_id: staffId,
        note: note || undefined,
      })

      toast.success('Shift assignment created successfully!')
      navigate('/admin/shifts')
      
    } catch (error: unknown) {
      console.error(error)
      const errMessage = error instanceof Error ? error.message : 'Error'
      toast.error('Lỗi khi tạo assignment: ' + errMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '24px' }}>
      <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6c757d' }}>
        <button
          type="button"
          onClick={() => navigate('/admin/shifts')}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#8B4513' }}
        >
          Shift Management
        </button>{' '}
        › <span style={{ color: '#212529' }}>Create Shift Assignment</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/shifts')}
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
            Back to Shifts
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
            Create Shift Assignment
          </h1>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
            Plan staff coverage by assigning users to shifts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/shifts')}
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
            {isSubmitting ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>
      </div>

      <form id="create-shift-assignment-form" onSubmit={handleSubmit}>
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
                      {franchiseOptions.map((franchise) => (
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
                Assign staff based on franchise coverage and shift availability. Completed or Absent
                status should reflect historical attendance.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
