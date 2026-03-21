import React from 'react'
import type { ShiftCalendarViewMode } from '../stores/shift-management.store'

interface OptionItem {
  id: string
  name: string
}

interface ShiftFiltersProps {
  viewMode: ShiftCalendarViewMode
  searchTerm: string
  franchiseFilter: string
  staffFilter: string
  statusFilter: string
  franchises: OptionItem[]
  staff: OptionItem[]
  isFranchiseLocked?: boolean
  selectedFranchiseName?: string
  onSearchChange: (value: string) => void
  onFranchiseChange: (value: string) => void
  onStaffChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClearFilters: () => void
}

export const ShiftFilters: React.FC<ShiftFiltersProps> = ({
  viewMode,
  searchTerm,
  franchiseFilter,
  staffFilter,
  statusFilter,
  franchises,
  staff,
  isFranchiseLocked = false,
  selectedFranchiseName = '',
  onSearchChange,
  onFranchiseChange,
  onStaffChange,
  onStatusChange,
  onClearFilters,
}) => {
  const isAssignmentView = viewMode === 'assignment'

  return (
    <div className="sticky top-0 z-20 mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="block w-full rounded-lg border-0 bg-slate-100 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            placeholder={
              isAssignmentView ? 'Search by staff or shift name...' : 'Search by shift name...'
            }
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
          {!isFranchiseLocked && (
            <div className="relative min-w-[160px]">
              <select
                value={franchiseFilter}
                onChange={(event) => onFranchiseChange(event.target.value)}
                className="block w-full appearance-none rounded-lg border-0 bg-slate-100 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
              >
                <option value="all">All Franchises</option>
                {franchises.map((franchise) => (
                  <option key={franchise.id} value={franchise.id}>
                    {franchise.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
            </div>
          )}

          {isFranchiseLocked && (
            <div className="flex h-[44px] min-w-[220px] items-center gap-2 rounded-lg bg-slate-100 px-3 ring-1 ring-inset ring-slate-200">
              <span className="material-symbols-outlined text-[18px] text-slate-400">lock</span>
              <span className="truncate text-sm font-medium text-slate-800">
                {selectedFranchiseName || 'Selected franchise'}
              </span>
            </div>
          )}

          {isAssignmentView && (
            <div className="relative min-w-[160px]">
              <select
                value={staffFilter}
                onChange={(event) => onStaffChange(event.target.value)}
                className="block w-full appearance-none rounded-lg border-0 bg-slate-100 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
              >
                <option value="all">All Staff</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
            </div>
          )}

          {isAssignmentView && (
            <div className="relative min-w-[160px]">
              <select
                value={statusFilter}
                onChange={(event) => onStatusChange(event.target.value)}
                className="block w-full appearance-none rounded-lg border-0 bg-slate-100 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
                <option value="ABSENT">Absent</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
            </div>
          )}

          {!isAssignmentView && (
            <div className="inline-flex h-[44px] min-w-[170px] items-center rounded-lg bg-slate-100 px-3 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
              Shift overview filters
            </div>
          )}

          <button
            onClick={onClearFilters}
            className="whitespace-nowrap px-2 text-sm font-medium text-primary hover:text-blue-600"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}
