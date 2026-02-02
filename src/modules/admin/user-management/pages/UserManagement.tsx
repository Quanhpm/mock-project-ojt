import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCard, UserFilters } from '../components'
import { useUserList, useUserFilters } from '../hooks'

function UserManagement() {
  const navigate = useNavigate()
  const { users, roles, franchises, totalUsers, loading, error } = useUserList()
  const { search, selectedRole, selectedFranchise, selectedStatus, filteredUsers, setSearch, setSelectedRole, setSelectedFranchise, setSelectedStatus, clearFilters } = useUserFilters(users)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIdx, startIdx + itemsPerPage)

  const handleCreateUser = () => {
    navigate('/admin/users/create')
  }

  const handleEditUser = (id: number) => {
    navigate(`/admin/users/${id}`)
  }

  const handleViewProfile = (id: number) => {
    navigate(`/admin/users/${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Đang tải...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="w-full px-8 py-6 flex flex-col gap-6 shrink-0 z-10">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <a className="hover:text-primary transition-colors" href="#">
                Home
              </a>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-slate-900 dark:text-white font-medium">Users</span>
            </nav>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Quản Lý User
              </h2>
              <p className="text-slate-500 dark:text-slate-400">Total Users: {totalUsers}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateUser}
                className="group flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span className="font-bold text-sm">Create New User</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {/* Filters */}
          <UserFilters
            search={search}
            selectedRole={selectedRole}
            selectedFranchise={selectedFranchise}
            selectedStatus={selectedStatus}
            roles={roles}
            franchises={franchises}
            onSearchChange={setSearch}
            onRoleChange={setSelectedRole}
            onFranchiseChange={setSelectedFranchise}
            onStatusChange={setSelectedStatus}
            onClearFilters={clearFilters}
          />

          {/* User Cards Grid */}
          {paginatedUsers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
                {paginatedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    id={user.id}
                    name={user.name}
                    email={user.email}
                    avatar_url={user.avatar_url}
                    is_active={user.is_active}
                    roleCode={user.primaryRole?.role_code}
                    franchiseName={user.primaryRole?.franchise_name}
                    onEdit={handleEditUser}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-surface-dark px-4 py-3 sm:px-6 rounded-lg">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-400">
                      Showing <span className="font-medium">{startIdx + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(startIdx + itemsPerPage, filteredUsers.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredUsers.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 disabled:opacity-50 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                      </button>

                      {/* Page numbers */}
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const page = idx + 1
                        if (totalPages <= 5 || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                page === currentPage
                                  ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                                  : 'text-slate-900 dark:text-slate-300 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                              } transition-colors`}
                            >
                              {page}
                            </button>
                          )
                        } else if (page === 2 || page === totalPages - 1) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:outline-offset-0"
                            >
                              ...
                            </span>
                          )
                        }
                        return null
                      })}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 disabled:opacity-50 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500 dark:text-slate-400">No users found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default UserManagement
