import React from 'react'

interface PageHeaderProps {
  totalFranchises: number
  onCreateFranchise: () => void
}

export const PageHeader: React.FC<PageHeaderProps> = ({ totalFranchises, onCreateFranchise }) => {
  return (
    <header className="w-full px-8 py-6 flex flex-col gap-6 shrink-0 z-10">
      <div className="flex flex-col gap-1">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <a className="hover:text-primary transition-colors" href="#">
            Home
          </a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-slate-900 font-medium">Franchises</span>
        </nav>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Franchise Management
          </h2>
          <p className="text-slate-500">Total Franchises: {totalFranchises}</p>
        </div>
        <button
          onClick={onCreateFranchise}
          className="group flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="font-bold text-sm">Create Franchise</span>
        </button>
      </div>
    </header>
  )
}
