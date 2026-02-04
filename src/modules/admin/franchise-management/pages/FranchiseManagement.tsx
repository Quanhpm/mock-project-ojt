import { useEffect, useState } from 'react'
import { PageHeader, FranchiseFilters, FranchiseTableRow, Pagination, CreateFranchiseModal, EditFranchiseModal } from '../components'
import { useFranchiseFilters } from '../hooks/useFranchiseFilters.hook'
import { useFranchiseStore, type Franchise, type FranchiseCreateInput, type FranchiseFilters as FranchiseFiltersType } from '../hooks/useFranchiseStore.hook'
import { usePaginatedList } from '../hooks/useFranchiseList.hook'

export default function FranchiseManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Franchise | null>(null)

  const { filters, setSearchTerm, setStatusFilter, handleClearFilters } = useFranchiseFilters()

  const storeFilters: FranchiseFiltersType = {
    searchTerm: filters.searchTerm,
    statusFilter: filters.statusFilter as FranchiseFiltersType['statusFilter'],
  }

  // Data store 
  const { filtered, create, update, remove, toggleStatus } = useFranchiseStore(storeFilters)

  // Pagination tách riêng
  const { pageItems, currentPage, setCurrentPage, totalPages, totalItems } = usePaginatedList<Franchise>(filtered, 5)

  //Reset page khi filter đổi 
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.searchTerm, filters.statusFilter, setCurrentPage])

  const onSaveCreate = (data: FranchiseCreateInput) => {
    create(data)
    setIsCreateOpen(false)
  }

  const onEdit = (id: string) => {
    const found = pageItems.find((x) => x.id === id)
    if (found) setEditing(found)
  }

  const onSaveEdit = (id: string, data: FranchiseCreateInput) => {
    update(id, data)
    setEditing(null)
  }

  const onDelete = (id: string) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa franchise này?')) return
    remove(id)
  }

  const isEmpty = totalItems === 0

  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <PageHeader totalFranchises={totalItems} onCreateFranchise={() => setIsCreateOpen(true)} />

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <FranchiseFilters
            searchTerm={filters.searchTerm}
            statusFilter={filters.statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onClearFilters={handleClearFilters}
          />

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Franchise Name</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Location</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Created Date</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {isEmpty ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center">
                        <div className="text-slate-900 font-semibold text-lg">Không có dữ liệu phù hợp</div>
                        <div className="text-slate-500 mt-1">Hãy thử đổi bộ lọc hoặc tạo franchise mới.</div>
                        <div className="mt-5 flex items-center justify-center gap-3">
                          <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            Clear filters
                          </button>
                          <button
                            onClick={() => setIsCreateOpen(true)}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Create franchise
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((franchise) => (
                      <FranchiseTableRow
                        key={franchise.id}
                        franchise={franchise}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleStatus={toggleStatus}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!isEmpty && totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </main>

      <CreateFranchiseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={onSaveCreate}
      />

      <EditFranchiseModal
        isOpen={editing !== null}
        franchise={editing}
        onClose={() => setEditing(null)}
        onSave={onSaveEdit}
      />
    </div>
  )
}
