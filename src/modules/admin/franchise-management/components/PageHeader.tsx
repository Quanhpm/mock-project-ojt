import React from 'react'

interface PageHeaderProps {
  totalFranchises: number
  onCreateFranchise: () => void
}

export const PageHeader: React.FC<PageHeaderProps> = ({ totalFranchises, onCreateFranchise }) => {
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Franchise Management</h1>
        <p className="mt-1 text-sm text-slate-500">Manage all franchises ({totalFranchises} total)</p>
      </div>
      <button
        onClick={onCreateFranchise}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-xl">add</span>
        Create Franchise
      </button>
    </div>
  )
}
