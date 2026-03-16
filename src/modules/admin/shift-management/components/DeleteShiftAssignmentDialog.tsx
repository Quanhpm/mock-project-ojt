import React from 'react'
import type { ShiftAssignmentView } from '../hooks/useShiftCalendar.hook'

interface DeleteShiftAssignmentDialogProps {
  isOpen: boolean
  assignment: ShiftAssignmentView | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeleteShiftAssignmentDialog: React.FC<DeleteShiftAssignmentDialogProps> = ({
  isOpen,
  assignment,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !assignment) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
            <span className="material-symbols-outlined text-[22px]">delete</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delete shift assignment?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This will remove <span className="font-semibold text-slate-700">{assignment.staffName}</span>
              {' '}from <span className="font-semibold text-slate-700">{assignment.shiftName}</span> on{' '}
              <span className="font-semibold text-slate-700">{assignment.workDate}</span>.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
