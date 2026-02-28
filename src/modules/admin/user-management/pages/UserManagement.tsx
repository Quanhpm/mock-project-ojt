import { PageHeader, UserFilters, UserTableRow, Pagination, CreateUserModal, EditUserModal } from '../components'
import { useUserFilters, useUserList, type User } from '../hooks'
import { useEffect, useState } from 'react'
import { createUser, deleteUser, getUsers, updateUser } from '@/apis/endpoints/user.api'
import { createUserFranchiseRole } from '@/apis/endpoints/user-franchise-role.api'
import { getUsersWithRolesAndFranchises } from '@/mockdata'

function UserManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    filters,
    setSearchTerm,
    setRoleFilter,
    setFranchiseFilter,
    setStatusFilter,
    handleClearFilters,
  } = useUserFilters()

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const users = await getUsers()
      if (users && users.length > 0) {
        setAllUsers(users)
        return
      }
      setAllUsers(getUsersWithRolesAndFranchises())
    } catch {
      setAllUsers(getUsersWithRolesAndFranchises())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const {
    users,
    totalUsers,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
  } = useUserList(filters, allUsers)

  const handleCreateUser = () => {
    setIsCreateModalOpen(true)
  }

  const handleSubmitCreateUser = async (userData: {
    email: string
    password: string
    name: string
    phone?: string
    is_active?: boolean
  }) => {
    const createdUser = await createUser(userData)
    if (!createdUser) {
      throw new Error('Create user failed')
    }

    return { id: createdUser.id }
  }

  const handleAssignRoleToUser = async (data: {
    user_id: number
    role_id: number
    franchise_id: number | null
  }) => {
    const createdAssignment = await createUserFranchiseRole(data)
    if (!createdAssignment) {
      throw new Error('Assign role/franchise failed')
    }

    await loadUsers()
  }

  const handleEditUser = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setEditingUser(user)
    }
  }

  const handleSaveEditUser = async (userId: number, userData: any) => {
    await updateUser(userId, {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      is_active: userData.is_active,
    })
    await loadUsers()
  }

  const handleDeleteUser = async (userId: number) => {
    await deleteUser(userId)
    await loadUsers()
  }

  const handleToggleUserStatus = async (userId: number) => {
    const targetUser = allUsers.find((user) => user.id === userId)
    if (!targetUser) return

    await updateUser(userId, {
      is_active: !targetUser.is_active,
    })
    await loadUsers()
  }

  return (
    <div className="flex flex-col w-full">
      {/* Main Content */}
      <main className="flex flex-col flex-1">
        <PageHeader totalUsers={totalUsers} onCreateUser={handleCreateUser} />

        {/* Content Area */}
        <div className="px-8 pb-8">
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
            <div>
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : null}

                  {users.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      onToggleStatus={handleToggleUserStatus}
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
        onCreateUser={handleSubmitCreateUser}
        onAssignRole={handleAssignRoleToUser}
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
