import { useState, useCallback, useEffect } from "react";
import { Plus} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  UserTableRow,
  Pagination,
  EditUserModal,
  DeleteUserDialog,
  ViewUserModal,
  UserSearch,
  UserRestoreModal,
} from "../components";
import { useUserSearch, useUserStatus, useRestoreUser } from "../hooks";
import type { UserItem } from "../api/user.types";

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
      <div className="h-6 w-20 bg-slate-200 rounded-full" />
    </td>
    <td className="p-4">
      <div className="h-6 w-11 bg-slate-200 rounded-full" />
    </td>
    <td className="p-4" />
  </tr>
);

function UserManagement() {
  const navigate = useNavigate();

  // ──────── Search Hook ────────
  const searchState = useUserSearch();
  const {
    data: users,
    isLoading,
    executeSearch,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
  } = searchState;

  // Auto-correct currentPage if it exceeds totalPages after deletion
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  // ──────── Status Toggle ────────
  const { toggleStatus, updatingId } = useUserStatus();
  const [userStatus, setUserStatus] = useState<Record<string, boolean>>({});

  const handleToggleUserStatus = useCallback(
    (userId: string) => {
      // Get current status from state or user data
      const currentStatus =
        userStatus[userId] ??
        users.find((u) => u.id === userId)?.is_active ??
        false;

      console.log(
        `🎯 Toggle status clicked for user ${userId}. Current status: ${currentStatus}`,
      );

      // Optimistic UI update: Update state immediately
      setUserStatus((prev) => ({
        ...prev,
        [userId]: !currentStatus,
      }));

      // Call API to update user status
      toggleStatus(
        userId,
        currentStatus,
        () => {
          // onSuccess - Refresh data to sync with server
          executeSearch();
        },
        () => {
          // onError - Rollback to previous state
          setUserStatus((prev) => ({
            ...prev,
            [userId]: currentStatus,
          }));
        },
      );
    },
    [userStatus, users, toggleStatus, executeSearch],
  );

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
    executeSearch(); // Refresh data
  }, [executeSearch]);

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
    executeSearch(); // Refresh data
  }, [executeSearch]);

  // ──────── Restore Modal ────────
  const { restoreUser } = useRestoreUser();
  const [restoreTarget, setRestoreTarget] = useState<UserItem | null>(null);

  const handleRestoreClick = useCallback((user: UserItem) => {
    setRestoreTarget(user);
  }, []);

  const handleRestoreClose = useCallback(() => {
    setRestoreTarget(null);
  }, []);

  const handleRestoreSuccess = useCallback(() => {
    setRestoreTarget(null);
    executeSearch(); // Refresh data
  }, [executeSearch]);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <main className="flex flex-col flex-1">
        {/* Page Header */}
        <header className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 shrink-0 z-10">
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
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                User Management
              </h2>
              <p className="text-slate-500">
                Total Users: {isLoading ? "..." : totalItems}
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="inline-flex w-full sm:w-auto justify-center px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors items-center gap-2 text-sm"
            >
              <Plus size={18} />
              Create User
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
          {/* Filters & Search Bar */}
          <UserSearch
            searchState={searchState}
            onSearch={executeSearch}
            onClearFilters={clearFilters}
          />

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Phone
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Verify
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
                        isActive={userStatus[user.id] ?? user.is_active}
                        isUpdating={updatingId === user.id}
                        onToggleStatus={handleToggleUserStatus}
                        onView={handleViewClick}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onRestore={handleRestoreClick}
                      />
                    ))}

                  {/* Empty state */}
                  {!isLoading && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
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
                itemsPerPage={10}
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

      {/* Restore User Modal */}
      <UserRestoreModal
        isOpen={!!restoreTarget}
        targetId={restoreTarget?.id ?? ""}
        targetName={restoreTarget?.name ?? ""}
        onClose={handleRestoreClose}
        onConfirm={() => {
          if (restoreTarget) {
            restoreUser(restoreTarget.id, handleRestoreSuccess);
          }
        }}
      />
    </div>
  );
}

export default UserManagement;
