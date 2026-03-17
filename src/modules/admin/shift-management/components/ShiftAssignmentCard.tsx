import React, { useEffect, useRef, useState } from 'react'
import type {
  ShiftAssignmentStatus,
  ShiftAssignmentView,
} from '../hooks/useShiftCalendar.hook'

interface ShiftAssignmentCardProps {
  assignment: ShiftAssignmentView
  secondaryLine: string
  tertiaryLine?: string
  onStatusChange: (assignmentId: string, status: ShiftAssignmentStatus) => void
  onDelete: (assignment: ShiftAssignmentView) => void
  isStatusUpdating?: boolean
  isDeleting?: boolean
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-700/10',
  ASSIGNED: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-700/10',
  CANCELED: 'bg-slate-100 text-slate-700 ring-slate-300',
  ABSENT: 'bg-red-50 text-red-700 ring-red-700/10',
}

const STATUS_OPTIONS: ShiftAssignmentStatus[] = [
  'PENDING',
  'ASSIGNED',
  'COMPLETED',
  'CANCELED',
  'ABSENT',
]

const getInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) return '?'

  return parts.map((part) => part[0]?.toUpperCase() || '').join('')
}

export const ShiftAssignmentCard: React.FC<ShiftAssignmentCardProps> = ({
  assignment,
  secondaryLine,
  tertiaryLine,
  onStatusChange,
  onDelete,
  isStatusUpdating = false,
  isDeleting = false,
}) => {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)
  const statusMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isStatusMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!statusMenuRef.current?.contains(event.target as Node)) {
        setIsStatusMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isStatusMenuOpen])

  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
      {assignment.staffAvatar ? (
        <div
          className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-cover bg-center"
          style={{ backgroundImage: `url('${assignment.staffAvatar}')` }}
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
          {getInitials(assignment.staffName)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{assignment.staffName}</p>
        <p className="truncate text-sm text-slate-500">{secondaryLine}</p>
        {tertiaryLine && <p className="truncate text-xs text-slate-400">{tertiaryLine}</p>}
      </div>

      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative" ref={statusMenuRef}>
            <button
              type="button"
              disabled={isStatusUpdating || isDeleting}
              onClick={() => setIsStatusMenuOpen((current) => !current)}
              className={`inline-flex min-w-[144px] items-center justify-between gap-2 rounded-md px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                STATUS_STYLES[assignment.status] || 'bg-slate-100 text-slate-700 ring-slate-300'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className="truncate whitespace-nowrap">
                {isStatusUpdating ? 'Saving...' : assignment.status}
              </span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {isStatusMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setIsStatusMenuOpen(false)
                      onStatusChange(assignment.id, status)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-slate-50 ${
                      status === assignment.status ? 'text-primary' : 'text-slate-700'
                    }`}
                  >
                    <span>{status}</span>
                    {status === assignment.status && (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onDelete(assignment)}
            disabled={isStatusUpdating || isDeleting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Delete assignment for ${assignment.staffName}`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDeleting ? 'hourglass_top' : 'delete'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
