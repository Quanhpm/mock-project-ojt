import { PageHeader, UserFilters, UserTableRow, Pagination, CreateUserModal, EditUserModal } from '../components'
import { useUserFilters, useUserList } from '../hooks'
import { useState } from 'react'

function UserManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const {
    filters,
    setSearchTerm,
    setRoleFilter,
    setFranchiseFilter,
    setStatusFilter,
    handleClearFilters,
  } = useUserFilters()

  const {
    users,
    totalUsers,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    toggleUserStatus,
  } = useUserList(filters)

  const handleCreateUser = () => {
    setIsCreateModalOpen(true)
  }

  const handleSaveUser = (userData: any) => {
    console.log('New user data:', userData)
    // TODO: Implement save user logic
  }

  const handleEditUser = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setEditingUser(user)
    }
  }

  const handleSaveEditUser = (userId: number, userData: any) => {
    console.log('Edit user:', userId, userData)
    // TODO: Implement edit user logic
  }

  const handleDeleteUser = (userId: number) => {
    console.log('Delete user:', userId)
    // TODO: Implement delete user logic
  }

  return (
    <div className="flex h-screen w-full">
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PageHeader totalUsers={totalUsers} onCreateUser={handleCreateUser} />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <UserFilters
            searchTerm={filters.searchTerm}
            roleFilter={filters.roleFilter}
            franchiseFilter={filters.franchiseFilter}
            statusFilter={filters.statusFilter}
            onSearchChange={setSearchTerm}
            onRoleChange={setRoleFilter}
            onFranchiseChange={setFranchiseFilter}
            onStatusChange={setStatusFilter}
            onClearFilters={handleClearFilters}
          />

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Roles
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Franchise
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
                  {users.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      onToggleStatus={toggleUserStatus}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalUsers}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveUser}
      />

      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEditUser}
      />
    </div>
  )
}

export default UserManagement
