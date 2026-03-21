import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { AssignableUserOption } from '../hooks/useDailyAssignment.hook'

interface UserDraggableCardProps {
  user: AssignableUserOption
}

export const UserDraggableCard: React.FC<UserDraggableCardProps> = ({ user }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `user-${user.userId}`,
    data: {
      type: 'user',
      user,
    },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex cursor-grab items-center gap-3 rounded-xl border p-3 transition-colors active:cursor-grabbing ${
        isDragging
          ? 'border-primary/50 bg-primary/5 opacity-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 group-hover:bg-slate-200">
        {user.userName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-semibold text-slate-900">{user.userName}</p>
        {user.userEmail && (
          <p className="truncate text-xs text-slate-500">{user.userEmail}</p>
        )}
      </div>
      <div className="text-slate-400 group-hover:text-slate-600">
        <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
      </div>
    </div>
  )
}
