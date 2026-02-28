import { useState, useCallback } from 'react'
import {
  UserTableRow,
  Pagination,
  CreateUserModal,
  EditUserModal,
  DeleteUserDialog,
  ViewUserModal,
} from '../components'
import { useUserList } from '../hooks'
import type { UserItem } from '../hooks'

/** Skeleton row cho trạng thái loading */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-44 bg-slate-100 rounded" />
        </div>
      </div>
    </td>
    <td className="p-4">
      <div className="h-4 w-28 bg-slate-200 rounded" />
    </td>
    <td className="p-4">
      <div className="h-6 w-11 bg-slate-200 rounded-full" />
    </td>
    <td className="p-4" />
  </tr>
)

function UserManagement() {
  const {
    users,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
  } = useUserList()

  // ──────── Create Modal ────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false)
    setCurrentPage(1)
  }, [setCurrentPage])

  // ──────── View Modal ────────
  const [viewUser, setViewUser] = useState<UserItem | null>(null)

  const handleViewClick = useCallback((user: UserItem) => {
    setViewUser(user)
  }, [])

  const handleViewClose = useCallback(() => {
    setViewUser(null)
  }, [])

  // ──────── Edit Modal ────────
  const [editUser, setEditUser] = useState<UserItem | null>(null)

  const handleEditClick = useCallback((user: UserItem) => {
    setEditUser(user)
  }, [])

  const handleEditClose = useCallback(() => {
    setEditUser(null)
  }, [])

  const handleEditSuccess = useCallback(() => {
    setEditUser(null)
    setCurrentPage(currentPage) // Refresh trang hiện tại
  }, [setCurrentPage, currentPage])

  // ──────── Delete Dialog ────────
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null)

  const handleDeleteClick = useCallback((user: UserItem) => {
    setDeleteTarget(user)
  }, [])

  const handleDeleteClose = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  const handleDeleteSuccess = useCallback(() => {
    setDeleteTarget(null)
    setCurrentPage(1) // Refresh về trang 1
  }, [setCurrentPage])

  return (
    <div className="flex flex-col w-full">
      <main className="flex flex-col flex-1">
        {/* Page Header */}
        <header className="w-full px-8 py-6 flex flex-col gap-6 shrink-0 z-10">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <a className="hover:text-primary transition-colors" href="#">
                Home
              </a>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-slate-900 font-medium">Users</span>
            </nav>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                User Management
              </h2>
              <p className="text-slate-500">
                Total Users: {isLoading ? '...' : totalItems}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Create User
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-8 pb-8">
          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Phone
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Loading state */}
                  {isLoading &&
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                  {/* Data rows */}
                  {!isLoading &&
                    users.map((user) => (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        onView={handleViewClick}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                      />
                    ))}

                  {/* Empty state */}
                  {!isLoading && users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-[48px] text-slate-300">
                            group_off
                          </span>
                          <p className="text-slate-500 font-medium">No users found</p>
                          <p className="text-sm text-slate-400">
                            There are no user records to display.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && users.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </main>

      {/* ═══════════ Modals ═══════════ */}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={!!viewUser}
        user={viewUser}
        onClose={handleViewClose}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editUser}
        user={editUser}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={!!deleteTarget}
        userId={deleteTarget?.id ?? ''}
        userName={deleteTarget?.name ?? ''}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}

export default UserManagement
