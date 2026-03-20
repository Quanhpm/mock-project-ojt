import React, { useMemo, useState } from 'react'
import { UserDraggableCard } from './UserDraggableCard'
import { useDailyAssignment } from '../hooks'

interface StaffSidebarProps {
  franchiseId: string | null
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({ franchiseId }) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Create a mock shift view just to get the list of users from the hook
  // We use the existing hook that handles caching and fetching users
  const mockShift = useMemo(() => ({
    shiftId: 'mock',
    shiftName: 'mock',
    workDate: 'mock',
    startTime: '00:00',
    endTime: '23:59',
    assignmentCount: 0,
    assignments: []
  }), [])

  const { assignableUsers, isUsersLoading } = useDailyAssignment(franchiseId, mockShift as any)

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return assignableUsers
    const lowerSearch = searchTerm.toLowerCase()
    return assignableUsers.filter(
      (user) =>
        user.userName.toLowerCase().includes(lowerSearch) ||
        user.userEmail?.toLowerCase().includes(lowerSearch)
    )
  }, [assignableUsers, searchTerm])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="flex-shrink-0 border-b border-slate-200 px-6 py-5">
        <h3 className="text-lg font-bold text-slate-900">Nguồn nhân lực</h3>
        <p className="mt-1 text-sm text-slate-500">
          Kéo thẻ nhân viên và thả vào lịch để gán ca làm việc nhanh chóng.
        </p>

        <div className="mt-4 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isUsersLoading ? (
          <div className="flex items-center justify-center py-10">
            <span className="material-symbols-outlined animate-spin text-[24px] text-primary">
              progress_activity
            </span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
            <span className="material-symbols-outlined mb-2 text-[32px] text-slate-300">
              group_off
            </span>
            <p className="text-sm font-medium text-slate-600">Không tìm thấy nhân viên</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            {filteredUsers.map((user) => (
              <UserDraggableCard key={user.userId} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
