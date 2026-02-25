import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  FranchiseFilters,
  FranchiseTableRow,
  PageHeader,
  Pagination,
} from '../components'
import { useFranchiseFilters } from '../hooks/useFranchiseFilters.hook'
import { usePaginatedList } from '../hooks/useFranchiseList.hook'
import { useFranchiseStore } from '../hooks/useFranchiseStore.hook'

export default function FranchiseManagement() {
  const navigate = useNavigate()

  const { filters, setSearchTerm, setStatusFilter, handleClearFilters } = useFranchiseFilters()

  const { filtered, toggleStatus, remove } = useFranchiseStore({
    searchTerm: filters.searchTerm,
    statusFilter: filters.statusFilter as 'all' | 'published' | 'draft' | 'inactive',
  })

  const {
    pageItems,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    pageSize,
  } = usePaginatedList(filtered, 6)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.searchTerm, filters.statusFilter, setCurrentPage])

  const isEmpty = totalItems === 0

  const handleDelete = (id: string) => {
    if (!globalThis.confirm('Bạn chắc chắn muốn xóa franchise này?')) return
    remove(id)
  }

  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PageHeader
          totalFranchises={totalItems}
          onCreateFranchise={() => navigate('/admin/franchises/create')}
        />

        <div className="flex-1 flex flex-col px-8 pb-8 overflow-hidden">
          <FranchiseFilters
            searchTerm={filters.searchTerm}
            statusFilter={filters.statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onClearFilters={handleClearFilters}
          />

          <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto h-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Franchise
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Location
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isEmpty ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <div className="text-base font-semibold text-slate-900">
                          No franchises found
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          Try adjusting filters or create a new franchise.
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                          >
                            Clear Filters
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/admin/franchises/create')}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Create Franchise
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((franchise) => (
                      <FranchiseTableRow
                        key={franchise.id}
                        franchise={franchise}
                        onToggleStatus={toggleStatus}
                        onEdit={(id) => navigate(`/admin/franchises/edit/${id}`)}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!isEmpty && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>
    </div>
  )
}
