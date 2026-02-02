import React from 'react'

interface UserFiltersProps {
  search: string
  selectedRole: string
  selectedFranchise: string
  selectedStatus: string
  roles: Array<{ id: number; code: string; name: string }>
  franchises: Array<{ id: number; name: string }>
  onSearchChange: (value: string) => void
  onRoleChange: (value: string) => void
  onFranchiseChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClearFilters: () => void
}

export function UserFilters({
  search,
  selectedRole,
  selectedFranchise,
  selectedStatus,
  roles,
  franchises,
  onSearchChange,
  onRoleChange,
  onFranchiseChange,
  onStatusChange,
  onClearFilters
}: UserFiltersProps) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 sticky top-0 z-20">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
            placeholder="Search by name or email..."
          />
        </div>

        {/* Filter controls */}
        <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
          {/* Role dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.code}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
          </div>

          {/* Franchise dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedFranchise}
              onChange={(e) => onFranchiseChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
            >
              <option value="">All Franchises</option>
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

          {/* Status dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
          </div>

          {/* Clear filters button */}
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
