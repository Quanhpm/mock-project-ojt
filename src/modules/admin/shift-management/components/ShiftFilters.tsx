import React from 'react'

interface OptionItem {
  id: number
  name: string
}

interface ShiftFiltersProps {
  searchTerm: string
  franchiseFilter: string
  staffFilter: string
  statusFilter: string
  franchises: OptionItem[]
  staff: OptionItem[]
  onSearchChange: (value: string) => void
  onFranchiseChange: (value: string) => void
  onStaffChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClearFilters: () => void
}

export const ShiftFilters: React.FC<ShiftFiltersProps> = ({
  searchTerm,
  franchiseFilter,
  staffFilter,
  statusFilter,
  franchises,
  staff,
  onSearchChange,
  onFranchiseChange,
  onStaffChange,
  onStatusChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 sticky top-0 z-20">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
            placeholder="Search by staff or shift name..."
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="relative min-w-[160px]">
            <select
              value={franchiseFilter}
              onChange={(e) => onFranchiseChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
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

          <div className="relative min-w-[160px]">
            <select
              value={staffFilter}
              onChange={(e) => onStaffChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
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

          <div className="relative min-w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="COMPLETED">Completed</option>
              <option value="ABSENT">Absent</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
          </div>

          <button
            onClick={onClearFilters}
            className="text-sm font-medium text-primary hover:text-blue-600 px-2 whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}
