import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserTableRow,
  Pagination,
  EditUserModal,
  DeleteUserDialog,
  ViewUserModal,
} from "../components";
import { useUserList } from "../hooks";
import type { UserItem } from "../hooks";

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
);

function UserManagement() {
  const navigate = useNavigate();
  const {
    searchTerm,
    setSearchTerm,
    results: users,
    isSearching,
    searchHistory,
    clearSearch,
    removeFromHistory,
    handleManualSearch,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setFilters,
  } = useUserSearch(searchUsers, {
    enableHistory: true,
    maxHistoryItems: 10,
    initialPageSize: 20,
  });

  // Update filters when role filter changes
  React.useEffect(() => {
    setFilters({
      is_deleted: false,
      ...(roleFilter !== "all" && { role_id: roleFilter }),
    });
  }, [roleFilter, setFilters]);

  const isLoading = isSearching;

  // ──────── Create redirect ────────
  const handleCreateClick = useCallback(() => {
    navigate("/admin/users/create");
  }, [navigate]);

  // ──────── View Modal ────────
  const [viewUser, setViewUser] = useState<UserItem | null>(null);

  const handleViewClick = useCallback((user: UserItem) => {
    setViewUser(user);
  }, []);

  const handleViewClose = useCallback(() => {
    setViewUser(null);
  }, []);

  // ──────── Edit Modal ────────
  const [editUser, setEditUser] = useState<UserItem | null>(null);

  const handleEditClick = useCallback((user: UserItem) => {
    setEditUser(user);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditUser(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditUser(null);
    setCurrentPage(currentPage); // Refresh trang hiện tại
  }, [setCurrentPage, currentPage]);

  // ──────── Delete Dialog ────────
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

  const handleDeleteClick = useCallback((user: UserItem) => {
    setDeleteTarget(user);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    setDeleteTarget(null);
    setCurrentPage(1); // Refresh về trang 1
  }, [setCurrentPage]);

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
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <span className="text-slate-900 font-medium">Users</span>
            </nav>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                User Management
              </h2>
              <p className="text-slate-500">
                Total Users: {isLoading ? "..." : totalItems}
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                person_add
              </span>
              Create User
            </button>
          </div>
        </header>

        {/* Search Bar & Filters */}
        <div className="px-8 pb-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col gap-3">
              {/* Search Bar with Button - Full Width */}
              <div className="flex gap-3 w-full">
                <div className="flex-1">
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onClear={clearSearch}
                    onSearch={handleManualSearch}
                    isLoading={isSearching}
                    placeholder="Tìm kiếm user theo tên, email, số điện thoại..."
                    suggestions={searchHistory}
                    onSuggestionClick={setSearchTerm}
                    onRemoveSuggestion={removeFromHistory}
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleManualSearch}
                  disabled={isSearching}
                  className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    search
                  </span>
                  Tìm kiếm
                </button>
              </div>

              {/* Filters Row */}
              <div className="flex gap-3 items-center flex-wrap">
                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium cursor-pointer outline-none transition-all hover:border-slate-400 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="1">Admin</option>
                  <option value="3">Staff</option>
                  <option value="4">Customer</option>
                </select>

                {/* Info Text */}
                <div className="ml-auto text-slate-500 text-sm">
                  Tìm thấy{" "}
                  <strong className="text-slate-900">{totalItems}</strong> users
                </div>
              </div>
            </div>
          </div>
        </div>

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
                    Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}

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
                          <p className="text-slate-500 font-medium">
                            No users found
                          </p>
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
        userId={deleteTarget?.id ?? ""}
        userName={deleteTarget?.name ?? ""}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

export default UserManagement;
