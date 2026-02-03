import React from 'react'

interface UserFiltersProps {
  searchTerm: string
  roleFilter: string
  franchiseFilter: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onRoleChange: (value: string) => void
  onFranchiseChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClearFilters: () => void
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  roleFilter,
  franchiseFilter,
  statusFilter,
  onSearchChange,
  onRoleChange,
  onFranchiseChange,
  onStatusChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 sticky top-0 z-20">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
            placeholder="Search by name or email..."
          />
        </div>

        {/* Filters Group */}
        <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
          {/* Role Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={roleFilter}
              onChange={(e) => onRoleChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="manager">Manager</option>
              <option value="barista">Barista</option>
              <option value="admin">Admin</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
          </div>

          {/* Franchise Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={franchiseFilter}
              onChange={(e) => onFranchiseChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
            >
              <option value="all">All Franchises</option>
              <option value="nyc">New York - DT</option>
              <option value="seattle">Seattle - North</option>
              <option value="chicago">Chicago - Loop</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
