import React from 'react'
import type { ShiftCalendarViewMode } from '../stores/shift-management.store'

interface PageHeaderProps {
  summaryLabel: string
  summaryValue: number
  viewMode: ShiftCalendarViewMode
  selectedFranchiseName: string
  onCreateShift: () => void
  onImportExcel: () => void
  onToggleViewMode: () => void
  onChangeFranchise?: () => void
  isImportDisabled?: boolean
  showImportButton?: boolean
  showCreateShiftButton?: boolean
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  summaryLabel,
  summaryValue,
  viewMode,
  selectedFranchiseName,
  onCreateShift,
  onImportExcel,
  onToggleViewMode,
  onChangeFranchise,
  isImportDisabled = false,
  showImportButton = true,
  showCreateShiftButton = true,
}) => {
  return (
    <header className="z-10 flex w-full shrink-0 flex-col gap-6 px-8 py-6">
      <div className="flex flex-col gap-1">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <a className="transition-colors hover:text-primary" href="#">
            Home
          </a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-medium text-slate-900">Shifts</span>
        </nav>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Shift Management
          </h2>
          <p className="text-slate-500">
            {selectedFranchiseName ? `${selectedFranchiseName} · ` : ''}
            {summaryLabel}: {summaryValue}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onChangeFranchise && (
            <button
              onClick={onChangeFranchise}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Change Franchise</span>
            </button>
          )}

          <button
            onClick={onToggleViewMode}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {viewMode === 'assignment' ? 'view_timeline' : 'assignment_ind'}
            </span>
            <span>
              {viewMode === 'assignment' ? 'Switch to Shift View' : 'Switch to Assignment View'}
            </span>
          </button>

          {showImportButton && (
            <button
              onClick={onImportExcel}
              disabled={isImportDisabled}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Import Excel</span>
            </button>
          )}

          {showCreateShiftButton && (
            <button
              onClick={onCreateShift}
              className="group flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-600 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-sm font-bold">Create Shift</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
